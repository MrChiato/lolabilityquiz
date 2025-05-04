import { parse } from 'cookie'
import { createClient } from '@supabase/supabase-js'

const supabaseAdmin = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
)

export default async function handler(req, res) {
    try {
        const cookies = parse(req.headers.cookie || '')
        if (cookies.admin_key !== process.env.ADMIN_KEY) {
            return res.status(403).json({ error: 'Not Authorized' })
        }

        if (req.method === 'GET') {
            const { data, error } = await supabaseAdmin
                .from('lol_spells')
                .select('*')
            if (error) {
                console.error('[/api/admin/spells] supabase error', error)
                return res.status(500).json({ error: 'Database Error' })
            }
            return res.status(200).json({ data })
        }

        if (req.method === 'DELETE') {
            const { id } = req.body;
            const { error } = await supabaseAdmin
                .from('lol_spells')
                .delete()
                .eq('id', id);
            if (error) {
                console.error('[/api/admin/spells] delete error', error);
                return res.status(500).json({ error: 'Database Error' });
            }
            return res.status(200).json({ data: null });
        }


        if (req.method === 'POST' || req.method === 'PUT') {
            const payload = req.body
            let result
            if (req.method === 'PUT') {
                result = await supabaseAdmin
                    .from('lol_spells')
                    .update(payload)
                    .eq('id', payload.id)
            } else {
                result = await supabaseAdmin
                    .from('lol_spells')
                    .insert([payload])
            }
            if (result.error) {
                console.error('[/api/admin/spells] upsert error', result.error)
                return res.status(500).json({ error: 'Database Error' })
            }
            return res.status(200).json({ data: result.data })
        }

        res.setHeader('Allow', 'GET, POST, PUT')
        return res.status(405).json({ error: 'Method Not Allowed' })
    } catch (err) {
        console.error('[/api/admin/spells] unhandled error', err)
        return res.status(500).json({ error: 'Internal Server Error' })
    }
}
