import mongoose from 'mongoose';

beforeAll(async () => {
  if (process.env.MONGO_URI_TEST) {
    await mongoose.connect(process.env.MONGO_URI_TEST);
  }
});

afterAll(async () => {
  if (process.env.MONGO_URI_TEST) {
    if (mongoose.connection.db) {
      await mongoose.connection.db.dropDatabase();
    } else {
      console.error('mongoose.connection.db is undefined');
    }
  }
  await mongoose.connection.close();
});