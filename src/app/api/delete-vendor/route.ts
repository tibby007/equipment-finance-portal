import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
)

export async function POST(request: Request) {
  try {
    const { vendorId, brokerId } = await request.json()

    if (!vendorId || !brokerId) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Verify the vendor belongs to this broker
    const { data: vendor, error: vendorCheckError } = await supabaseAdmin
      .from('vendors')
      .select('id, broker_id, email')
      .eq('id', vendorId)
      .eq('broker_id', brokerId)
      .single()

    if (vendorCheckError || !vendor) {
      return NextResponse.json(
        { error: 'Vendor not found or does not belong to this broker' },
        { status: 404 }
      )
    }

    // Delete from vendors table first (this should cascade to deals, etc.)
    const { error: deleteVendorError } = await supabaseAdmin
      .from('vendors')
      .delete()
      .eq('id', vendorId)

    if (deleteVendorError) {
      console.error('Error deleting vendor:', deleteVendorError)
      return NextResponse.json(
        { error: deleteVendorError.message },
        { status: 500 }
      )
    }

    // Delete from auth.users
    const { error: deleteAuthError } = await supabaseAdmin.auth.admin.deleteUser(vendorId)

    if (deleteAuthError) {
      console.error('Error deleting vendor auth user:', deleteAuthError)
      // Don't fail the whole request if auth deletion fails
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Delete vendor API error:', error)
    return NextResponse.json(
      { error: 'Failed to delete vendor' },
      { status: 500 }
    )
  }
}
