import { connectToDatabase } from '../../utils/mongodb';
import UserStats from '../../models/UserStats';

export default async function handler(req, res) {
    if (req.headers.authorization !== `Bearer ${process.env.ADMIN_KEY}`) {
        return res.status(401).json({ error: 'Unauthorized' });
    }

    try {
        await connectToDatabase();
        
        const stats = {
            totalUsers: await UserStats.countDocuments(),
            averageWave: await UserStats.aggregate([
                { $group: { _id: null, avg: { $avg: '$stats.highestWave' } } }
            ]),
            topPlayers: await UserStats.find()
                .sort({ 'stats.highestWave': -1 })
                .limit(10)
                .select('username stats.highestWave'),
            recentUsers: await UserStats.find()
                .sort({ lastUpdated: -1 })
                .limit(5)
        };

        res.status(200).json(stats);
    } catch (error) {
        console.error('Stats error:', error);
        res.status(500).json({ error: 'Failed to fetch admin stats' });
    }
} 