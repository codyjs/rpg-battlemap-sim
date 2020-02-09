import { RoomData } from "./types";
import { Point } from '../canvas-framework/types';

export class BattlemapWebsocketClient {
    private ws: WebSocket = null;
    private connectionPromise: Promise<void> = null;
    private roomDataCallback: (data: RoomData) => void = null;
    private pieceMovedCallback: (pieceId: number, to: Point) => void = null;

    constructor(roomId: number) {
        this.ws = new WebSocket(`ws://localhost:3000/api/rooms/${roomId}`);
        this.connectionPromise = new Promise((resolve) => {
            this.ws.onopen = () => {
                this.send({ messageType: 'getRoomData' });
                resolve();
            };
        });

        this.ws.onmessage = (event: MessageEvent) => {
            const payload = JSON.parse(event.data);
            switch(payload.messageType) {
            case 'getRoomData':
                this.roomDataCallback(payload);
                break;
            case 'movePiece':
                console.log(payload);
                this.pieceMovedCallback(payload.data.pieceId, payload.data.to);
                break;
            }
        };
    }

    public onRoomData(callback: (data: RoomData) => void): void {
        this.roomDataCallback = callback;
    }

    public onPieceMoved(callback: (pieceId: number, to: Point) => void): void {
        this.pieceMovedCallback = callback;
    }

    public movePiece(pieceId: number, to: Point): Promise<void> {
        return this.connectionPromise.then(() => {
            this.send({ messageType: 'movePiece', data: { pieceId, to } });
        });
    }

    public close(): void {
        this.connectionPromise.then(() => {
            this.send({ messageType: 'leave' });
            this.ws.close();
        });
    }

    private send(data: any): void {
        this.ws.send(JSON.stringify(data));
    }
}