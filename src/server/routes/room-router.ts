import * as express from 'express';
import * as multer from 'multer';
import { RoomData } from '../../app/map-canvas/types';
import { DrawType } from '../../app/canvas-framework/types';
import { RoomWebsocketServer } from '../ws/room-ws-server';

export class RoomRouter {
  private rooms: RoomData[] = [
    {
      roomName: 'My Room',
      id: 1,
      backdrop: {
        image: 'Hidden Altar.jpg',
        w: 748, h: 544
      },
      grid: {
        x: 34, y: 34, w: 20, h: 14, tileSize: 34, drawType: DrawType.Grid
      },
      pieces: [
        { x: 5, y: 3, h: 1, w: 1, image: 'Tarl.png' },
        { x: 7, y: 5, h: 1, w: 1, image: 'Kor\'tan.png' },
        { x: 6, y: 3, h: 2, w: 2, image: 'owlbear.png' },
        { x: 6, y: 6, h: 1, w: 1, image: 'assassin.png' }
      ],
      connections: []
    }
  ];
  private websocketServer = new RoomWebsocketServer();

  public getRouter() {
    return express.Router()
      .get('/', (req, res) => this.getRooms(req, res))
      .post('/', (req, res) => this.postRoom(req, res))
      .ws('/:id', (ws, req) => {
        const room = this.getRoomById(parseInt(req.params.id));
        this.websocketServer.connect(ws, room);
      }
    );
  }

  private getRooms(req: express.Request, res: express.Response) {
    res.send(this.rooms.map(room => ({name: room.roomName, id: room.id })));
  }

  private postRoom(req: express.Request, res: express.Response) {
    const room = req.body;
    console.log(room);
    room.id = this.rooms.map(room => room.id).reduce((prev, current) => Math.max(prev, current)) + 1;
    this.rooms.push(room);
    res.send({ roomId: room.id });
  }

  private getRoomById(roomId: number): RoomData {
    return this.rooms.find(room => room.id === roomId);
  }
}
