import * as WebSocket from 'ws';
import { Schema, Document, model, Model } from 'mongoose';
import { BackdropData, BackdropModel, backdropSchema } from './backdrop-model';
import { GridData, GridModel, gridSchema } from './grid-model';
import { PieceData } from './piece-model';

export interface RoomData {
    name: string;
    backdrop: BackdropData;
    grid: GridData;
    roomKey?: number;
    connections?: WebSocket[]
    pieces?: PieceData[];
    _id: any;
}

export interface RoomModel extends RoomData, Document {
    backdrop: BackdropModel;
    grid: GridModel;
}

export const roomSchema = new Schema({
    name: String,
    backdrop: backdropSchema,
    grid: gridSchema
});

export const Room: Model<RoomModel> = model<RoomModel>('Room', roomSchema);
