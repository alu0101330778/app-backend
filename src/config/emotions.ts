import dotenv from 'dotenv';

dotenv.config();

const raw = process.env.EMOTIONS;
const EMOTIONS = raw ? JSON.parse(raw) : [];

export default EMOTIONS;
