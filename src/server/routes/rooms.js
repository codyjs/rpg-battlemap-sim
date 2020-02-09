const express = require('express');
const router = express.Router();
const multer = require('multer');

const rooms = [
  {
    name: 'My Room',
    id: 1,
    backdrop: {
      image: 'Hidden Altar.jpg',
      w: 748, h: 544
    },
    grid: {
      x: 34, y: 34, w: 20, h: 14, tileSize: 34
    },
    pieces: [
      { x: 5, y: 3, h: 1, w: 1, color: '#aca', image: 'Tarl.png' },
      { x: 7, y: 5, h: 1, w: 1, color: '#456', image: 'Kor\'tan.png' },
      { x: 6, y: 3, h: 2, w: 2, color: '#000', image: 'owlbear.png' },
      { x: 6, y: 6, h: 1, w: 1, color: '#537', image: 'assassin.png' }
    ],
    connections: []
  }
];

/* GET rooms listing. */
router.get('/', function(req, res, next) {
  res.send(rooms.map(room => ({name: room.name, id: room.id })));
});

/* POST new room */
router.post('/', function(req, res) {
  const room = req.body;
  console.log(room);
  room.id = rooms.map(room => room.id).reduce((prev, current) => Math.max(prev, current)) + 1;
  rooms.push(room);
  res.send({ roomId: room.id });
});

router.ws('/:id', function(ws, req) {
  try {
    const room = getRoomById(parseInt(req.params.id));
    room.connections.push(ws);
  
    ws.on('message', function(msgData) {
      const msg = JSON.parse(msgData);
      switch(msg.messageType) {
        case 'leave':
          room.connections.splice(room.connections.indexOf(ws));
          break;
        case 'getRoomData':
          const payload = {
            messageType: 'getRoomData',
            grid: room.grid,
            pieces: room.pieces,
            backdrop: room.backdrop,
            roomName: room.name
          }
          ws.send(JSON.stringify(payload));
          break;
        case 'movePiece':
          const piece = room.pieces[msg.data.pieceId];
          piece.x = msg.data.to.x;
          piece.y = msg.data.to.y;
          room.connections.forEach(conn => {
            conn.send(msgData);
          });
          break;
        default:
          console.log(msg);
      }
    });
  } catch (e) {
    console.error(e);
    throw e;
  }
});

function getRoomById(roomId) {
  return rooms.find(room => room.id === roomId);
}

module.exports = router;
