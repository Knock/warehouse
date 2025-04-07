import { NextResponse } from 'next/server';
import twilio from 'twilio';

// Validate environment variables
const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const twilioPhoneNumber = process.env.TWILIO_PHONE_NUMBER;

console.log('Initializing SMS API route');
console.log('Twilio configuration check:', {
  hasAccountSid: !!accountSid,
  hasAuthToken: !!authToken,
  hasPhoneNumber: !!twilioPhoneNumber
});

if (!accountSid || !authToken || !twilioPhoneNumber) {
  console.error('Missing Twilio credentials:', {
    hasAccountSid: !!accountSid,
    hasAuthToken: !!authToken,
    hasPhoneNumber: !!twilioPhoneNumber
  });
  throw new Error('Missing required Twilio environment variables');
}

const twilioClient = twilio(accountSid, authToken);

export async function POST(request: Request) {
  console.log('Received SMS request');
  try {
    const body = await request.json();
    console.log('Request body:', body);

    const { name, mobile_number, area_stored } = body;

    // Validate required fields
    if (!name || !mobile_number || !area_stored) {
      console.warn('Missing required fields:', {
        hasName: !!name,
        hasMobileNumber: !!mobile_number,
        hasAreaStored: !!area_stored
      });
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Format phone number (remove any non-digit characters and add +91 for Indian numbers)
    const formattedNumber = `+91${mobile_number.replace(/\D/g, '')}`;
    console.log('Formatted phone number:', formattedNumber);

    console.log('Attempting to send SMS:', {
      to: formattedNumber,
      from: twilioPhoneNumber,
      name,
      area_stored
    });

    // Send the SMS
    const message = await twilioClient.messages.create({
      body: `Dear ${name}, your items have been retrieved successfully from ${area_stored}. Thank you for using our service.`,
      from: twilioPhoneNumber,
      to: formattedNumber
    });

    console.log('SMS sent successfully:', {
      messageSid: message.sid,
      status: message.status,
      dateCreated: message.dateCreated
    });

    return NextResponse.json({ 
      success: true, 
      messageSid: message.sid,
      note: 'SMS sent successfully'
    });
  } catch (error: any) {
    console.error('Error sending SMS:', {
      error: error.message,
      code: error.code,
      status: error.status,
      moreInfo: error.moreInfo
    });
    
    // Handle specific Twilio errors
    if (error.code === 21211) {
      console.warn('Invalid phone number format error');
      return NextResponse.json(
        { 
          success: false, 
          error: 'Invalid phone number format',
          note: 'Please ensure the phone number is in the correct format'
        },
        { status: 400 }
      );
    }

    if (error.code === 21608) {
      console.warn('Phone number not verified in Twilio trial account');
      return NextResponse.json(
        { 
          success: false, 
          error: 'Phone number not verified in Twilio trial account',
          note: 'This is a limitation of the Twilio trial account. The SMS will be sent once the account is upgraded to a full account.',
          isTrialAccount: true
        },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { 
        success: false, 
        error: error.message,
        note: 'An error occurred while sending the SMS'
      },
      { status: 500 }
    );
  }
} 