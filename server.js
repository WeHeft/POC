const express = require('express');
const { createGunzip } = require('zlib');
const { createWriteStream } = require('fs');

const speed = (time, bytesReceived) => {
    const units = ['bps', 'kbps', 'mbps', 'tbps'];
    ({ 0: secs, 1: nanoSecs } = process.hrtime(time));
    nanoSecs /= 1000000000;
    let bpsReceived = Math.ceil(bytesReceived / (secs + nanoSecs)) || 0;
    ({ 0: unit } = units);
    let i = 0;
    while (bpsReceived > 1024 && ++i) {
      unit = units[i];
      bpsReceived /= 1024;
    }

    return `${Math.round(bpsReceived)} ${unit}`;
};

const app = express();
app.post('/:fileName/:fileSize?', (req, res) => {
  const time = process.hrtime();
  let bytesReceived = 0;
  const { fileName, fileSize } = req.params;
  req
    .on('data', (data) => {
      bytesReceived += data.length;
      const percent = Math.ceil(((bytesReceived * 100) / fileSize).toFixed(2));
      process.stdout.clearLine();
      process.stdout.cursorTo(0);
      process.stdout.write(`Receiving: ${fileName} (${percent}% @ ${speed(time, bytesReceived)}) `);
    })
    .on('end', () => {
      res.send({ bytesReceived });
      console.log('✔ \n');
    })
    .on('error', (error) => res.send({ error: error.message }))
    .pipe(createGunzip())
    .pipe(createWriteStream(`./received_${fileName}`));
});

app.listen(9292, () => console.log('Up: http://localhost:9292'));
