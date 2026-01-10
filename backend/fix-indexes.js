require('dotenv').config();
const mongoose = require('mongoose');

async function fixIndexes() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to MongoDB');

        const User = require('./models/User');

        // Check existing indexes
        const indexes = await User.collection.getIndexes();
        console.log('Current indexes:', indexes);

        if (indexes.username_1) {
            console.log('Found username_1 index, dropping it...');
            await User.collection.dropIndex('username_1');
            console.log('Index username_1 dropped successfully');
        } else {
            console.log('No username_1 index found');
        }

        await mongoose.disconnect();
        process.exit(0);
    } catch (err) {
        console.error('Error fixing indexes:', err);
        process.exit(1);
    }
}

fixIndexes();
