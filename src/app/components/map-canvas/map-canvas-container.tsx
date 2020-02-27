import { createElement, Fragment, useEffect, useState, useRef, MutableRefObject, FC } from 'react';
import { Link } from 'react-router-dom';
import { MapCanvas } from './map-canvas';
import { Grid, Point, DrawType } from '../../canvas-framework/types';
import { BattlemapWebsocketClient } from './battlemap-websocket-client';
import { RoomData } from '../../../server/models/room-model';
import { NavbarList } from '../navbar-list';

interface MapCanvasContainerProps {
    roomKey: number;
}

export const MapCanvasContainer: FC<MapCanvasContainerProps> = (props: MapCanvasContainerProps) => {

    const [roomName, setRoomName] = useState('');
    const canvasRef: MutableRefObject<HTMLCanvasElement> = useRef(null);
    useEffect(() => {
        let mapCanvas: MapCanvas = null;
        const wsClient = new BattlemapWebsocketClient(props.roomKey);

        wsClient.onRoomData((roomData: RoomData) => {
            setRoomName(roomData.name);
            mapCanvas = new MapCanvas(canvasRef, wsClient);
            mapCanvas.setBackdrop(roomData.backdrop);
            mapCanvas.setGrid(new Grid({renderPriority: 0, drawType: DrawType.Grid, ...roomData.grid}, roomData.grid.tileSize));
            mapCanvas.addPieces(roomData.pieces);
            mapCanvas.init();
        });

        wsClient.onPieceMoved((pieceId: number, to: Point) => mapCanvas.movePiece(pieceId, to));

        wsClient.connect();

        return () => {
            mapCanvas && mapCanvas.dispose();
            wsClient.close();
        };
    }, []);

    return (
        <Fragment>
            <div className="left-bar">
                <h2>{roomName}</h2>
                <NavbarList children={[<Link to="/">&lt;&lt; Back</Link>]} />
            </div>
            <canvas style={{height: '100%', width: '100%', border: 'solid 2px #55b'}} ref={canvasRef} id="map-canvas">
                Your browser does not support HTML5 Canvas!
            </canvas>
        </Fragment>
    );
}
