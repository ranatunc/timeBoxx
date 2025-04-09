const twilio = require('twilio');

const sendSmsVerificationCode = (phoneNumber, code) => {
  const client = twilio('your_twilio_account_sid', 'your_twilio_auth_token');

  client.messages.create({
    body: `Your verification code is: ${code}`,
    to: phoneNumber,
    from: 'your_twilio_phone_number',
  })
  .then((message) => console.log(message.sid))
  .catch((error) => console.log(error));
};

module.exports = sendSmsVerificationCode;
