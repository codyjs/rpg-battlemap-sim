import * as express from 'express';
import * as cookieParser from 'cookie-parser';
import * as logger from 'morgan';
import * as enableWebsockets from 'express-ws';
import * as session from 'express-session';
import * as mongoose from 'mongoose';
import * as passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import { Strategy as LocalStrategy } from 'passport-local';

mongoose.connect('mongodb://localhost/rpg-battlemap-sim', { useNewUrlParser: true });
mongoose.connection
    .on('error', console.error.bind(console, 'connection error:'))
    .once('open', () => console.log('connected to mongoDB'));

import { User, UserModel } from './models/user-model';
import { RoomRouter } from './routes/room-router';
import { PieceRouter } from './routes/piece-router';
import { UserRouter } from './routes/user-router';

const app = express();
enableWebsockets(app);
app.use(session({ secret: 'poptartsRgud', resave: false, saveUninitialized: false }));
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

configureAuthentication(app);

app.use('/api/users', new UserRouter().getRouter());
app.use('/api/rooms', new RoomRouter().getRouter());
app.use('/api/pieces', new PieceRouter().getRouter());

app.use('/', express.static('./src/server/public'));

app.get('*', function (req, res) {
    res.redirect('/');
});

app.listen('3000', () => { console.log('listening on port 3000'); });

function configureAuthentication(app: express.Application): void {
    app.use(passport.initialize());
    app.use(passport.session());
    passport.serializeUser((user: UserModel, done) => done(null, user.id));
    passport.deserializeUser((id: any, done) => User.findById(id, done));

    if (process.env.NODE_ENV === 'production') {
        passport.use(new GoogleStrategy({
            clientID: '335675665070-soeencvbab6mcs4l7achp49v5o7dkdca.apps.googleusercontent.com',
            clientSecret: '',
            callbackURL: 'battlemapsim.herokuapp.com/api/google/callback'
        }, function(accessToken, refreshToken, profile, cb) {

        }));
        app.post('/api/login', passport.authenticate('google', { scope: ['profile'] }));
        app.get('/api/google/callback', passport.authenticate('google', (req, res) => res.redirect('/')));
    } else {
        passport.use(new LocalStrategy(function(username, password, done) {
            User.findOne({ username }, (err, user) => {
                done(null, user);
            });
        }));
        app.post('/api/login', passport.authenticate('local'), (req, res) => res.send(req.user));
    }
}
