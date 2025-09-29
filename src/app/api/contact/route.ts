import { NextRequest, NextResponse } from 'next/server'
import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

export async function POST(request: NextRequest) {
  try {
    const {
      firstName,
      lastName,
      email,
      company,
      phone,
      message
    } = await request.json()

    const { data, error } = await resend.emails.send({
      from: 'VendorHub OS Contact <noreply@emergestack.dev>',
      to: ['support@emergestack.dev'],
      subject: `New Contact Form Submission from ${firstName} ${lastName}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: linear-gradient(135deg, #16a34a 0%, #ea580c 100%); padding: 30px; border-radius: 12px; text-align: center; margin-bottom: 30px;">
            <h1 style="color: white; margin: 0; font-size: 24px;">New Contact Form Submission</h1>
          </div>

          <div style="background: white; padding: 30px; border-radius: 12px; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);">
            <h2 style="color: #1f2937; margin-top: 0;">Contact Details</h2>

            <div style="margin: 20px 0; padding: 15px; background: #f9fafb; border-radius: 8px;">
              <p style="margin: 5px 0;"><strong>Name:</strong> ${firstName} ${lastName}</p>
              <p style="margin: 5px 0;"><strong>Email:</strong> ${email}</p>
              <p style="margin: 5px 0;"><strong>Company:</strong> ${company}</p>
              <p style="margin: 5px 0;"><strong>Phone:</strong> ${phone}</p>
            </div>

            <h3 style="color: #1f2937;">Message</h3>
            <div style="background: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <p style="margin: 0; color: #374151; line-height: 1.6;">${message}</p>
            </div>

            <div style="background: #dbeafe; border: 1px solid #3b82f6; padding: 15px; border-radius: 8px; margin: 20px 0;">
              <p style="margin: 0; color: #1e40af; font-size: 14px;">
                <strong>Next Steps:</strong> Please respond to this inquiry within 24 hours.
              </p>
            </div>
          </div>

          <div style="text-align: center; padding: 20px; color: #9ca3af; font-size: 12px;">
            <p>This email was sent from the VendorHub OS contact form.</p>
            <p>Submitted on ${new Date().toLocaleDateString()} at ${new Date().toLocaleTimeString()}</p>
          </div>
        </div>
      `,
    })

    if (error) {
      console.error('Contact form email error:', error)
      return NextResponse.json(
        { error: 'Failed to send message', details: error },
        { status: 500 }
      )
    }

    console.log('Contact form email sent successfully:', data)
    return NextResponse.json({ success: true, data })

  } catch (error) {
    console.error('Contact API error:', error)
    return NextResponse.json(
      { error: 'Internal server error', details: error },
      { status: 500 }
    )
  }
}