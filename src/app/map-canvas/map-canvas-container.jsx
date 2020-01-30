import { createElement, Fragment, useEffect, useRef } from 'react';
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
        let cleanup = () => { mapCanvas && mapCanvas.dispose() };

        fetch(`/api/rooms/${props.room.id}/pieces`)
            .then(response => response.json())
            .then(pieces => {
                pieces.forEach(loadImage);
                mapCanvas = new MapCanvas(canvasRef);
                mapCanvas.addPieces(pieces);
                mapCanvas.init();
            });

        return cleanup;
    }, []);

    return (
        <Fragment>
            <button onClick={() => props.goBack()}>Leave Room</button>
            <br></br>
            <canvas style={{border: '1px solid red'}} ref={canvasRef} id="map-canvas">
                Your browser does not support HTML5 Canvas!
            </canvas>
        </Fragment>
    );
}
