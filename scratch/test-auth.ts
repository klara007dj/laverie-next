import { verifyToken } from '../src/lib/auth'
import fs from 'fs'
import path from 'path'

// Load environment variables manually
try {
  const envPath = path.resolve(process.cwd(), '.env.local')
  console.log('Env path resolved:', envPath)
  if (fs.existsSync(envPath)) {
    const env = fs.readFileSync(envPath, 'utf8')
    console.log('Env file content length:', env.length)
    env.split('\n').forEach(line => {
      const parts = line.split('=')
      if (parts.length === 2) {
        const key = parts[0].trim()
        const val = parts[1].trim().replace(/"/g, '').replace(/\r/g, '')
        process.env[key] = val
        console.log(`Loaded env var: ${key} = ${val}`)
      }
    })
  } else {
    console.error('Env file does not exist at:', envPath)
  }
} catch (e) {
  console.error('Failed to load .env.local:', e)
}

async function test() {
  const credentials = { email: 'martin.d@gmail.com', password: 'Client2025!' }
  
  console.log('1. Simulating login POST /api/auth/connexion with:', credentials)
  
  // Call internal API or simulate logic
  // Let's import the route handler logic directly or fetch localhost
  try {
    const res = await fetch('http://localhost:3000/api/auth/connexion', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(credentials)
    })
    
    console.log('Response status:', res.status)
    const data: any = await res.json()
    console.log('Response data:', JSON.stringify(data, null, 2))
    
    if (!res.ok) {
      console.error('Login failed')
      return
    }
    
    const token = data.token
    console.log('\n2. Verifying token:', token)
    const verified = verifyToken(token)
    console.log('Verified payload:', verified)
    
    console.log('\n3. Simulating GET /api/dashboard with token...')
    const dashRes = await fetch('http://localhost:3000/api/dashboard', {
      headers: { Authorization: `Bearer ${token}` }
    })
    
    console.log('Dashboard response status:', dashRes.status)
    const dashData = await dashRes.json()
    console.log('Dashboard response data user:', dashData.user ? 'OK (User present)' : 'MISSING USER')
    console.log('Dashboard response complete:', JSON.stringify(dashData, null, 2))
    
  } catch (error) {
    console.error('Error in test:', error)
  }
}

test()
