const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.GOOGLE_ID,
    pass: process.env.GOOGLE_SECRET,
  }
});

/**
 * GET /contact
 * Contact form page.
 */
exports.getContact = (req, res) => {
  res.render('contact', {
    title: 'Contact'
  });
};

/**
 * POST /contact
 * Send a contact form via Nodemailer.
 */
exports.postContact = (req, res) => {
  req.assert('name', 'Name cannot be blank').notEmpty();
  req.assert('email', 'Email is not valid').isEmail();
  req.assert('message', 'Message cannot be blank').notEmpty();

  const errors = req.validationErrors();

  if (errors) {
    req.flash('errors', errors);
    return res.redirect('/contact');
  }

  const mailOptions = {
    to: 'manuel.adele@gmail.com',
    from: `${req.body.name} <${req.body.email}>`,
    host: 'smtp.gmail.com',
    secure: true,
    port: 465,
    subject: 'Contact Form | proZe',
    text: req.body.message,
    auth: {
      user: 'manuel.adele@gmail.com',
      pass: 'Jean_3:16',
    }
  };

  transporter.sendMail(mailOptions, (err) => {
    if (err) {
      req.flash('errors', {
        msg: err.message
      });
      return res.redirect('/contact');
    }
    req.flash('success', {
      msg: 'Email has been sent successfully!'
    });
    res.redirect('/');
  });
};