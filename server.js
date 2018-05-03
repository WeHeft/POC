const express = require('express');
const { createGunzip } = require('zlib');
const { createWriteStream } = require('fs');

const app = express();
app.post('/:fileName/:fileSize?', (req, res) => {
  let bytesReceived = 0;
  const { fileName, fileSize } = req.params;
  req
    .on('data', (data) => {
      bytesReceived += data.length;
      const percent = Math.ceil(((bytesReceived * 100) / fileSize).toFixed(2));
      process.stdout.clearLine();
      process.stdout.cursorTo(0);
      process.stdout.write(`Receiving: ${fileName} (${percent}%) `);
    })
    .on('end', () => {
      res.send(JSON.stringify({ bytesReceived }));
      console.log('✔ \n');
    })
    .on('error', (error) => res.send(JSON.stringify({ error: error.message })))
    .pipe(createGunzip())
    .pipe(createWriteStream(`./received_${fileName}`));
});

app.listen(9292, () => console.log('Up: http://localhost:9292'));
