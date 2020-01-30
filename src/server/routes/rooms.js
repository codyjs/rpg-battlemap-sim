const express = require('express');
const router = express.Router();

const rooms = [
  { name: 'My Room', id: 1 },
  { name: 'Another room', id: 2 }
];

const roomPieces = {
  1: [
    { x: 5, y: 3, h: 1, w: 1, color: '#aca', imageUrl: '/api/assets/Tarl.png' },
    { x: 7, y: 5, h: 1, w: 1, color: '#456', imageUrl: '/api/assets/Kor\'tan.png' },
    { x: 6, y: 3, h: 2, w: 2, color: '#000', imageUrl: '/api/assets/owlbear.png' },
    { x: 6, y: 6, h: 1, w: 1, color: '#537', imageUrl: '/api/assets/assassin.png' }
  ],
  2: [
    { x: 0, y: 0, h: 1, w: 1, color: '#456', imageUrl: '/api/assets/Kor\'tan.png' },
    { x: 7, y: 7, h: 2, w: 2, color: '#000', imageUrl: '/api/assets/owlbear.png' },
  ]
}

/* GET rooms listing. */
router.get('/', function(req, res, next) {
  res.send(rooms);
});

router.get('/:id/pieces', function(req, res, next) {
  const pieces = getPiecesForRoom(req.params.id);
  res.send(pieces || []);
});

function getPiecesForRoom(roomId) {
  return roomPieces[roomId];
}

module.exports = router;
