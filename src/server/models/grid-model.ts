import { Schema, Document, model, Model } from 'mongoose';

export interface GridData {
    x: number;
    y: number;
    w: number;
    h: number;
    tileSize: number;
}

export interface GridModel extends GridData, Document {}

export const gridSchema = new Schema({
    x: Number,
    y: Number,
    w: Number,
    h: Number,
    tileSize: Number
});

export const Grid: Model<GridModel> = model<GridModel>('Grid', gridSchema);
