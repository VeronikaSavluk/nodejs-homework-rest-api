const {set, connect} = require('mongoose');
const request = require("supertest");
const gravatar = require('gravatar');
// const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
require('dotenv').config();
const app = require('../app');
const {verificationToken} = require('../controllers/auth/register');
const {User, joiSchema} = require('../service/Schema/authModel');
const {DB_TEST_HOST, PORT, SECRET_KEY} = process.env;
set('strictQuery', true);

const reqInput = {
	email: 'gasigap708@fom8.com',
	password: 'gasigap708',
};

const loginInput = {
	email: 'gasigap708@fom8.com',
	password: 'gasigap708',
};

const avatarURL = gravatar.url(reqInput.email);

jest.fn('bcrypt');
// const hashPassword = bcrypt.hashSync(reqInput.password, bcrypt.genSaltSync(10));

describe("test auth route", () => {		  
	beforeAll(() => {
		connect(DB_TEST_HOST)
		.then(() => {
			app.listen(PORT);
		})
		.catch(error => {
		console.log(error.message);
		process.exit(1);
		});
	});

	afterAll(async() => {
		const {_id} = await User.findOne({email: reqInput.email});
		await User.deleteOne({_id});
		})
	
		describe('test register controller', () => {
			it('Request body is validated', async () => {
				const {error} = await joiSchema.validate(reqInput);
				expect(error).toBeUndefined();
			});

			it(`Email isn't in use`, async () => {
				const userEmail = await User.findOne({email: reqInput.email});
				expect(userEmail).toBeNull();
			});

			it('Should create user', async () => {
				const {body} = await request(app).post('/api/users/register').send(reqInput);

				expect(body)
				.toStrictEqual({
					status: 'success',
					code: 201,
					data: {
						user: {
							email: reqInput.email,
							password: reqInput.password,
							avatarURL: avatarURL,
						}
					}
				});
			});
		});

		describe('test login controller', () => {
			it('Request body is validated', async () => {
				const {error} = await joiSchema.validate(loginInput);
				expect(error).toBeUndefined();
			});

			it(`user exists`, async () => {
				const testLoginUser = await User.findOne({email: loginInput.email});
				expect(testLoginUser).not.toBeNull();
				expect(testLoginUser.verify).not.toBe(true);
				expect(testLoginUser.comparePassword(loginInput.password)).not.toBe(loginInput.password);
			});
			
			describe('test auth verification', () => {
				it('Return verificationToken', async () => {
					const {body} = await request(app).get(`/api/users/verify/${verificationToken}`);
					expect(body.message).toBe('Verification successful');
				});

				it('verificationToken', async () => {
					const {status, body} = await request(app).post(`/api/users/verify`).send(loginInput);
					expect(status).toBe(400);
					expect(body.message).toBe('Verification has already been passed');
				});
			});

			it(`Repit test of user exists`, async () => {
				const testLoginUser = await User.findOne({email: loginInput.email});
				expect(testLoginUser).not.toBeNull();
				expect(testLoginUser.verify).toBe(true);
				expect(testLoginUser.comparePassword(loginInput.password)).toBe(true);
			});

			it('should has status 200 and return token and body with email and subscription', async () => {
				const {_id} = await User.findOne({email: loginInput.email});
		
				const token = jwt.sign({id: _id}, SECRET_KEY);

				const {body} = await request(app).post('/api/users/login').send(loginInput).set('autorization', `Bearer ${token}`);

				expect(body)
				.toStrictEqual({
					status: 'success',
					code: 200,
					data: {
						token,
					}
				});
			});
		});
});