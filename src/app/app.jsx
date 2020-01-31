import { createElement, useState, Fragment, useEffect } from 'react';
import { BrowserRouter as Router, Switch, Route, Link } from 'react-router-dom';
import { MainMenu } from './main-menu';
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
        <Router>
            <Switch>
                <Route path="/rooms/:roomId">
                    <Room rooms={rooms} />
                </Route>
                <Route path="/create-room">
                    <CreateRoom onCreate={room => { setRooms(rooms.concat([room])); }} />
                </Route>
                <Route path="/">
                    <MainMenu rooms={rooms} />
                </Route>
            </Switch>
        </Router>
    );
};