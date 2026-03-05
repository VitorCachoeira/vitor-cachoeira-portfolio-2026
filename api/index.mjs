import express from 'express'
import cors from 'cors'
import pkg from 'pg'

const { Pool } = pkg

const PORT = process.env.PORT || 3000
const DATABASE_URL = process.env.DATABASE_URL
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'admin123@fx30495'
const CORS_ORIGIN = process.env.CORS_ORIGIN || '*'

if (!DATABASE_URL) {
  console.warn('[api] DATABASE_URL não definido. A API não conseguirá persistir dados.')
}

const app = express()

app.use(
  cors({
    origin: CORS_ORIGIN === '*' ? '*' : CORS_ORIGIN.split(',').map((v) => v.trim()),
  }),
)
app.use(express.json())

const pool = DATABASE_URL
  ? new Pool({
      connectionString: DATABASE_URL,
      max: 3,
    })
  : null

// Conteúdo gerenciado exclusivamente pelo painel /admin.
// Default vazio — se o banco não tiver dados, a home mostra lista vazia.
const DEFAULT_STATE = {
  projects: [],
  roles: ['DIRECTOR', 'CINEMATOGRAPHER', 'EDITOR', 'COLORIST', 'SOUNDTRACK'],
  aboutMeImage: 'https://pub-76ffd52f8d4541deba0aac1dbba56bf2.r2.dev/2fofo-nova_insta.jpg.jpeg',
}

async function ensureTable() {
  if (!pool) return
  await pool.query(`
    CREATE TABLE IF NOT EXISTS site_state (
      id integer primary key,
      data jsonb NOT NULL
    )
  `)
}

async function getState() {
  if (!pool) {
    return DEFAULT_STATE
  }

  await ensureTable()
  const result = await pool.query('SELECT data FROM site_state WHERE id = 1')
  if (result.rowCount === 0) {
    await pool.query('INSERT INTO site_state (id, data) VALUES (1, $1)', [DEFAULT_STATE])
    return DEFAULT_STATE
  }

  const data = result.rows[0].data || {}
  return {
    projects: Array.isArray(data.projects) ? data.projects : DEFAULT_STATE.projects,
    roles: Array.isArray(data.roles) && data.roles.length > 0 ? data.roles : DEFAULT_STATE.roles,
    aboutMeImage: data.aboutMeImage || DEFAULT_STATE.aboutMeImage,
  }
}

async function saveState(nextState) {
  if (!pool) {
    return
  }

  await ensureTable()
  await pool.query(
    `
    INSERT INTO site_state (id, data)
    VALUES (1, $1)
    ON CONFLICT (id)
    DO UPDATE SET data = EXCLUDED.data
  `,
    [nextState],
  )
}

app.get('/', (_req, res) => {
  res.send('Portfolio admin API is running.')
})

app.get('/api/state', async (_req, res) => {
  try {
    const state = await getState()
    res.json(state)
  } catch (err) {
    console.error('Error loading state', err)
    res.status(500).json({ error: 'Failed to load state' })
  }
})

app.put('/api/state', async (req, res) => {
  try {
    const password = req.header('x-admin-password') || ''
    if (!ADMIN_PASSWORD || password !== ADMIN_PASSWORD) {
      return res.status(401).json({ error: 'Unauthorized' })
    }

    const body = req.body || {}
    const nextState = {
      projects: Array.isArray(body.projects) ? body.projects : DEFAULT_STATE.projects,
      roles: Array.isArray(body.roles) ? body.roles : DEFAULT_STATE.roles,
      aboutMeImage: body.aboutMeImage || DEFAULT_STATE.aboutMeImage,
    }

    await saveState(nextState)
    res.json({ ok: true })
  } catch (err) {
    console.error('Error saving state', err)
    res.status(500).json({ error: 'Failed to save state' })
  }
})

app.listen(PORT, () => {
  console.log(`[api] Listening on port ${PORT}`)
})

