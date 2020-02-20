import { Schema, Document, model, Model, SchemaTypes, Types } from 'mongoose';
import { pieceSchema, PieceModel, PieceData } from './piece-model';

SchemaTypes.Array

export interface UserData {
    username: string;
    password: string;
    createdAt: Date;
    pieces: PieceData[]
}

export interface UserModel extends UserData, Document {
    pieces: Types.DocumentArray<PieceModel>
}

const userSchema = new Schema({
    username: String,
    password: String,
    createdAt: Date,
    pieces: [pieceSchema]
});

export const User: Model<UserModel> = model<UserModel>('User', userSchema);