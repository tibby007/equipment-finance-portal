import { NextRequest, NextResponse } from 'next/server'
import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

export async function POST(request: NextRequest) {
  try {
    const {
      to,
      subject,
      vendorName,
      brokerCompany,
      loginUrl,
      email,
      temporaryPassword
    } = await request.json()

    const { data, error } = await resend.emails.send({
      from: 'VendorHub OS <noreply@vendorhubos.com>', // Replace with your verified domain
      to: [to],
      subject: subject,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9fafb;">
          <div style="background: linear-gradient(135deg, #16a34a 0%, #ea580c 100%); padding: 30px; border-radius: 12px; text-align: center; margin-bottom: 30px;">
            <h1 style="color: white; margin: 0; font-size: 28px; font-weight: bold;">🎉 Welcome to VendorHub OS!</h1>
          </div>

          <div style="background: white; padding: 30px; border-radius: 12px; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);">
            <h2 style="color: #1f2937; margin-top: 0;">Hi ${vendorName},</h2>

            <p style="color: #4b5563; font-size: 16px; line-height: 1.6;">
              You've been invited to join <strong>${brokerCompany}</strong>'s vendor network on VendorHub OS!
            </p>

            <div style="background: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <h3 style="color: #1f2937; margin-top: 0;">🔐 Your Login Credentials:</h3>
              <p style="margin: 5px 0; color: #374151;"><strong>📧 Email:</strong> ${email}</p>
              <p style="margin: 5px 0; color: #374151;"><strong>🔑 Temporary Password:</strong> <code style="background: #e5e7eb; padding: 4px 8px; border-radius: 4px; font-family: monospace;">${temporaryPassword}</code></p>
            </div>

            <div style="text-align: center; margin: 30px 0;">
              <a href="${loginUrl}" style="background: linear-gradient(135deg, #16a34a 0%, #ea580c 100%); color: white; padding: 12px 30px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block;">
                🚀 Login to VendorHub OS
              </a>
            </div>

            <div style="background: #fef3c7; border: 1px solid #f59e0b; padding: 15px; border-radius: 8px; margin: 20px 0;">
              <p style="margin: 0; color: #92400e; font-size: 14px;">
                <strong>⚠️ IMPORTANT:</strong> You'll be required to change your password on first login for security.
              </p>
            </div>

            <p style="color: #6b7280; font-size: 14px; margin-top: 30px;">
              Best regards,<br>
              The VendorHub OS Team
            </p>
          </div>

          <div style="text-align: center; padding: 20px; color: #9ca3af; font-size: 12px;">
            <p>This email was sent by VendorHub OS. If you didn't expect this invitation, please ignore this email.</p>
          </div>
        </div>
      `,
    })

    if (error) {
      console.error('Resend error:', error)
      return NextResponse.json(
        { error: 'Failed to send email', details: error },
        { status: 500 }
      )
    }

    console.log('Email sent successfully:', data)
    return NextResponse.json({ success: true, data })

  } catch (error) {
    console.error('API error:', error)
    return NextResponse.json(
      { error: 'Internal server error', details: error },
      { status: 500 }
    )
  }
}