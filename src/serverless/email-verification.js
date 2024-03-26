const functions = require('@google-cloud/functions-framework');
const mailgun = require('mailgun-js');
import EamilTracker from '../models/email-tracker.js';

// Register a CloudEvent callback with the Functions Framework that will
// be executed when the Pub/Sub trigger topic receives a message.
functions.cloudEvent('helloPubSub', async (cloudEvent) => {
  try {
    // The Pub/Sub message is passed as the CloudEvent's data payload.
    const base64name = cloudEvent.data.message.data;

    // Create a new instance of Mailgun with the API key
    const mg = mailgun({ apiKey: 'a693158473725a3b69c55bdd32761689-f68a26c9-cf4f416d', domain: 'mail.arpitara.me' });

    const name = base64name
      ? Buffer.from(base64name, 'base64').toString()
      : 'World';

console.log(`name : ${name}`);
const data = JSON.parse(name);

console.log(`data : ${data}`);
console.log(`data2 : ${data.email_id}`);
console.log(`data3 : ${data.verificationLink}`);

    // HTML content for the email body
    const htmlContent = `<!DOCTYPE html>
    <html lang="en">
    <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Hello You awesome person!</title>
    <style>
      body {
        font-family: Arial, sans-serif;
        background-color: #f4f4f4;
        padding: 20px;
        margin: 0;
      }
      .container {
        max-width: 600px;
        margin: 0 auto;
        background-color: #fff;
        border-radius: 10px;
        box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
        padding: 30px;
      }
      h1 {
        color: #333;
      }
      p {
        color: #666;
      }
      .button {
        display: inline-block;
        padding: 10px 20px;
        background-color: #007bff;
        color: #fff;
        text-decoration: none;
        border-radius: 5px;
        margin-top: 20px;
      }
    </style>
    </head>
    <body>
      <div class="container">
        <h1>Hello You awesome person!</h1>
        <p>Dear User,</p>
        <p> Please verify your account by clicking the button below:</p>
        <a href="${data.verificationLink}" class="button">Verify your account</a>
      </div>
    </body>
    </html>`;

    // Send email using Mailgun
    const result = await mg.messages().send({
      from: "rai.a@northeastern.edu",
      to: `${data.email_id}`,
      subject: "Hello you awesome person!",
      html: htmlContent // Pass the HTML content as a string
    });

    const emailData = {
      result: result.id,
      to_address: data.email_id
    };
    console.log("emailData", emailData);

    // Save email data to the MySQL database using Sequelize
    await EamilTracker.create({
      to_address: data.email_id,
      result_id: result.id
    });

    console.log(result);
  } catch (error) {
    console.error('Failed to send email:', error);
  }
});
