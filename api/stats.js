import { connectToDatabase } from '../utils/mongodb';
import UserStats from '../models/UserStats';
import crypto from 'crypto';

if (!process.env.MONGODB_URI || !process.env.API_SECRET_KEY) {
    throw new Error('Required environment variables are missing');
}

const AUTHORIZED_DOMAINS = ['cubeshooter.vercel.app', 'localhost:3000'];

export default async function handler(req, res) {
    try {
        // Check origin
        const origin = req.headers.origin || req.headers.referer;
        if (!origin || !AUTHORIZED_DOMAINS.some(domain => origin.includes(domain))) {
            return res.status(403).json({ error: 'Unauthorized origin' });
        }

        if (req.method === 'POST') {
            const { userId, stats, username, avatar, timestamp, signature } = req.body;
            
            // Verify request signature
            const expectedSignature = crypto
                .createHmac('sha256', process.env.API_SECRET_KEY)
                .update(`${userId}-${timestamp}`)
                .digest('hex');

            if (signature !== expectedSignature || Date.now() - timestamp > 30000) {
                return res.status(403).json({ error: 'Invalid signature or expired request' });
            }

            // Rate limiting
            const userIp = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
            if (await checkRateLimit(userIp)) {
                return res.status(429).json({ error: 'Too many requests' });
            }

            // Validate stats values
            if (!validateStats(stats)) {
                console.log('Invalid stats detected:', stats);
                return res.status(400).json({ error: 'Invalid stats values' });
            }

            await connectToDatabase();
            
            let userStats = await UserStats.findOne({ userId });
            
            if (!userStats) {
                userStats = new UserStats({
                    userId,
                    username,
                    avatar,
                    stats: {
                        highestWave: Math.min(stats.highestWave || 0, 1000), // Cap maximum wave
                        enemiesKilled: stats.enemiesKilled || 0,
                        bulletsFired: stats.bulletsFired || 0,
                        deaths: stats.deaths || 0,
                        damageDealt: stats.damageDealt || 0,
                        damageTaken: stats.damageTaken || 0
                    }
                });
            } else {
                userStats.username = username;
                userStats.avatar = avatar;
                // Only update if new wave is higher but within reasonable limits
                if (stats.highestWave > userStats.stats.highestWave && stats.highestWave <= 1000) {
                    userStats.stats.highestWave = stats.highestWave;
                }
                // Validate and cap other stat increases
                userStats.stats.enemiesKilled += Math.min(stats.enemiesKilled || 0, 100);
                userStats.stats.bulletsFired += Math.min(stats.bulletsFired || 0, 1000);
                userStats.stats.deaths += Math.min(stats.deaths || 0, 1);
                userStats.stats.damageDealt += Math.min(stats.damageDealt || 0, 2500);
                userStats.stats.damageTaken += Math.min(stats.damageTaken || 0, 1000);
            }
            
            await userStats.save();
            res.status(200).json(userStats);
        } else if (req.method === 'GET') {
            if (req.query.userId) {
                const userStats = await UserStats.findOne({ userId: req.query.userId });
                if (!userStats) {
                    return res.status(404).json({ error: 'User stats not found' });
                }
                res.status(200).json(userStats);
            } else {
                const leaderboard = await UserStats.find()
                    .sort({ 'stats.highestWave': -1 })
                    .limit(100);
                res.status(200).json(leaderboard);
            }
        }
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
}

function validateStats(stats) {
    // Add more strict validation
    if (!stats || typeof stats !== 'object') return false;
    
    const maxValues = {
        highestWave: 100,
        enemiesKilled: 1000,
        bulletsFired: 10000,
        deaths: 100,
        damageDealt: 100000,
        damageTaken: 100000
    };

    for (const [key, value] of Object.entries(stats)) {
        if (typeof value !== 'number' || value < 0 || value > maxValues[key]) {
            return false;
        }
    }

    return true;
}

// Stricter rate limiting
const rateLimit = new Map();
async function checkRateLimit(ip) {
    const now = Date.now();
    const lastRequest = rateLimit.get(ip);
    
    if (lastRequest && now - lastRequest < 2000) { // 2 second cooldown
        return true;
    }
    
    rateLimit.set(ip, now);
    return false;
} 