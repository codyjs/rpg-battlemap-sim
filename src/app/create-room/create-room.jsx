import { createElement, Fragment, useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { BackdropCanvas } from './backdrop-canvas';

export const CreateRoom = () => {
    const [roomName, setRoomName] = useState('');
    const canvasRef = useRef(null);
    const [tileSize, setTileSize] = useState(55);
    const [gridOrigin, setGridOrigin] = useState({ x: 0, y: 0 });

    let backdropCanvas = useRef(null);

    const setBackdropTileSize = (tileSize) => {
        if (backdropCanvas) backdropCanvas.current.setTileSize(tileSize);
        setTileSize(tileSize);
    };

    const setBackdropGridOrigin = (gridOrigin) => {
        if (backdropCanvas) backdropCanvas.current.setGridOrigin(gridOrigin);
        setGridOrigin(gridOrigin);
    }

    useEffect(() => {
        if (!canvasRef.current) return;
        backdropCanvas.current = new BackdropCanvas(canvasRef);
        backdropCanvas.current.setTileSize(tileSize);
        backdropCanvas.current.setGridOrigin(gridOrigin);
        backdropCanvas.current.init();
        return () => {
            backdropCanvas.current.dispose();
        };
    }, []);

    return (
        <Fragment>
            <div id="left-bar" style={{display: 'flex', flexDirection: 'column', alignItems: 'center', background: '#55b', width: '200px', marginRight: '10px', padding: '4px'}}>
                <Link to="/">&lt;&lt; Back</Link>
                <h1>New Room</h1>
                <label htmlFor="roomName">Name: </label>
                <input id="name" onChange={(e) => setRoomName(e.target.value)} value={roomName} />
                <label htmlFor="tileSize">Tile Size: </label>
                <input type="number" onChange={(e) => setBackdropTileSize(e.target.value)} value={tileSize}></input>
                <label htmlFor="image-upload" className="custom-file-upload" style={{marginTop: '10px'}}>Upload Backdrop</label>
                <input id="image-upload" type="file" onChange={(e) => backdropCanvas.current.setImage(e.target.files[0])}/>
                <button onClick={() => setBackdropGridOrigin({ x: 0, y: 0} )} style={{marginTop: '20px'}}>Reset Origin</button>
            </div>
            <canvas id="backdropCanvas" style={{height: '100%', width: '100%', border: 'solid 2px #55b'}} ref={canvasRef}>Your browser doesn't support HTML5 canvas!</canvas>
        </Fragment>
    );
};