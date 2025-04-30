import { model, models, Schema } from 'mongoose';

export interface IProduct {
    name: string;
    description: string;
    price: number;
}
const ProductSchema = new Schema<IProduct>(
    {
        name: String,
        description: String,
        price: Number,
    },
    {
        timestamps: true,
        toJSON: {
            versionKey: false,
            virtuals: true,
            transform: (_, ret) => {
                delete ret._id;
            },
        },
    },
);
const Product = models.Product || model('Product', ProductSchema);
export default Product;
