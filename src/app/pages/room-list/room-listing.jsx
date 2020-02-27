import { createElement, useState, Fragment } from 'react';
import { Redirect } from 'react-router-dom';

export const RoomListing = (props) => {
    const [roomKey, setRoomKey] = useState(null);

    const openRoom = () => {
        fetch(`/api/rooms/open/${props.room._id}`, { method: 'POST' })
            .then(response => response.json())
            .then(data => setRoomKey(data.roomKey));
    };

    return roomKey ? <Redirect to={`/rooms/${roomKey}`} /> : (
        <Fragment>
            {props.room.name} <button onClick={openRoom}>Open</button>
        </Fragment>
    );
};
