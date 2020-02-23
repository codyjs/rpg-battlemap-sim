import * as express from 'express';
import * as multer from 'multer';
import { RoomWebsocketServer } from '../ws/room-ws-server';
import { requireAuth } from '../middleware/require-auth';
import { Room, RoomData, RoomModel } from '../models/room-model';
import { UserModel } from '../models/user-model';

export class RoomRouter {
    private upload = multer({
        storage: multer.diskStorage({ destination: 'src/server/public/images/backdrops' })
    });

    private openRooms: RoomModel[] = [];
    private websocketServer = new RoomWebsocketServer();

    public getRouter() {
        return express.Router()
            .get('/', requireAuth, (req, res) => this.getUserRooms(req, res))
            .post('/', requireAuth, this.upload.single('image'),  (req, res) => this.createRoom(req, res))
            .get('/open', requireAuth, (req, res) => this.getOpenRooms(req, res))
            .post('/open/:id', requireAuth, (req, res) => this.openRoom(req, res))
            .ws('/:roomKey', (ws, req) => {
                try {
                    const room = this.getOpenRoomByKey(parseInt(req.params.roomKey));
                    this.websocketServer.connect(ws, room);
                } catch (e) {
                    console.error(e);
                }
            }
        );
    }

    private getOpenRooms(req: express.Request, res: express.Response) {
        res.send(this.openRooms.map(room => ({name: room.name, roomKey: room.roomKey })));
    }

    private getUserRooms(req: express.Request, res: express.Response) {
        const user = req.user as UserModel;
        res.send(user.rooms);
    }

    private createRoom(req: express.Request, res: express.Response) {
        const user = req.user as UserModel;
        const room = new Room(JSON.parse(req.body.data));
        room.backdrop.image = req.file.filename;
        user.rooms.push(room);
        user.save()
            .then(() => res.send(room))
            .catch(e => {
                console.error(e);
                res.status(500)
                    .send({"message": e});
            });
    }

    private async openRoom(req: express.Request, res: express.Response) {
        const user = req.user as UserModel;
        const room = await user.rooms.id(req.params.id);
        room.roomKey = this.getNextRoomKey();
        this.openRooms.push(room);
        res.send({ roomKey: room.roomKey });
    }

    private getOpenRoomByKey(roomKey: number): RoomData {
        return this.openRooms.find(room => room.roomKey === roomKey);
    }

    private getNextRoomKey(): number {
        if (this.openRooms.length === 0) return 1;
        const maxRoomKey = this.openRooms
            .map(room => room.roomKey)
            .reduce((prev, current) => Math.max(prev, current));
        return maxRoomKey + 1;
    }
}
