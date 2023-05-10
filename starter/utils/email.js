const { htmlToText } = require('html-to-text');

const nodemailer = require('nodemailer');
const pug = require('pug');

// constructor function is a function that is going to be called when a new object is called using this class
// new Email(user, url).sendWelcome() --- for Example
// we want to have different transports when we are in the production enviroment and the development enviroment
// Send method is the method that will do the actual sending
// RENDER: In this case we just want to create the HTML out of the template and then send the HTML as the email
// ${__dirname}/../views/emails/${template}.pug` --- PATH for the PUG template we want to covert to HTML
// install the "html-to-text" to convert our formatted HTML emails to simple TEXT emails
module.exports = class Email {
  constructor(user, url) {
    this.to = user.email;
    this.firstName = user.name.split(' ')[0];
    this.url = url;
    this.from = `Yusuff Joseph <${process.env.EMAIL_FROM}>`;
  }

  createNewTransport() {
    if (process.env.NODE_ENV === 'production') {
      // ?SENDGRID
      return 1;
    }
    // else if in development
    return nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: process.env.EMAIL_PORT,
      logger: true,
      auth: {
        user: process.env.EMAIL_USERNAME,
        pass: process.env.EMAIL_PASSWORD,
      },
    });
  }

  // send the actual email
  // template here is the PUG template we are going to create to handle the sending of the emails
  async send(template, subject) {
    // 1.) Render HTML based on PUG template
    const html = pug.renderFile(`${__dirname}/../views/email/${template}.pug`, {
      firstName: this.firstName,
      url: this.url,
      subject,
    });
    // 2.)Define email options
    const mailOptions = {
      from: this.from,
      to: this.to,
      subject, //equal to the subject that is passed into the send function when called
      html, //the html that was converted from the PUG template
      text: htmlToText(html), // to convert our HTML text to simple TEXT file
    };
    // 3.) Create a transport and send email
    await this.createNewTransport().sendMail(mailOptions);
  }

  // send welcome message for new user
  async sendWelcome() {
    await this.send('welcome', 'Welcome to the Natours Family!');
  }
};

//////////////////////////////////////////////////
