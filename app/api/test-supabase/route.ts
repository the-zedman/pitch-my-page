import { NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase/server'

export async function GET() {
  try {
    const supabase = createServerSupabaseClient()
    
    // Test 1: Check if we can connect to Supabase
    const { data: healthCheck, error: healthError } = await supabase
      .from('profiles')
      .select('count')
      .limit(1)
    
    if (healthError) {
      // If table doesn't exist, that's okay - we're just testing connection
      if (healthError.code === '42P01') {
        return NextResponse.json({
          status: 'partial',
          message: 'Supabase connection successful, but profiles table not found',
          details: 'Please run the database schema SQL script in Supabase',
          error: healthError.message,
          tests: {
            connection: '✅ Connected',
            table_exists: '❌ Profiles table not found',
            recommendation: 'Run database/schema.sql in Supabase SQL Editor'
          }
        })
      }
      
      return NextResponse.json({
        status: 'error',
        message: 'Supabase connection error',
        error: healthError.message,
        code: healthError.code,
        tests: {
          connection: '❌ Failed',
          error_details: healthError
        }
      }, { status: 500 })
    }
    
    // Test 2: Try to query the profiles table (should work if schema is set up)
    const { count, error: countError } = await supabase
      .from('profiles')
      .select('*', { count: 'exact', head: true })
    
    // Test 3: Check if auth is working
    const { data: { session }, error: sessionError } = await supabase.auth.getSession()
    
    return NextResponse.json({
      status: 'success',
      message: 'Supabase is configured correctly!',
      tests: {
        connection: '✅ Connected',
        profiles_table: countError ? '❌ Error querying' : '✅ Accessible',
        auth_service: sessionError ? '⚠️ Auth check failed' : '✅ Auth service available',
        profile_count: count ?? 0
      },
      environment: {
        supabase_url: process.env.NEXT_PUBLIC_SUPABASE_URL ? '✅ Set' : '❌ Missing',
        supabase_key: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? '✅ Set' : '❌ Missing',
      },
      details: {
        profiles_in_db: count ?? 0,
        has_session: !!session
      }
    })
  } catch (error: any) {
    return NextResponse.json({
      status: 'error',
      message: 'Failed to test Supabase connection',
      error: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined,
      tests: {
        connection: '❌ Failed',
        error: error.message
      }
    }, { status: 500 })
  }
}

