const path = require('path');
const fs = require('fs');
const express = require('express');
const router = express.Router();
const multer = require('multer');
const upload = multer({
  storage: multer.diskStorage({
    destination: (req, file, cb) => {
        const imageData = JSON.parse(req.body.data);
        const basePath = 'src/server/public/images';

        if (imageData.imageType === 'piece') {
            cb(null, basePath + '/pieces');
        } else {
            cb(null, basePath + '/backdrops');
        }
    },
    filename: (req, file, cb) => {
      const imageData = JSON.parse(req.body.data);
      cb(null, imageData.imageName + file.originalname.slice(file.originalname.lastIndexOf('.')));
    }
  })
});

router.get('/backdrops', function(req, res) {
    const data = fs.readdirSync('src/server/public/images/backdrops');
    res.send({ data });
});

router.get('/pieces', function(req, res) {
  const data = fs.readdirSync('src/server/public/images/pieces');
  res.send({ data });
});

/* POST new image */
router.post('/', upload.single('image'), function(req, res) {
  res.sendStatus(200);
});

module.exports = router;