import { createElement, useState, Fragment, useEffect } from 'react';
import { BrowserRouter as Router, Switch, Route, Link } from 'react-router-dom';
import { MainMenu } from './main-menu';
import { RoomList } from './room-list';
import { UploadImage } from './upload-image';
import { Room } from './room';
import { CreateRoom } from './create-room';

export const App = () => {
    const [rooms, setRooms] = useState([]);


    useEffect(() => {
        fetch('/api/rooms')
            .then(response => response.json())
            .then(setRooms);
    }, []);

    return (
        <div id="page-container" style={{display: 'flex'}}>
            <Router>
                <Switch>
                    <Route path="/rooms/:roomId">
                        <Room rooms={rooms} />
                    </Route>
                    <Route path="/rooms">
                        <RoomList rooms={rooms} />
                    </Route>
                    <Route path="/create-room">
                        <CreateRoom onCreate={room => setRooms(rooms.concat([room])) } />
                    </Route>
                    <Route path="/upload-image">
                        <UploadImage />
                    </Route>
                    <Route path="/">
                        <MainMenu />
                    </Route>
                </Switch>
            </Router>
        </div>
    );
};