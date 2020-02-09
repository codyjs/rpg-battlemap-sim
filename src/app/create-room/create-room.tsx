import { createElement, Fragment, useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { MapBuilderCanvas } from './map-builder-canvas';

export const CreateRoom = () => {
    const canvasElementRef = useRef(null);
    const mapBuilderRef = useRef(null);

    const [roomName, setRoomName] = useState('');
    const [backdropImage, setBackdropImage] = useState('');
    const [gridSize, setGridSize] = useState({ h: 10, w: 10 });
    const [tileSize, setTileSize] = useState(35);
    const [gridOrigin, setGridOrigin] = useState({ x: 0, y: 0 });
    const [imageSize, setImageSize] = useState({ h: 0, w: 0 });
    const [backdrops, setBackdrops] = useState([]);

    const setCanvasBackdropImage = (imgName: string) => {
        if (imgName) {
            const img = new Image();
            img.src = '/images/backdrops/' + imgName;
            img.onload = () => {
                mapBuilderRef.current.setBackdropImage(img);
            };
        }
        setBackdropImage(imgName);
    };

    const setCanvasGridSize = (gridSize: { h: number, w: number }) => {
        mapBuilderRef.current.setGridSize(gridSize);
        setGridSize(gridSize);
    };

    const setCanvasTileSize = (tileSize: number) => {
        mapBuilderRef.current.setTileSize(tileSize);
        setTileSize(tileSize);
    };

    const saveMap = () => {
        fetch('/api/rooms', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                name: roomName,
                grid: {
                    ...gridOrigin,
                    ...gridSize,
                    tileSize
                },
                backdrop: {
                    ...imageSize,
                    image: backdropImage
                },
                pieces: []
            })
        });
    };

    useEffect(() => {
        fetch('/api/images/backdrops')
            .then(response => response.json())
            .then(payload => setBackdrops(payload.data));

        mapBuilderRef.current = new MapBuilderCanvas(canvasElementRef);
        mapBuilderRef.current.onGridOriginChange = setGridOrigin;
        mapBuilderRef.current.onImageSizeChange = setImageSize;
        mapBuilderRef.current.setGridSize(gridSize);
        mapBuilderRef.current.setTileSize(tileSize);
        mapBuilderRef.current.setGridOrigin(gridOrigin);
        mapBuilderRef.current.init();
        return () => {
            mapBuilderRef.current.dispose();
        };
    }, []);

    return (
        <Fragment>
            <div className="left-bar">
                <Link to="/">&lt;&lt; Back</Link>
                <h1>New Room</h1>
                <label htmlFor="roomName">Name: </label>
                <input id="name" onChange={(e) => setRoomName(e.target.value)} value={roomName} />
                <label htmlFor="backdrop-select">Backdrop Image:</label>
                <select id="backdrop-select" value={backdropImage} onChange={(e) => setCanvasBackdropImage(e.target.value)}>
                    <option value={''}></option>
                    { backdrops.map(backdrop => <option key={backdrop} value={backdrop}>{backdrop}</option>) }
                </select>
                <label htmlFor="tile-size">Tile Size:</label>
                <input type="number" onChange={(e) => setCanvasTileSize(parseInt(e.target.value))} value={tileSize} />
                <label htmlFor="grid-height">Grid Height:</label>
                <input id="grid-height" type="number" min="1" onChange={(e) => setCanvasGridSize({ h: parseInt(e.target.value), w: gridSize.w })} value={gridSize.h} />
                <label htmlFor="grid-width">Grid Width:</label>
                <input id="grid-width" type="number" min="1" onChange={(e) => setCanvasGridSize({ h: gridSize.h, w: parseInt(e.target.value) })} value={gridSize.w} />
                <label>Image Resolution:</label>
                <p>{imageSize.w} x {imageSize.h}</p>
                <label>Grid Origin:</label>
                <p>{gridOrigin.x}, {gridOrigin.y}</p>
                <button onClick={() => saveMap()}>Save</button>
            </div>
            <canvas id="mapBuilderRef" style={{height: '100%', width: '100%', border: 'solid 2px #55b'}} ref={canvasElementRef}>Your browser doesn't support HTML5 canvas!</canvas>
        </Fragment>
    );
};