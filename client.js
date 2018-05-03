const http = require('http');
const { basename } = require('path');
const { createGzip } = require('zlib');
const { createReadStream, stat } = require('fs');

const filePath = process.argv[2];
const req = (stats) => {
  return http.request({
    method: 'POST',
    hostname: '127.0.0.1',
    port: 9292,
    path: `/${stats.fileName}/${stats.size}`
  }, (res) => {
    res.on('data', (response) => {
      console.log(JSON.parse(response.toString()));
    });
  });
};

const stream = () => {
  stat(filePath, (error, stats) => {
    if (error) {
      throw error;
    }

    stats.fileName = basename(filePath);
    const fileStream = createReadStream(filePath)
      .pipe(createGzip({ level: 9 }))
      .pipe(req(stats));

    fileStream.on('close', () => {});
  });
};

stream();
