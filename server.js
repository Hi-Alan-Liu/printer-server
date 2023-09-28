const PDFDocument = require('pdfkit')
const fs = require('fs')
var QRCode = require('qrcode')
var qr = require('qr-image');  
const express = require('express');
const app = express();
const bodyParser = require('body-parser')

app.use(bodyParser.json()) // for parsing application/json
app.use(bodyParser.urlencoded({ extended: true })) // for parsing application/x-www-form-urlencoded

app.get('/', function (req, res) {
  res.sendfile('./views/home.html');
});

app.post('/api/printer', async function (req, res) {
  const gid = req.body["gid"];
  const doc = new PDFDocument({
    size: [114, 52],
    margin: 0
  })

  await QRCode.toDataURL(`${gid}`, function (err, url) {
    if (err) throw err
    doc.image(url, 30, 2, { width: 50 })
    doc.pipe(fs.createWriteStream('./test.pdf'))
    doc.end()
  })

  res.send({success: true});
});

app.get('*', function(req, res) {
  res.send('404 not found');
});

const server = app.listen(8082, function () {
  const host = server.address().address;
  const port = server.address().port;
  console.log("Example app listening at http://%s:%s", host, port);
});