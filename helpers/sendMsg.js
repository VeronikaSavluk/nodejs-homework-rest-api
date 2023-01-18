const sgMail = require('@sendgrid/mail');
require('dotenv').config();

const {SENDGRID_API_KEY} = process.env;

const sendMsg = async (data) => {
	try {
		await sgMail.setApiKey(SENDGRID_API_KEY);

		const msg = {...data, from: 's_veronica@ukr.net'};
		console.log(msg)
		await sgMail.send(msg);
		return true;
  } catch (error) {
    console.error(error);
  };
};

module.exports = sendMsg;