const express = require('express');
const router = express.Router();

const rooms = [
  {
    name: 'My Room',
    id: 1,
    pieces: [
      { x: 5, y: 3, h: 1, w: 1, color: '#aca', imageUrl: '/images/Tarl.png' },
      { x: 7, y: 5, h: 1, w: 1, color: '#456', imageUrl: '/images/Kor\'tan.png' },
      { x: 6, y: 3, h: 2, w: 2, color: '#000', imageUrl: '/images/owlbear.png' },
      { x: 6, y: 6, h: 1, w: 1, color: '#537', imageUrl: '/images/assassin.png' }
    ],
    connections: []
  }, {
    name: 'Another room',
    id: 2,
    pieces: [
      { x: 0, y: 0, h: 1, w: 1, color: '#456', imageUrl: '/images/Kor\'tan.png' },
      { x: 7, y: 7, h: 2, w: 2, color: '#000', imageUrl: '/images/owlbear.png' },
    ],
    connections: []
  }
];

/* GET rooms listing. */
router.get('/', function(req, res, next) {
  res.send(rooms.map(room => ({name: room.name, id: room.id })));
});

/* POST new room */
router.post('/', function(req, res, next) {
  const room = req.body;
  console.log(req.body);
  room.id = rooms.map(room => room.id).reduce(Math.max) + 1;
  rooms.push(room);
  res.send(room.id);
});

router.ws('/:id', function(ws, req) {
  try {
    const room = getRoomById(parseInt(req.params.id));
    room.connections.push(ws);
  
    ws.on('message', function(msg) {
      switch(msg) {
        case 'leave':
          room.connections.splice(room.connections.indexOf(ws));
          break;
        case 'getPieces':
          const payload = {
            type: 'getPieces',
            data: room.pieces
          }
          ws.send(JSON.stringify(payload));
          break;
      }
      console.log('got message: ', msg);
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
