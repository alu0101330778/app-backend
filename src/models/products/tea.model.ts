import { Product } from '../products.model';
import { Schema } from 'mongoose';

export const Tea = Product.discriminator(
  'Tea',
  new Schema({
    weight: Number, // en gramos
    flavor: String,
    origin: String,
    ingredients: [String],
  })
);