import { createElement, FC } from 'react';
import { Link, useParams } from 'react-router-dom';
import { MapCanvasContainer } from '../../components/map-canvas';

export const Room: FC<{}> = () => {
    const { roomKey } = useParams();

    return (
        <MapCanvasContainer roomKey={parseInt(roomKey)} />
    )
}