import * as WebSocket from 'ws';
import { Point } from '../../app/canvas-framework/types';
import { RoomData } from '../models/room-model';

export enum MessageType {
    Leave = 'leave',
    GetRoomData = 'getRoomData',
    MovePiece = 'movePiece',
}

export interface MovePieceMessage {
    pieceId: number,
    to: Point
}

export class RoomWebsocketServer {

    public connect(ws: WebSocket, room: RoomData): void {
        room.connections ? room.connections.push(ws) : room.connections = [ws];
        ws.onmessage = (e: WebSocket.MessageEvent) => {
            this.handleMessage(e.data, ws, room);
        };
    }

    private handleMessage(msgData: WebSocket.Data, ws: WebSocket, room: RoomData) {
        const msg: any = JSON.parse(msgData.toString());

        if (!msg.messageType) {
            console.warn('[RoomWebsocketServer]: Got ws message without messageType');
            return;
        }

        switch(msg.messageType) {
            case MessageType.Leave:
                return this.handleLeave(room, ws);
            case MessageType.GetRoomData:
                return this.handleGetRoomData(room, ws);
            case MessageType.MovePiece:
                return this.handleMovePiece(room, msg.data as MovePieceMessage, msgData);
            default:
                console.warn(`[RoomWebsocketServer]: Got ws message with unknown messageType '${msg.messageType}'`);
        }
    }

    private handleLeave(room: RoomData, ws: WebSocket) {
        room.connections.splice(room.connections.indexOf(ws));
    }

    private handleGetRoomData(room: RoomData, ws: WebSocket) {
        // TODO: Remove this temporary assignment
        if (!room.pieces) {
            room.pieces = [
                { x: 5, y: 3, h: 1, w: 1, image: 'Tarl.png', name: 'Tarl' },
                { x: 7, y: 5, h: 1, w: 1, image: 'Kor\'tan.png', name: 'Kor\'Tan' },
                { x: 6, y: 3, h: 2, w: 2, image: 'owlbear.png', name: 'owlbear' },
                { x: 6, y: 6, h: 1, w: 1, image: 'assassin.png', name: 'assassin' }
            ];
        }

        const payload = {
            messageType: 'getRoomData',
            grid: room.grid,
            pieces: room.pieces,
            backdrop: room.backdrop,
            roomName: room.name,
        }
        ws.send(JSON.stringify(payload));
    }

    private handleMovePiece(room: RoomData, msg: MovePieceMessage, msgData: WebSocket.Data) {
        const piece = room.pieces[msg.pieceId];
        piece.x = msg.to.x;
        piece.y = msg.to.y;
        room.connections.forEach(conn => {
            conn.send(msgData);
        });
    }
}