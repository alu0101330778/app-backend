import mongoose, { Schema, Document } from 'mongoose';
import { Types } from 'mongoose';

interface IEmotionLog {
  emotions: string[];          // Lista de emociones registradas en un evento
  timestamp: Date;             // Fecha y hora del registro
}

interface IUser extends Document {
  username: string;
  email: string;
  password: string;
  lastSentence?: Types.ObjectId;
  favoriteSentences: Types.ObjectId[];
  emotions: Map<string, number>;
  emotionsCount: number;
  emotionLogs: IEmotionLog[];
  enableEmotions: boolean;      // <-- Añadido
  randomReflexion: boolean;     // <-- Añadido
}

const EmotionLogSchema = new Schema<IEmotionLog>({
  emotions: [{ type: String, required: true }],
  timestamp: { type: Date, default: Date.now },
});

const UserSchema: Schema = new Schema({
  username: { type: String, required: true },
  email:    { type: String, required: true, unique: true },
  password: { type: String, required: true },
  lastSentence: { type: Schema.Types.ObjectId, ref: 'Sentence' },
  favoriteSentences: [{ type: Schema.Types.ObjectId, ref: 'Sentence' }],
  emotions: { type: Map, of: Number, default: {} },
  emotionsCount: { type: Number, default: 0 },
  emotionLogs: [EmotionLogSchema],
  enableEmotions: { type: Boolean, default: true },      // <-- Añadido
  randomReflexion: { type: Boolean, default: true },    // <-- Añadido
});

const User = mongoose.model<IUser>('User', UserSchema);
export default User;
