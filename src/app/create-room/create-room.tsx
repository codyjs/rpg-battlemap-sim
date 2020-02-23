import { createElement, Fragment, useState, useRef, useEffect, FC } from 'react';
import { Link, Redirect } from 'react-router-dom';
import { MapBuilderCanvas } from './map-builder-canvas';
import { RoomModel } from '../../server/models/room-model';

interface CreateRoomProps {
    onSave: (room: RoomModel) => void;
}

export const CreateRoom: FC<CreateRoomProps> = (props) => {
    const canvasElementRef = useRef<HTMLCanvasElement>(null);
    const mapBuilderRef = useRef<MapBuilderCanvas>(null);

    const [roomName, setRoomName] = useState('');
    const [backdropImage, setBackdropImage] = useState(null);
    const [gridSize, setGridSize] = useState({ h: 10, w: 10 });
    const [tileSize, setTileSize] = useState(35);
    const [gridOrigin, setGridOrigin] = useState({ x: 0, y: 0 });
    const [imageSize, setImageSize] = useState({ h: 0, w: 0 });
    const [saved, setSaved] = useState(false);

    const setCanvasBackdropImage = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files[0];
        const fileReader = new FileReader();
        fileReader.onload = () => {
            const img = new Image();
            img.src = fileReader.result.toString();
            img.onload = () => {
                mapBuilderRef.current.setBackdropImage(img);
            };
        };
        fileReader.readAsDataURL(file);
        setBackdropImage(file);
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
        const formData = new FormData();
        formData.append('data', JSON.stringify({
            name: roomName,
            grid: {
                ...gridOrigin,
                ...gridSize,
                tileSize
            },
            backdrop: {
                ...imageSize
            },
            pieces: []
        }));
        formData.append('image', backdropImage);
        fetch('/api/rooms', {
            method: 'POST',
            body: formData
        })
        .then(response => response.json())
        .then(room => {
            props.onSave(room);
            setSaved(true);
        });
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

    if (saved) return <Redirect to="/rooms" />;

    return (
        <Fragment>
            <div className="left-bar">
                <Link to="/">&lt;&lt; Back</Link>
                <h1>New Room</h1>
                <label htmlFor="roomName">Name: </label>
                <input id="name" onChange={(e) => setRoomName(e.target.value)} value={roomName} />
                <label htmlFor="backdrop-select">Backdrop Image:</label>
                <label htmlFor="image-upload" className="custom-file-upload" style={{marginTop: '10px'}}>Select Image</label>
                <input id="image-upload" type="file" onChange={setCanvasBackdropImage}/>
                <label htmlFor="tile-size">Tile Size:</label>
                <input type="number" onChange={(e) => setCanvasTileSize(parseInt(e.target.value))} value={tileSize} />
                <label htmlFor="grid-height">Grid Height:</label>
                <input id="grid-height" type="number" min="1" onChange={(e) => setCanvasGridSize({ h: parseInt(e.target.value), w: gridSize.w })} value={gridSize.h} />
                <label htmlFor="grid-width">Grid Width:</label>
                <input id="grid-width" type="number" min="1" onChange={(e) => setCanvasGridSize({ h: gridSize.h, w: parseInt(e.target.value) })} value={gridSize.w} />
                <label>Image Size:</label>
                <p>{imageSize.w} x {imageSize.h}</p>
                <label>Grid Origin:</label>
                <p>{gridOrigin.x}, {gridOrigin.y}</p>
                <button onClick={() => saveMap()}>Save</button>
            </div>
            <canvas id="mapBuilderRef" style={{height: '100%', width: '100%', border: 'solid 2px #55b'}} ref={canvasElementRef}>Your browser doesn't support HTML5 canvas!</canvas>
        </Fragment>
    );
};