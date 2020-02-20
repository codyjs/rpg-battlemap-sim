import * as express from 'express';
import { User } from '../models/user-model';

export class UserRouter {
    public getRouter() {
        const router = express.Router();
        router.post('/', this.addUser);
        return router;
    }

    private addUser(req: express.Request, res: express.Response) {
        User.create({
            username: req.body.username,
            password: req.body.password,
            createdAt: new Date()
        }).then(res.send);
    }
}
