import { createElement, Fragment } from 'react';
import { Link } from 'react-router-dom';
import { RoomListing } from '../room-listing';

export const MainMenu = (props) => {
    
    return (
        <Fragment>
            <h1>Main Menu</h1>
            {(!props.rooms || props.rooms.length === 0)
                ? <p>Loading...</p>
                : <ul>{props.rooms.map(room => <RoomListing room={room} key={room.id} />)}</ul>
            }
            <br/>
            <Link to="/create-room">Create Room</Link>
        </Fragment>
    );
}
