import * as express from 'express';

export const requireAuth: express.Handler = (req, res, next) => {
    if (!req.user) {
        res
            .status(401)
            .send({ error: "Must be logged in to access this endpoint" });
    } else {
        next();
    }
}
