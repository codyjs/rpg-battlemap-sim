const express = require('express');
const cookieParser = require('cookie-parser');
const logger = require('morgan');

const piecesRouter = require('./routes/pieces');
const roomsRouter = require('./routes/rooms');

const app = express();

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use('/api/assets', express.static('./src/server/public'));

app.use('/api/pieces', piecesRouter);
app.use('/api/rooms', roomsRouter);

module.exports = app;
