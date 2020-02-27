import * as express from 'express';
import { User, UserModel } from '../models/user-model';
import { requireAuth } from '../middleware/require-auth';

export class UserRouter {
    public getRouter() {
        const router = express.Router();
        router.post('/', this.addUser);
        router.get('/info', requireAuth, this.getUserInfo)
        return router;
    }

    private addUser(req: express.Request, res: express.Response) {
        User.create({
            username: req.body.username,
            password: req.body.password,
            createdAt: new Date()
        }).then(res.send);
    }

    private getUserInfo(req: express.Request, res: express.Response) {
        const user = req.user as UserModel;
        res.send(user);
    }
}
