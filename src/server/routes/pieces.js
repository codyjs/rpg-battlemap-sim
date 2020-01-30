const express = require('express');
const router = express.Router();

const pieces = [
  { x: 5, y: 3, h: 1, w: 1, color: '#aca', imageUrl: '/api/assets/Tarl.png' },
  { x: 7, y: 5, h: 1, w: 1, color: '#456', imageUrl: '/api/assets/Kor\'tan.png' },
  { x: 6, y: 3, h: 2, w: 2, color: '#000', imageUrl: '/api/assets/owlbear.png' },
  { x: 6, y: 6, h: 1, w: 1, color: '#537', imageUrl: '/api/assets/assassin.png' }
];

/* GET pieces listing. */
router.get('/', function(req, res, next) {
  res.send(pieces);
});

module.exports = router;
