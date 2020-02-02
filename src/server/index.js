const express = require('express');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const enableWebsockets = require('express-ws');

const app = express();
enableWebsockets(app);
const roomsRouter = require('./routes/rooms');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

app.use('/api/rooms', roomsRouter);

app.use('/', express.static('./src/server/public'));

app.get('*', function (req, res) {
    res.redirect('/');
});

app.listen('3000', () => { console.log('listening on port 3000'); });
