import mongoose from 'mongoose';

beforeAll(async () => {
  await mongoose.connect(process.env.MONGO_URI_TEST as string);
});

afterAll(async () => {
  if (mongoose.connection.db) {
    await mongoose.connection.db.dropDatabase();
  } else {
    console.error('mongoose.connection.db is undefined');
  }
  
  await mongoose.connection.close();
});