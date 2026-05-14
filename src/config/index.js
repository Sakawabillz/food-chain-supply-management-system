module.exports = {
	db: {
		uri: process.env.MONGO_URI || 'mongodb://localhost:27017/food-supply-chain'
	},
	jwtSecret: process.env.JWT_SECRET,
	jwtExpiresIn: process.env.JWT_EXPIRES_IN || '1h'
};