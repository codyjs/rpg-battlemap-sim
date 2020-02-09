import { createElement, Fragment, useEffect, useState, useRef, MutableRefObject } from 'react';
import { Link } from 'react-router-dom';
import { MapCanvas } from './map-canvas';
import { Grid } from '../canvas-framework/types';

export const MapCanvasContainer = (props: any) => {

    const [roomName, setRoomName] = useState('');
    const canvasRef: MutableRefObject<HTMLCanvasElement> = useRef(null);
    useEffect(() => {
        let mapCanvas: MapCanvas = null;
        let ws = new WebSocket(`ws://localhost:3000/api/rooms/${props.room.id}`);
        let cleanup = () => {
            mapCanvas && mapCanvas.dispose();
            ws.send('leave');
            ws.close();
        };
        ws.onopen = function() {
            ws.send('getRoomData')
        };

        ws.onmessage = function(event) {
            const payload = JSON.parse(event.data);
            switch(payload.type) {
            case 'getRoomData':
                const pieces = payload.pieces
                const grid = payload.grid;
                const backdrop = payload.backdrop;
                setRoomName(payload.roomName);
                mapCanvas = new MapCanvas(canvasRef);
                mapCanvas.setBackdrop(backdrop);
                mapCanvas.setGrid(new Grid(grid, grid.tileSize));
                mapCanvas.addPieces(pieces);
                mapCanvas.init();
                break;
            }
        };

        return cleanup;
    }, []);

    return (
        <Fragment>
            <div className="left-bar">
                <h1>{roomName}</h1>
                <Link to="/">&lt;&lt; Back</Link>
            </div>
            <canvas style={{height: '100%', width: '100%', border: 'solid 2px #55b'}} ref={canvasRef} id="map-canvas">
                Your browser does not support HTML5 Canvas!
            </canvas>
        </Fragment>
    );
}
