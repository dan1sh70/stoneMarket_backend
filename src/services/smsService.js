const twilio = require('twilio');

const sendSMS = async (to, body) => {
  const accountSid = process.env.TWILIO_ACCOUNT_SID;
  const authToken = process.env.TWILIO_AUTH_TOKEN;
  const fromNumber = process.env.TWILIO_PHONE_NUMBER;

  if (accountSid && authToken && fromNumber) {
    try {
      const client = twilio(accountSid, authToken);
      const message = await client.messages.create({
        body: body,
        from: fromNumber,
        to: to
      });
      return message;
    } catch (err) {
      console.error(`Twilio SMS failed to send to ${to}. Error: ${err.message}`);
      console.log(`[FALLBACK SMS] To: ${to} | Body: ${body}`);
      return null;
    }
  } else {
    // If not configured, print mock log
    const otpMatch = body.match(/\b\d{6}\b/);
    const otpCode = otpMatch ? otpMatch[0] : '';
    console.log(`[MOCK SMS] OTP for ${to} is ${otpCode}`);
    return null;
  }
};

module.exports = sendSMS;
