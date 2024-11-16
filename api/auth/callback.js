const fetch = require('node-fetch');

const CLIENT_ID = '1307079117438582944';
const CLIENT_SECRET = 'vZzmCFtmJaGrs9ahm11ZQcaSJmYKZWUn';
const REDIRECT_URI = 'https://cubeshooter.vercel.app/api/auth/callback';
const WEBHOOK_URL = 'https://discord.com/api/webhooks/1307090567431323789/oGyCPMT98LC1AwgfYJNZXZBQJG2aM2JBEgMvzdThE1nDQyjPw2F5AAFQZUKnVH8YPn5r';

async function sendLoginWebhook(user) {
    try {
        const avatarUrl = user.avatar 
            ? `https://cdn.discordapp.com/avatars/${user.id}/${user.avatar}.png`
            : 'https://cdn.discordapp.com/embed/avatars/0.png';

        const embed = {
            title: 'New User Login',
            color: 0x5865F2,
            timestamp: new Date().toISOString(),
            thumbnail: {
                url: avatarUrl
            },
            fields: [
                {
                    name: 'Username',
                    value: user.username,
                    inline: false
                },
                {
                    name: 'Nickname',
                    value: user.global_name || 'None',
                    inline: false
                },
                {
                    name: 'Email',
                    value: user.email || 'Not provided',
                    inline: false
                },
                {
                    name: 'User ID',
                    value: user.id,
                    inline: false
                }
            ]
        };

        await fetch(WEBHOOK_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                embeds: [embed]
            })
        });
    } catch (error) {
        console.error('Failed to send webhook:', error);
    }
}

export default async function handler(req, res) {
    const { code } = req.query;

    if (!code) {
        return res.redirect('/?error=no_code');
    }

    try {
        const tokenRes = await fetch('https://discord.com/api/oauth2/token', {
            method: 'POST',
            body: new URLSearchParams({
                client_id: CLIENT_ID,
                client_secret: CLIENT_SECRET,
                code,
                grant_type: 'authorization_code',
                redirect_uri: REDIRECT_URI,
                scope: 'identify email',
            }),
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
        });

        const tokens = await tokenRes.json();

        const userRes = await fetch('https://discord.com/api/users/@me', {
            headers: {
                Authorization: `Bearer ${tokens.access_token}`,
            },
        });

        const user = await userRes.json();
        await sendLoginWebhook(user);

        const avatarUrl = user.avatar 
            ? `https://cdn.discordapp.com/avatars/${user.id}/${user.avatar}.png`
            : 'https://cdn.discordapp.com/embed/avatars/0.png';

        res.setHeader('Set-Cookie', `discord_session=${tokens.access_token}; Path=/; HttpOnly; Secure; SameSite=Strict`);

        res.redirect(`/?logged_in=true&avatar=${encodeURIComponent(avatarUrl)}&username=${encodeURIComponent(user.username)}&userId=${user.id}`);
    } catch (error) {
        console.error('Error:', error);
        res.redirect('/?error=auth_failed');
    }
}