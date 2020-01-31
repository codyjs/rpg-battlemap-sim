import { createElement, Fragment, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { MapCanvas } from './map-canvas';

function loadImage(piece) {
    if (!piece.imageUrl) return;
    piece.image = new Image();
    piece.image.onload = () => piece.loaded = true;
    piece.image.src = piece.imageUrl;
}

export const MapCanvasContainer = (props) => {

    const canvasRef = useRef({});
    useEffect(() => {
        let mapCanvas = null;
        let ws = new WebSocket(`ws://localhost:3000/api/rooms/${props.room.id}`);
        let cleanup = () => {
            mapCanvas && mapCanvas.dispose();
            ws.send('leave');
            ws.close();
        };
        ws.onopen = function(event) {
            ws.send('getPieces')
        };

        ws.onmessage = function(event) {
            const payload = JSON.parse(event.data);
            switch(payload.type) {
            case 'getPieces':
                const pieces = payload.data;
                pieces.forEach(loadImage);
                mapCanvas = new MapCanvas(canvasRef);
                mapCanvas.addPieces(pieces);
                mapCanvas.init();
                break;
            }
        };

        return cleanup;
    }, []);

    return (
        <Fragment>
            <Link to="/">Leave Room</Link>
            <br></br>
            <canvas style={{border: '1px solid red'}} ref={canvasRef} id="map-canvas">
                Your browser does not support HTML5 Canvas!
            </canvas>
        </Fragment>
    );
}
