require('dotenv').config();
const app = require('./app');
const config = require('./config');
const db = require('./config/db');

const port = process.env.PORT || 3000;

db.connect(config.db.uri)
	.then(() => {
		console.log('Connected to MongoDB');
		app.listen(port, () => console.log(`Server running on port ${port}`));
	})
	.catch(err => {
		console.error('Failed to connect to MongoDB', err);
		process.exit(1);
	});
