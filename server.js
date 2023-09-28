const PDFDocument = require('pdfkit')
const ipp = require('ipp')
const fs = require('fs')
var QRCode = require('qrcode')
var qr = require('qr-image');  
const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const concat = require('concat-stream');

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
    // doc.pipe(fs.createWriteStream('./test.pdf'))
    doc.pipe(concat(function (data) {
      var printer = ipp.Printer('http://127.0.0.1:631/printers/star-tsp700ii')
      var msg = {
        "operation-attributes-tag": {
          "requesting-user-name": "ExpressPrinterServer",
          "job-name": "tag-template.pdf",
          "document-format": "application/pdf"
        },
        "job-attributes-tag":{
          "media-col": {
            "media-source": "tray-2"
          }
        },
        data: data
      }
      printer.execute("Print-Job", msg, function(err, res){
        console.log('error => ', err)
        console.log('result => ', res)
      })
    }))
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