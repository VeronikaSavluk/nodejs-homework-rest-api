const {model: srvc} = require('../../service');
const {BadRequest, Conflict} = require('http-errors');
const {v4: uuidv4} = require('uuid');
const gravatar = require('gravatar');

const sendMsg = require('../../helpers/sendMsg');

const register = async (req, res, next) => {
    try {
      const {error} = await srvc.authModel.joiSchema.validate(req.body);
      
      if(error){
        throw new BadRequest('missing fields');
      }

      const {email, password} = req.body;

      const userEmail = await srvc.authModel.User.findOne({email});
      
      if(userEmail){
        throw new Conflict('Email in use');
      };
      
      const avatarURL = gravatar.url(email);
      const verificationToken = uuidv4();

      const newUser = new srvc.authModel.User({email, password, avatarURL, verificationToken});
      newUser.setPassword(password);
      await newUser.save();

      const message = {
        to: email,
        subject: 'Email verification',
        html: `<a target='_blank' href='http://Localhost:3000/api/users/verify/${verificationToken}'>Confirm email</a>`
      };

      await sendMsg(message);

      res.status(201).json({
      status: 'success',
      code: 201,
      data: {
        user: {
          email,
          password,
          avatarURL
        }
      }
    });
    } catch (error) {
      next(error);
    };
  };

  module.exports = register;