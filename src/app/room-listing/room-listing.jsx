import { createElement } from 'react';
import { Link } from 'react-router-dom';

export const RoomListing = (props) => {
    return (
    <li>
        <Link to={`/rooms/${props.room.id}`}>{props.room.name}</Link>
    </li>);
};
