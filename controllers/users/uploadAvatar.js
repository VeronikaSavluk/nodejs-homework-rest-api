const {User} = require('../../service/Schema/authModel');
const fs = require('fs').promises;
const {Unauthorized} = require('http-errors');
const path = require('path');
const Jimp = require('jimp');

const avatarsDir = path.join(__dirname, '../../', 'public', 'avatars');

const uploadAvatar = async (req, res) => {
	const {path: tmpUpload, originalname} = req.file;
	const {_id: id} = req.user;

	await Jimp.read(tmpUpload)
		.then(image => {
			return image
			.resize(250, 250)
			.writeAsync(tmpUpload)
		})
		.catch(err => {
			console.error(err);
	});

	try {
		const resultUpload = path.join(avatarsDir, `${id}_${originalname}`);
		await fs.rename(tmpUpload, resultUpload);
		const avatarURL = path.join('public', 'avatars', originalname);

		const updateAvatar = await User.findByIdAndUpdate(id, {avatarURL})
		
		if (!updateAvatar){
			throw new Unauthorized('Not authorized');
		};
	
		res.json({avatarURL});

	} catch (error) {
		await fs.unlink(tmpUpload);
		throw error;
	};
};

module.exports =	uploadAvatar;