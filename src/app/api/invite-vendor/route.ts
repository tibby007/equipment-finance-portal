import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { Resend } from 'resend'

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

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null

function generateTemporaryPassword() {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%'
  let result = ''
  for (let i = 0; i < 12; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return result
}

export async function POST(request: Request) {
  try {
    const { brokerId, email, firstName, lastName, companyName, brokerCompanyName } = await request.json()

    // Validate required fields
    if (!brokerId || !email || !firstName || !lastName || !companyName) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    const tempPassword = generateTemporaryPassword()

    // Create vendor auth user
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email: email,
      password: tempPassword,
      email_confirm: true,
      user_metadata: {
        userType: 'vendor',
        first_name: firstName,
        last_name: lastName
      }
    })

    if (authError) {
      console.error('Error creating vendor auth user:', authError)
      return NextResponse.json(
        { error: authError.message },
        { status: 500 }
      )
    }

    if (!authData.user) {
      return NextResponse.json(
        { error: 'Failed to create vendor user' },
        { status: 500 }
      )
    }

    // Create vendor profile
    const { error: vendorError } = await supabaseAdmin
      .from('vendors')
      .insert({
        id: authData.user.id,
        broker_id: brokerId,
        email: email,
        first_name: firstName,
        last_name: lastName,
        company_name: companyName,
        password_hash: 'managed_by_supabase_auth', // Dummy value - actual password in Supabase Auth
        must_change_password: true,
      })

    if (vendorError) {
      console.error('Error creating vendor profile:', vendorError)
      // Try to delete the auth user if vendor creation fails
      await supabaseAdmin.auth.admin.deleteUser(authData.user.id)
      return NextResponse.json(
        { error: vendorError.message },
        { status: 500 }
      )
    }

    // Send invitation email if Resend is configured
    let emailResult = null
    if (resend) {
      try {
        const { data, error } = await resend.emails.send({
          from: 'VendorHub OS <noreply@emergestack.dev>',
          to: [email],
          subject: `Welcome to ${brokerCompanyName || 'VendorHub OS'} Network`,
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9fafb;">
              <div style="background: linear-gradient(135deg, #16a34a 0%, #ea580c 100%); padding: 30px; border-radius: 12px; text-align: center; margin-bottom: 30px;">
                <h1 style="color: white; margin: 0; font-size: 28px; font-weight: bold;">🎉 Welcome to VendorHub OS!</h1>
              </div>

              <div style="background: white; padding: 30px; border-radius: 12px; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);">
                <h2 style="color: #1f2937; margin-top: 0;">Hi ${firstName},</h2>

                <p style="color: #4b5563; font-size: 16px; line-height: 1.6;">
                  You've been invited to join <strong>${brokerCompanyName || 'VendorHub OS'}</strong>'s vendor network!
                </p>

                <div style="background: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
                  <h3 style="color: #1f2937; margin-top: 0;">🔐 Your Login Credentials:</h3>
                  <p style="margin: 5px 0; color: #374151;"><strong>📧 Email:</strong> ${email}</p>
                  <p style="margin: 5px 0; color: #374151;"><strong>🔑 Temporary Password:</strong> <code style="background: #e5e7eb; padding: 4px 8px; border-radius: 4px; font-family: monospace;">${tempPassword}</code></p>
                </div>

                <div style="text-align: center; margin: 30px 0;">
                  <a href="${process.env.NEXT_PUBLIC_APP_URL || 'https://www.vendorhubos.com'}/login" style="background: linear-gradient(135deg, #16a34a 0%, #ea580c 100%); color: white; padding: 12px 30px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block;">
                    🚀 Login to VendorHub OS
                  </a>
                </div>

                <div style="background: #fef3c7; border: 1px solid #f59e0b; padding: 15px; border-radius: 8px; margin: 20px 0;">
                  <p style="margin: 0; color: #92400e; font-size: 14px;">
                    <strong>⚠️ IMPORTANT:</strong> You'll be required to change your password on first login for security.
                  </p>
                </div>

                <p style="color: #6b7280; font-size: 14px; margin-top: 30px;">
                  Best regards,<br/>
                  The VendorHub OS Team
                </p>
              </div>
            </div>
          `,
        })

        if (error) {
          console.error('Error sending invitation email:', error)
        } else {
          emailResult = data
        }
      } catch (emailError) {
        console.error('Failed to send invitation email:', emailError)
        // Don't fail the whole request if email fails
      }
    }

    return NextResponse.json({
      success: true,
      vendor: authData.user,
      tempPassword: tempPassword, // Return for display to broker
      emailSent: !!emailResult
    })
  } catch (error) {
    console.error('Invite vendor API error:', error)
    return NextResponse.json(
      { error: 'Failed to invite vendor' },
      { status: 500 }
    )
  }
}
