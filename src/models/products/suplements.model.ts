import { Product } from '../products.model';
import { Schema } from 'mongoose';

export const Suplement = Product.discriminator(
  'Suplement',
  new Schema({
    weight: Number, // en gramos
    quantity: Number, // número de cápsulas, sobres, etc.
    ingredients: [String],
  })
);