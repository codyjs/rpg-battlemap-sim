import { createElement } from 'react';
import { Link, useParams } from 'react-router-dom';
import { MapCanvasContainer } from '../map-canvas';

export const Room = (props) => {
    const { roomKey } = useParams();

    return (
        <MapCanvasContainer roomKey={roomKey} />
    )
}