<<<<<<< HEAD
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.VITE_SUPABASE_ANON_KEY
)

export default async function handler(req, res) {
  console.log("⚡️ /api/image/[id] invoked with", req.query.id);
  const { id } = req.query
  if (Array.isArray(id)) return res.status(400).send('bad id')
  const { data, error } = await supabase
    .from('lol_spells')
    .select('icon_url')
    .eq('id', id)
    .single()

  if (error || !data?.icon_url) {
    return res.status(404).send('not found')
  }

  const up = await fetch(data.icon_url)
  if (!up.ok) return res.status(up.status).send('upstream error')

  const contentType = up.headers.get('content-type') || 'application/octet-stream'
  const buffer = await up.arrayBuffer()

  res.setHeader('Content-Type', contentType)
  res.send(Buffer.from(buffer))
}
=======
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.VITE_SUPABASE_ANON_KEY
)

export default async function handler(req, res) {
  console.log("⚡️ /api/image/[id] invoked with", req.query.id);
  const { id } = req.query
  if (Array.isArray(id)) return res.status(400).send('bad id')
  const { data, error } = await supabase
    .from('lol_spells')
    .select('icon_url')
    .eq('id', id)
    .single()

  if (error || !data?.icon_url) {
    return res.status(404).send('not found')
  }

  const up = await fetch(data.icon_url)
  if (!up.ok) return res.status(up.status).send('upstream error')

  const contentType = up.headers.get('content-type') || 'application/octet-stream'
  const buffer = await up.arrayBuffer()

  res.setHeader('Content-Type', contentType)
  res.send(Buffer.from(buffer))
}
>>>>>>> 156f4a47dea51c9716f470f617c9c26b0b5cf27b
