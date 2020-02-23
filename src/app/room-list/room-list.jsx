import { createElement } from 'react';
import { Link } from 'react-router-dom';
import { RoomListing } from '../room-listing';

export const RoomList = (props) => {
    
    return (
        <div  style={{display: 'flex', flexDirection: 'column', alignItems: 'center', background: '#55b', width: '200px', marginRight: '10px', padding: '4px'}}>
            <h1>Room List</h1>
            <Link to="/">&lt;&lt; Back</Link>
            {(!props.rooms || props.rooms.length === 0)
                ? <p>Loading...</p>
                : <ul>{props.rooms.map(room => <RoomListing room={room} key={room._id} />)}</ul>
            }
            <Link to="/create-room">Create Room</Link>
        </div>
    );
}