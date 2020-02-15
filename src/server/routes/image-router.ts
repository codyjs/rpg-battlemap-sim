import * as fs from 'fs';
import * as express from 'express';
import * as multer from 'multer';

export class ImageRouter {
  private upload = multer({
    storage: multer.diskStorage({
      destination: (req, file, cb) => {
          const imageData = JSON.parse(req.body.data);
          const basePath = 'src/server/public/images';
  
          if (imageData.imageType === 'piece') {
              cb(null, basePath + '/pieces');
          } else {
              cb(null, basePath + '/backdrops');
          }
      },
      filename: (req, file, cb) => {
        const imageData = JSON.parse(req.body.data);
        cb(null, imageData.imageName + file.originalname.slice(file.originalname.lastIndexOf('.')));
      }
    })
  });

  public getRouter() {
    const router = express.Router();
    router.get('/backdrops', this.getBackdrops);
    router.get('/pieces', this.getPieces);
    router.post('/', this.upload.single('image'), this.postImage);
    return router;
  }

  private getBackdrops(req: express.Request, res: express.Response) {
    const data = fs.readdirSync('src/server/public/images/backdrops');
    res.send({ data });
  }

  private getPieces(req: express.Request, res: express.Response) {
    const data = fs.readdirSync('src/server/public/images/pieces');
    res.send({ data });
  }
  
  private postImage(req: express.Request, res: express.Response) {
    res.sendStatus(200);
  }
}