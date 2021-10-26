const express = require('express');
const fs = require('fs');
const thumbsupply = require('thumbsupply');
const cors  = require('cors');
const app = express();

const videos = [
  {
    id: 0,
    poster: '/video/0/poster',
    duration: '3 mins',
    name: 'Yesterday'
  },
  {
    id: 1,
    poster: '/video/1/poster',
    duration: '4 mins',
    name: 'Time'
  },
  // {
  //   id: 2,
  //   poster: '/video/2/poster',
  //   duration: '2 mins',
  //   name: 'Day'
  // },
  // {
  //   id: 3,
  //   poster: '/video/3/poster',
  //   duration: '2 mins',
  //   name: 'Tomorrow'
  // },
  // {
  //   id: 4,
  //   poster: '/video/4/poster',
  //   duration: '2 mins',
  //   name: 'Test'
  // },
  // {
  //   id: 5,
  //   poster: '/video/5/poster',
  //   duration: '2 mins',
  //   name: 'Test_video'
  // },
];

app.use(cors());

// endpoint to fetch all videos metadata
app.get('/videos', function(req, res) {
  res.json(videos);
});

app.get('/video/:id/caption', function(req, res) {
  res.sendFile('assets/captions/sample.vtt', { root: __dirname });
});

app.get('/video/:id/poster', function(req, res) {
  thumbsupply.generateThumbnail(`assets/${req.params.id}.mp4`)
    .then(thumb => res.sendFile(thumb))
    .catch(err => console.log(err))
});

// endpoint to fetch a single video's metadata
app.get('/video/:id/data', function(req, res) {
  const id = parseInt(req.params.id, 10);
  res.json(videos[id]);
});

app.get('/video/:id', function(req, res) {
  const path = `assets/${req.params.id}.gif`;
  const stat = fs.statSync(path);
  const fileSize = stat.size;
  const range = req.headers.range;
  if (range) {
    console.log('we have range', range);
    const parts = range.replace(/bytes=/, "").split("-")
    const start = parseInt(parts[0], 10)
    const end = parts[1] 
      ? parseInt(parts[1], 10)
      : fileSize-1
      console.log(parts)
    const chunksize = (end-start)+1
    const file = fs.createReadStream(path, {start, end})
    const head = {
      'Content-Range': `bytes ${start}-${end}/${fileSize}`,
      'Accept-Ranges': 'bytes',
      'Content-Length': chunksize,
      'Content-Type': 'video/mp4',
    }
    res.writeHead(206, head);
    file.pipe(res);
  } else {
    console.log('no range', range);
    const head = {
      'Content-Length': fileSize,
      'Content-Type': 'video/mp4',
    }
    res.writeHead(200, head)
    fs.createReadStream(path).pipe(res)
  }
});

app.listen(4000, function () {
  console.log('Listening on port 4000!')
});