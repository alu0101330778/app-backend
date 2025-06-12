import { Product } from '../products.model';
import { Schema } from 'mongoose';

export const Book = Product.discriminator(
  'Book',
  new Schema({
    isbn: { type: String, required: true },
    author: { type: String, required: true },
    publisher: String,
    pages: Number,
    language: String,
  })
);