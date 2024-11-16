import mongoose from 'mongoose';

const userStatsSchema = new mongoose.Schema({
    userId: { type: String, required: true, unique: true },
    username: { type: String, required: true },
    avatar: String,
    stats: {
        highestWave: { type: Number, default: 0 },
        enemiesKilled: { type: Number, default: 0 },
        bulletsFired: { type: Number, default: 0 },
        deaths: { type: Number, default: 0 },
        damageDealt: { type: Number, default: 0 },
        damageTaken: { type: Number, default: 0 }
    },
    lastUpdated: { type: Date, default: Date.now }
});

export default mongoose.models.UserStats || mongoose.model('UserStats', userStatsSchema); 