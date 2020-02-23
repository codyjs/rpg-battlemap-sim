import { Schema, Document, model, Model } from 'mongoose';

export interface BackdropData {
    image: string;
    w: number;
    h: number;
}

export interface BackdropModel extends BackdropData, Document {}

export const backdropSchema = new Schema({
    image: String,
    w: Number,
    h: Number
});

export const Backdrop: Model<BackdropModel> = model<BackdropModel>('Backdrop', backdropSchema);
