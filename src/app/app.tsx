import { createElement, useState, useEffect } from 'react';
import { BrowserRouter as Router, Switch, Route } from 'react-router-dom';
import { MainMenu } from './pages/main-menu';
import { RoomList } from './pages/room-list';
import { UploadPiece } from './pages/upload-piece';
import { Room } from './pages/room';
import { CreateRoom } from './pages/create-room';
import { UserContext } from './context';
import { LoginPage } from './pages/login-page';
import { Pieces } from './pages/piece-list';
import { Logout } from './components/logout';
import { RoomData } from '../server/models/room-model';
import { UserData } from '../server/models/user-model';

export const App = () => {
    const [rooms, setRooms] = useState<RoomData[]>([]);
    const [user, setUser] = useState<UserData>(null);
    const [userLoading, setUserLoading] = useState<boolean>(true);
    const [roomsLoading, setRoomsLoading] = useState<boolean>(true);

    useEffect(() => {
        fetch('/api/users/info')
            .then(response => {
                if (!response.ok) throw new Error("not logged in")
                return response.json()
            })
            .then(user => {
                setUser(user);
                setUserLoading(false);
            })
            .catch(() => setUserLoading(false));
    }, []);

    useEffect(() => {
        if (user) {
            fetch('/api/rooms')
                .then(response => response.json())
                .then(rooms => {
                    setRooms(rooms);
                    setRoomsLoading(false);
                })
                .catch(() => setRoomsLoading(false));
        } else {
            setRoomsLoading(false);
        }
    }, [user]);

    if (userLoading || roomsLoading) return (
        <div>
            <h2>Loading...</h2>
        </div>
    )

    return (
        <div id="page-container" style={{display: 'flex'}}>
            <UserContext.Provider value={user}>
                <Router>
                    <Switch>
                        <Route path="/login">
                            <LoginPage onSuccess={setUser} />
                        </Route>
                        <Route path="/logout">
                            <Logout onSuccess={() => setUser(null)} />
                        </Route>
                        <Route path="/rooms/:roomKey">
                            <Room />
                        </Route>
                        <Route path="/rooms">
                            <RoomList rooms={rooms} />
                        </Route>
                        <Route path="/create-room">
                            <CreateRoom onSave={room => setRooms(rooms.concat([room])) } />
                        </Route>
                        <Route path="/pieces">
                            <Pieces />
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