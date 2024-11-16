import { connectToDatabase } from '../../utils/mongodb';
import UserStats from '../../models/UserStats';

export default async function handler(req, res) {
    // Verify admin key
    if (req.headers.authorization !== `Bearer ${process.env.ADMIN_KEY}`) {
        return res.status(401).json({ error: 'Unauthorized' });
    }

    const { action, threshold } = req.query;
    
    try {
        await connectToDatabase();

        switch (action) {
            case 'waves':
                // Delete users with waves above threshold
                await UserStats.deleteMany({
                    'stats.highestWave': { $gt: parseInt(threshold) || 100 }
                });
                return res.status(200).json({ message: `Deleted users with waves above ${threshold}` });

            case 'spam':
                // Delete spam usernames
                await UserStats.deleteMany({
                    username: { 
                        $regex: /(get gooner rced|notequa|spam)/i 
                    }
                });
                return res.status(200).json({ message: 'Deleted spam users' });

            case 'inactive':
                // Delete inactive users (no activity in 30 days)
                const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
                await UserStats.deleteMany({
                    lastUpdated: { $lt: thirtyDaysAgo }
                });
                return res.status(200).json({ message: 'Deleted inactive users' });

            default:
                return res.status(400).json({ error: 'Invalid action specified' });
        }
    } catch (error) {
        console.error('Cleanup error:', error);
        res.status(500).json({ error: 'Cleanup failed' });
    }
} 