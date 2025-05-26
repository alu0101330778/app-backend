import mongoose, { Schema, Document } from 'mongoose';

// Interfaz para los datos de usuario
interface ISentence extends Document {
  title: string;
  body: string;
  end: string;
}

// Esquema de usuario
const SentenceSchema: Schema = new Schema({
  title: { type: String, required: true},
  body: { type: String, required: true},
  end: { type: String, required: true}
});

// Modelo de usuario basado en la interfaz y el esquema
const Sentence = mongoose.model<ISentence>('Sentence', SentenceSchema);

export default Sentence;
