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
  const localtion = req.body["localtion"];
  const date = req.body["date"];
  const type = req.body["type"];
  const price = req.body["price"];
  const ip = req.body["ip"];
  const serverName = req.body["serverName"]
  const time_now = new Date().toLocaleString();
  const doc = new PDFDocument()
  doc.font('./fonts/rttf.ttf')

  await QRCode.toDataURL(`${gid}`, function (err, url) {
    if (err) throw err

    doc.translate(52, 740)
    doc.rotate(-90, {origin: [0,0]})
    doc.fontSize(4).text('.', 0, 0)
    doc.fontSize(35).text('東琉線交通客船聯營處', 20, 30)
    doc.fontSize(40).text(`${localtion}`, 20, 90)
    doc.fontSize(40).text(`${type} ${price} 元`, 20, 240)
    doc.fontSize(30).text(`購買時間： ${date}`, 20, 300)
    doc.fontSize(25).text(`${time_now} 印製`, 20, 350)

    doc.image(url, 370, 0, { width: 400 })

    // doc.fontSize(4).text('東琉線交通客船聯營處', 130, 6)
    // doc.fontSize(5).text(`${localtion}`, 130, 17)
    // doc.fontSize(5).text(`${type} ${price} 元`, 130, 23)
    // doc.fontSize(3).text(`購買時間： ${date}`, 130, 35)
    // doc.fontSize(3).text(`${time_now} 印製`, 130, 40)

    doc.pipe(fs.createWriteStream('./test.pdf'))
    doc.pipe(concat(function (data) {
      var printer = ipp.Printer(`http://${ip}/printers/${serverName}`)
      var msg = {
        "operation-attributes-tag": {
          "requesting-user-name": "ExpressPrinterServer",
          "job-name": "tag-template.pdf",
          "document-format": "application/pdf"
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

const server = app.listen(9972, function () {
  const host = server.address().address;
  const port = server.address().port;
  console.log("Example app listening at http://%s:%s", host, port);
});