// tests/setup.js
//
// Spins up an in-memory MongoDB before all tests in the file that requires
// this module, tears it down after, and wipes collections between tests so
// each test runs against a clean database. Required by every integration
// test file via `require('./setup')` at the top.

const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');

// Set every env var the app reads at module-load time *before* requiring it.
process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = process.env.JWT_SECRET || 'test-secret';
process.env.JWT_EXPIRE = process.env.JWT_EXPIRE || '1h';
process.env.HF_TOKEN = process.env.HF_TOKEN || 'test-hf-token';
process.env.PORT = process.env.PORT || '0';
process.env.CLOUDINARY_CLOUD_NAME = process.env.CLOUDINARY_CLOUD_NAME || 'test-cloud';
process.env.CLOUDINARY_API_KEY = process.env.CLOUDINARY_API_KEY || 'test-key';
process.env.CLOUDINARY_API_SECRET = process.env.CLOUDINARY_API_SECRET || 'test-secret';

let mongod;

beforeAll(async () => {
    mongod = await MongoMemoryServer.create();
    process.env.MONGO_URI = mongod.getUri();
    await mongoose.connect(process.env.MONGO_URI);
});

afterAll(async () => {
    await mongoose.disconnect();
    if (mongod) await mongod.stop();
});

beforeEach(async () => {
    const { collections } = mongoose.connection;
    for (const name of Object.keys(collections)) {
        await collections[name].deleteMany({});
    }
});
