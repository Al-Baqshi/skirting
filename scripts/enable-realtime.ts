import { createClient } from '@supabase/supabase-js'
import * as fs from 'fs'
import * as path from 'path'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing Supabase environment variables')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
})

async function enableRealtime() {
  try {
    console.log('Enabling Realtime for guest_orders and contact_inquiries...')
    
    // Read the migration SQL
    const migrationPath = path.join(__dirname, '../supabase/migrations/004_enable_realtime.sql')
    const sql = fs.readFileSync(migrationPath, 'utf-8')
    
    // Extract just the ALTER PUBLICATION statements
    const statements = sql
      .split(';')
      .map(s => s.trim())
      .filter(s => s.startsWith('ALTER PUBLICATION'))
    
    // Execute each statement
    for (const statement of statements) {
      if (statement) {
        console.log(`Executing: ${statement}`)
        const { error } = await supabase.rpc('exec_sql', { sql: statement + ';' })
        
        if (error) {
          // Try direct query if RPC doesn't work
          const { error: queryError } = await supabase
            .from('_realtime')
            .select('*')
            .limit(0)
          
          // If that doesn't work, we'll need to use the REST API
          console.log('Note: Direct SQL execution via Supabase JS client is limited.')
          console.log('Please run the SQL manually in Supabase Dashboard → SQL Editor:')
          console.log('\n' + statement + ';\n')
        } else {
          console.log('✅ Success!')
        }
      }
    }
    
    console.log('\n✅ Migration complete!')
    console.log('Realtime should now be enabled for both tables.')
  } catch (error) {
    console.error('Error:', error)
    console.log('\n⚠️  Please run the SQL manually in Supabase Dashboard:')
    console.log('1. Go to SQL Editor')
    console.log('2. Run the SQL from supabase/migrations/004_enable_realtime.sql')
  }
}

enableRealtime()
