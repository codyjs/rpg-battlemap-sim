import * as express from 'express';
import * as multer from 'multer';
import { requireAuth } from '../middleware/require-auth';
import { Piece } from '../models/piece-model';
import { UserModel } from '../models/user-model';

export class PieceRouter {
  private upload = multer({
    storage: multer.diskStorage({ destination: 'src/server/public/images/pieces' })
  });

  public getRouter() {
    const router = express.Router();
    router.get('/', requireAuth, this.getPieces);
    router.post('/', requireAuth, this.upload.single('image'), this.savePiece);
    return router;
  }

  private getPieces(req: express.Request, res: express.Response) {
    const user = req.user as UserModel;
    res.send(user.pieces);
  }

  private savePiece(req: express.Request, res: express.Response) {
    const data = JSON.parse(req.body.data);
    const user = req.user as UserModel;
    const piece = new Piece({ name: data.imageName, image: req.file.filename });
    user.pieces.push(piece);
    user.save().then(() => {
      res.status(201).send(piece);
    });
  }
}