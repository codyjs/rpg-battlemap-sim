import { Schema, Document, model, Model } from 'mongoose';

export interface PieceData {
    name: string;
    image: string;
    x: number;
    y: number;
    w: number;
    h: number;
    _id: any;
}

export interface PieceModel extends PieceData, Document {}

export const pieceSchema = new Schema({
    name: String,
    image: String
});

export const Piece: Model<PieceModel> = model<PieceModel>('Piece', pieceSchema);