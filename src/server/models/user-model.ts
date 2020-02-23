import { Schema, Document, model, Model, SchemaTypes, Types } from 'mongoose';
import { pieceSchema, PieceModel, PieceData } from './piece-model';
import { roomSchema, RoomModel, RoomData } from './room-model';

SchemaTypes.Array

export interface UserData {
    username: string;
    password: string;
    pieces: PieceData[];
    rooms: RoomData[];
}

export interface UserModel extends UserData, Document {
    pieces: Types.DocumentArray<PieceModel>
    rooms: Types.DocumentArray<RoomModel>
}

const userSchema = new Schema({
    username: String,
    password: String,
    pieces: [pieceSchema],
    rooms: [roomSchema]
});

export const User: Model<UserModel> = model<UserModel>('User', userSchema);