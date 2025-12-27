import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase/server-api'

// GET - Retrieve admin settings
export async function GET(request: NextRequest) {
  try {
    const supabase = await createServerSupabaseClient(request)
    
    // Verify admin access
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    if (profile?.role !== 'admin') {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 })
    }

    // Get settings (there should only be one record)
    const { data: settings, error: settingsError } = await supabase
      .from('admin_settings')
      .select('*')
      .limit(1)
      .single()

    if (settingsError) {
      // If no settings exist, return defaults
      if (settingsError.code === 'PGRST116') {
        return NextResponse.json({
          email_alert_enabled: true,
        })
      }
      console.error('Error fetching admin settings:', settingsError)
      return NextResponse.json(
        { error: 'Failed to fetch settings' },
        { status: 500 }
      )
    }

    return NextResponse.json(settings)
  } catch (error: any) {
    console.error('Error in GET /api/admin/settings:', error)
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    )
  }
}

// PUT - Update admin settings
export async function PUT(request: NextRequest) {
  try {
    const supabase = await createServerSupabaseClient(request)
    
    // Verify admin access
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    if (profile?.role !== 'admin') {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 })
    }

    const body = await request.json()
    const { email_alert_enabled } = body

    // Validate input
    if (typeof email_alert_enabled !== 'boolean') {
      return NextResponse.json(
        { error: 'email_alert_enabled must be a boolean' },
        { status: 400 }
      )
    }

    // Check if settings exist
    const { data: existingSettings } = await supabase
      .from('admin_settings')
      .select('id')
      .limit(1)
      .single()

    let result
    if (existingSettings) {
      // Update existing settings
      const { data, error } = await supabase
        .from('admin_settings')
        .update({ email_alert_enabled })
        .eq('id', existingSettings.id)
        .select()
        .single()

      if (error) {
        console.error('Error updating admin settings:', error)
        return NextResponse.json(
          { error: 'Failed to update settings' },
          { status: 500 }
        )
      }
      result = data
    } else {
      // Insert new settings
      const { data, error } = await supabase
        .from('admin_settings')
        .insert({ email_alert_enabled })
        .select()
        .single()

      if (error) {
        console.error('Error creating admin settings:', error)
        return NextResponse.json(
          { error: 'Failed to create settings' },
          { status: 500 }
        )
      }
      result = data
    }

    return NextResponse.json(result)
  } catch (error: any) {
    console.error('Error in PUT /api/admin/settings:', error)
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    )
  }
}

