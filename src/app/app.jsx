import { createElement, useState, Fragment, useEffect } from 'react';
import { BrowserRouter as Router, Switch, Route } from 'react-router-dom';
import { MainMenu } from './main-menu';
import { RoomList } from './room-list';
import { UploadPiece } from './upload-piece';
import { Room } from './room';
import { CreateRoom } from './create-room';
import { UserContext } from './context';
import { LoginPage } from './login-page';

export const App = () => {
    const [rooms, setRooms] = useState([]);
    const [user, setUser] = useState(null);

    useEffect(() => {
        if (user) {
            fetch('/api/rooms')
                .then(response => response.json())
                .then(setRooms);
        }
    }, [user]);

    return (
        <div id="page-container" style={{display: 'flex'}}>
            <UserContext.Provider value={user}>
                <Router>
                    <Switch>
                        <Route path="/login">
                            <LoginPage onSuccess={setUser} />
                        </Route>
                        <Route path="/rooms/:roomKey">
                            <Room rooms={rooms} />
                        </Route>
                        <Route path="/rooms">
                            <RoomList rooms={rooms} />
                        </Route>
                        <Route path="/create-room">
                            <CreateRoom onSave={room => setRooms(rooms.concat([room])) } />
                        </Route>
                        <Route path="/upload-piece">
                            <UploadPiece />
                        </Route>
                        <Route path="/">
                            <MainMenu />
                        </Route>
                    </Switch>
                </Router>
            </UserContext.Provider>
        </div>
    );
};