import { createElement } from 'react';
import { Link, useParams } from 'react-router-dom';
import { MapCanvasContainer } from '../map-canvas';

export const Room = (props) => {
    const { roomId } = useParams();
    const room = props.rooms.find(room => room.id === parseInt(roomId));
    if (!room) {
        throw new Error(`Room with id ${roomId} not found`);
    }

    return (
        <MapCanvasContainer room={room} />
    )
}