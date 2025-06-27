import { Schema, model, Document } from 'mongoose';

export interface IProduct extends Document {
  name: string;
  description: string;
  price: number;
  image?: string;
  category: string;
  brand?: string;
  stock: number;
  tags?: string[];
  createdAt?: Date;
  updatedAt?: Date;
}

const ProductSchema = new Schema<IProduct>(
  {
    name: { type: String, required: true },
    description: { type: String, required: true },
    price: { type: Number, required: true },
    image: String,
    category: { type: String, required: true, enum: ['book', 'aromatherapy', 'supplement', 'tea'] },
    brand: String,
    stock: { type: Number, default: 0 },
    tags: [String],
  },
  { timestamps: true, discriminatorKey: 'category' }
);

export const Product = model<IProduct>('Product', ProductSchema);