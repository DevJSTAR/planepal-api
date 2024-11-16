import crypto from 'crypto';

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const sessionToken = req.cookies['discord_session'];
    if (!sessionToken) {
        return res.status(401).json({ error: 'Not authenticated' });
    }

    try {
        // Verify Discord session
        const userResponse = await fetch('https://discord.com/api/users/@me', {
            headers: {
                Authorization: `Bearer ${sessionToken}`
            }
        });
        
        if (!userResponse.ok) {
            return res.status(401).json({ error: 'Invalid session' });
        }

        const discordUser = await userResponse.json();
        
        // Generate signature
        const timestamp = Date.now();
        const signature = crypto
            .createHmac('sha256', process.env.API_SECRET_KEY)
            .update(`${discordUser.id}-${timestamp}`)
            .digest('hex');

        res.status(200).json({ signature, timestamp });
    } catch (error) {
        console.error('Signature generation error:', error);
        res.status(500).json({ error: 'Failed to generate signature' });
    }
} 