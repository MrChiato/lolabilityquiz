<<<<<<< HEAD
import { serialize } from 'cookie'

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        res.setHeader('Allow', 'POST')
        return res.status(405).json({ error: 'Method Not Allowed' })
    }

    try {
        const { key } = req.body || {}
        if (!key) {
            return res.status(400).json({ error: 'Missing key' })
        }

        if (key === process.env.ADMIN_KEY) {
            res.setHeader('Set-Cookie', serialize('admin_key', key, {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                sameSite: 'strict',
                path: '/',
                maxAge: 60 * 60,
            }))
            return res.status(200).json({ ok: true })
        } else {
            return res.status(401).json({ error: 'Invalid key' })
        }
    } catch (err) {
        console.error('[/api/admin/login] error', err)
        return res.status(500).json({ error: 'Internal Server Error' })
    }
}
=======
import { serialize } from 'cookie'

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        res.setHeader('Allow', 'POST')
        return res.status(405).json({ error: 'Method Not Allowed' })
    }

    try {
        const { key } = req.body || {}
        if (!key) {
            return res.status(400).json({ error: 'Missing key' })
        }

        if (key === process.env.ADMIN_KEY) {
            res.setHeader('Set-Cookie', serialize('admin_key', key, {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                sameSite: 'strict',
                path: '/',
                maxAge: 60 * 60,
            }))
            return res.status(200).json({ ok: true })
        } else {
            return res.status(401).json({ error: 'Invalid key' })
        }
    } catch (err) {
        console.error('[/api/admin/login] error', err)
        return res.status(500).json({ error: 'Internal Server Error' })
    }
}
>>>>>>> 156f4a47dea51c9716f470f617c9c26b0b5cf27b
