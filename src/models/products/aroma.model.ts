import { Product } from '../products.model';
import { Schema } from 'mongoose';

export const Aromatherapy = Product.discriminator(
  'Aromatherapy',
  new Schema({
    scent: String,
    volume: Number, // en ml
    ingredients: [String],
  })
);