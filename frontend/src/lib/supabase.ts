import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://placeholder.supabase.co'
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'placeholder-anon-key'

const isSupabaseConfigured = import.meta.env.VITE_SUPABASE_URL && import.meta.env.VITE_SUPABASE_ANON_KEY

export const supabase = isSupabaseConfigured 
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null

// Helper function to check if Supabase is properly configured and tables exist
export const checkSupabaseConnection = async () => {
  if (!isSupabaseConfigured || !supabase) {
    console.warn('⚠️ Supabase not configured - using local data only')
    console.log('💡 To enable Supabase features, add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY to your .env file')
    return false
  }

  try {
    // Check basic Supabase connection only
    const { data, error } = await supabase!.auth.getSession()
    
    if (error && error.message.includes('Invalid API key')) {
      console.error('❌ Invalid Supabase API key')
      return false
    }
    
    // Basic connection successful
    console.log('✅ Supabase connected successfully')
    console.warn('⚠️ Database tables may not be created yet. Please create the database schema in your Supabase dashboard.')
    console.log('📋 Required tables: users, job_leads, quote_requests')
    return 'tables_missing'
    
  } catch (error) {
    console.error('❌ Supabase connection failed:', error)
    return false
  }
}