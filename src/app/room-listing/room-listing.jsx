import { createElement } from 'react';

export const RoomListing = (props) => {
    return (
    <li>
        <button onClick={() => props.onSelect(props.room)}>{props.room.name}</button>
    </li>);
};
