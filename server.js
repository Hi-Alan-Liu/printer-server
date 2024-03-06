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
  const shortGid = req.body["shortGid"];
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
  const time_now = moment(new Date()).format("YYYY-MM-DD HH:mm");
  const source = req.body["source"];
  const isShowPrintPrice = req.body["isShowPrintPrice"];
  const ticketIconAbbreviation = req.body["ticketIconAbbreviation"];
  const ticketIconAbbreviationBg = './images/ticketIconAbbreviationBg.png';
  const doc = new PDFDocument()
  doc.font('./fonts/rttf.ttf')

  await QRCode.toDataURL(`${gid}`, function (err, url) {
    if (err) throw err

    doc.translate(52, 740)
    doc.rotate(-90, {origin: [0,0]})
    doc.fontSize(4).text('.', 0, 0)
    doc.fontSize(40).text('東琉線交通客船聯營處', 20, 0)
    // doc.fontSize(60).text('來回', 20, 0)
    doc.fontSize(40).text(`${localtion}`, 20, 60)
    doc.fontSize(20).text(`${localtionEn}`, 20, 110)

    doc.image(isRoundTrip, 250, 60, { width: 145 })

    doc.fontSize(33).text(`${passengerName}`, 20, 150)


    

    doc.fontSize(45).text(`${ticketIconAbbreviation}`, 275, 155)

    doc.image(ticketIconAbbreviationBg, 265, 150, { width: 225 })

    doc.fontSize(23).text(`搭乘時間:`, 20, 200)

    doc.fontSize(33).text(`${date}`, 20, 225)

    if (isShowPrintPrice) {
      doc.fontSize(35).text(`${type} ${price} 元`, 20, 270)
    } else {
      doc.fontSize(35).text(`${type}`, 20, 270)
    }
    
    doc.fontSize(27).text(`${source}`, 20, 310)
    doc.fontSize(20).text(`現場購票(當日有效，遺失補票)`, 20, 345)
    doc.fontSize(20).text(`${order} (${shortGid})`, 20, 370)
    doc.fontSize(20).text(`${time_now} 印製`, 20, 395)

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