import { MapCanvas } from './map-canvas';

const assassinImage = new Image();

const pieces = [
    { x: 0, y: 0, h: 1, w: 1, color: '#aca' },
    { x: 4, y: 4, h: 1, w: 1, color: '#456' },
    { x: 5, y: 1, h: 2, w: 2, color: '#000', image: assassinImage }
];

assassinImage.onload = () => pieces[2].loaded = true; 
assassinImage.src = '/assassin.png';

const mapCanvas = new MapCanvas(document.getElementById('canvas'));
mapCanvas.init(pieces);
