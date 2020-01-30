import { MapCanvas } from './map-canvas';

const rects = [
    { x: 0, y: 0, h: 30, w: 30, color: '#aca' },
    { x: 120, y: 120, h: 30, w: 30, color: '#456' },
    { x: 150, y: 30, h: 60, w: 60, color: '#000' }
];

const mapCanvas = new MapCanvas(document.getElementById('canvas'));
mapCanvas.init(rects);
