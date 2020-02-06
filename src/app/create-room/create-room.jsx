import { createElement, Fragment, useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { MapBuilderCanvas } from './map-builder-canvas';

export const CreateRoom = () => {
    const [roomName, setRoomName] = useState('');
    const canvasElementRef = useRef(null);
    const mapBuilderRef = useRef(null);
    const [backdropImage, setBackdropImage] = useState(null);
    const [gridSize, setGridSize] = useState({ h: 10, w: 10 });
    const [tileSize, setTileSize] = useState(35);
    const [gridOrigin, setGridOrigin] = useState({ x: 0, y: 0 });
    const [imageSize, setImageSize] = useState({ h: 0, w: 0 });

    const setCanvasBackdropImage = (imgFile) => {
        const fr = new FileReader();
        fr.onload = () => {
            const img = new Image();
            img.src = fr.result;
            img.onload = () => {
                mapBuilderRef.current.setBackdropImage(img);
            };
        }
        fr.readAsDataURL(imgFile);
        setBackdropImage(imgFile);
    };

    const setCanvasGridSize = (gridSize) => {
        mapBuilderRef.current.setGridSize(gridSize);
        setGridSize(gridSize);
    };

    const setCanvasTileSize = (tileSize) => {
        mapBuilderRef.current.setTileSize(tileSize);
        setTileSize(tileSize);
    };

    const setCanvasGridOrigin = (gridOrigin) => {
        mapBuilderRef.current.setGridOrigin(gridOrigin);
        setGridOrigin(gridOrigin);
    };

    const saveMap = () => {
        const formData = new FormData();
        formData.append('data', JSON.stringify({
            grid: {
                ...gridOrigin,
                ...gridSize,
                tileSize
            },
            imageSize
        }));
        formData.append('backdrop', backdropImage);
        fetch('/api/rooms', {
            method: 'POST',
            body: formData
        })
    };

    useEffect(() => {
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
            <div id="left-bar" style={{display: 'flex', flexDirection: 'column', alignItems: 'center', background: '#55b', width: '200px', marginRight: '10px', padding: '4px'}}>
                <Link to="/">&lt;&lt; Back</Link>
                <h1>New Room</h1>
                <label htmlFor="roomName">Name: </label>
                <input id="name" onChange={(e) => setRoomName(e.target.value)} value={roomName} />
                <label htmlFor="tile-size">Tile Size:</label>
                <input type="number" onChange={(e) => setCanvasTileSize(e.target.value)} value={tileSize} />
                <label htmlFor="grid-height">Grid Height:</label>
                <input id="grid-height" type="number" min="1" onChange={(e) => setCanvasGridSize({ h: e.target.value, w: gridSize.w })} value={gridSize.h} />
                <label htmlFor="grid-width">Grid Width:</label>
                <input id="grid-width" type="number" min="1" onChange={(e) => setCanvasGridSize({ h: gridSize.h, w: e.target.value })} value={gridSize.w} />
                <label htmlFor="image-upload" className="custom-file-upload" style={{marginTop: '10px'}}>Upload Backdrop</label>
                <input id="image-upload" type="file" onChange={(e) => setCanvasBackdropImage(e.target.files[0])}/>
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