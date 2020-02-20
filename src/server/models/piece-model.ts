import { Schema, Document, model, Model } from 'mongoose';

export interface PieceData {
    name: string;
    image: string;
    createdAt: Date;
}

export interface PieceModel extends PieceData, Document {}

export const pieceSchema = new Schema({
    name: String,
    image: String,
    createdAt: Date,
});

export const Piece: Model<PieceModel> = model<PieceModel>('Piece', pieceSchema);