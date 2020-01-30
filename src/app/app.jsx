import { createElement, useState, Fragment, useEffect } from 'react';
import { MapCanvasContainer } from './map-canvas';
import { RoomListing } from './room-listing';

export const App = () => {
    const [rooms, setRooms] = useState([]);
    const [selectedRoom, setSelectedRoom] = useState(null);

    useEffect(() => {
        fetch('/api/rooms')
            .then(response => response.json())
            .then(setRooms);
    }, []);

    return (
        <Fragment>
            {selectedRoom ? (
                <MapCanvasContainer room={selectedRoom} goBack={() => setSelectedRoom(null)} />
            ) : (
                <Fragment>
                    <h1>Main Menu</h1>
                    {rooms.length === 0
                        ? <p>Loading...</p>
                        : <ul>{rooms.map(room => <RoomListing room={room} key={room.id} onSelect={setSelectedRoom} />)}</ul>
                    }
                </Fragment>
            )}
        </Fragment>
    );
};