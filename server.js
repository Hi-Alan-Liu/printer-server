const PDFDocument = require('pdfkit');
const ipp = require('ipp');
const fs = require('fs');
var QRCode = require('qrcode');
var moment = require('moment');
var cors = require('cors');
const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const concat = require('concat-stream');


app.use(cors());
app.use(bodyParser.json()) // for parsing application/json
app.use(bodyParser.urlencoded({ extended: true })) // for parsing application/x-www-form-urlencoded

app.get('/', function (req, res) {
  res.sendfile('./views/home.html');
});

app.post('/api/printer', async function (req, res) {
  const gid = req.body["gid"];
  const localtion = req.body["localtion"];
  const localtionEn = req.body["localtionEn"];
  const date = req.body["date"];
  const type = req.body["type"];
  const price = req.body["price"];
  const passengerName = req.body["passengerName"];
  const ip = req.body["ip"];
  const serverName = req.body["serverName"];
  const order = req.body["order"];
  const isRoundTrip = req.body["isRoundTrip"] ? './images/roundTrip_true.png' : './images/roundTrip_false.png';
  const time_now = moment(new Date(), "YYYY-MM-DD HH:mm:ss");//new Date().toLocaleString();
  const doc = new PDFDocument()
  doc.font('./fonts/rttf.ttf')

  await QRCode.toDataURL(`${gid}`, function (err, url) {
    if (err) throw err

    doc.translate(52, 740)
    doc.rotate(-90, {origin: [0,0]})
    doc.fontSize(4).text('.', 0, 0)
    doc.fontSize(40).text('東琉線交通客船聯營處', 20, 20)
    // doc.fontSize(60).text('來回', 20, 0)
    doc.fontSize(50).text(`${localtion}`, 20, 85)
    doc.fontSize(25).text(`${localtionEn}`, 20, 140)
    doc.fontSize(35).text(`${passengerName}`, 20, 200)
    doc.fontSize(40).text(`${type} ${price} 元`, 20, 260)
    doc.image(isRoundTrip, 225, 165, { width: 180 })

    doc.fontSize(25).text(`搭乘時間： ${date}`, 20, 320)
    doc.fontSize(20).text(`${order}`, 20, 355)
    doc.fontSize(20).text(`${time_now} 印製`, 20, 380)

    doc.image(url, 380, 0, { width: 380 })
    doc.image('./images/Remark.png', 430, 360, { width: 260 })

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

const server = app.listen(9999, function () {
  const host = server.address().address;
  const port = server.address().port;
  console.log("Example app listening at http://%s:%s", host, port);
});