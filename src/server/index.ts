import * as express from 'express';
import * as cookieParser from 'cookie-parser';
import * as logger from 'morgan';
import * as enableWebsockets from 'express-ws';

import { RoomRouter } from './routes/room-router';
import { ImageRouter } from './routes/image-router';

const app = express();
enableWebsockets(app);

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

app.use('/api/rooms', new RoomRouter().getRouter());
app.use('/api/images', new ImageRouter().getRouter());

app.use('/', express.static('./src/server/public'));

app.get('*', function (req, res) {
    res.redirect('/');
});

app.listen('3000', () => { console.log('listening on port 3000'); });
