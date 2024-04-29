require('dotenv').config();
const express = require('express');
const cors = require('cors');
const app = express();
const bodyparser = require("body-parser");
const fs = require("fs");
const dns = require("dns");
app.use(bodyparser.urlencoded({ extended: false }))
// Basic Configuration
const port = process.env.PORT || 3000;
app.use(cors());

app.use('/public', express.static(`${process.cwd()}/public`));

app.get('/', function (req, res) {
  res.sendFile(process.cwd() + '/views/index.html');
});

// Your first API endpoint
app.get('/api/hello', function (req, res) {
  res.json({ greeting: 'hello API' });
});

app.post("/api/shorturl", function (req, res) {
  const { url } = req.body;
  const newurl = new URL(url);
  const verifyDNS = dns.lookup(newurl.hostname, (error, address, family) => {
    if (error) {
      res.json({ error: 'invalid url' })
    } else {
      const url_file = fs.readFileSync(__dirname + '/url.json');
      var urlObject = JSON.parse(url_file);
      const short_url = Math.floor(Math.random() * 100000);
      const urls = { original_url: url, short_url: short_url }
      urlObject.push(urls);
      var urlStringify = JSON.stringify(urlObject);
      fs.writeFile(__dirname + '/url.json', urlStringify, function (err) {
        if (err) throw err;
        res.json(urls)
      });
    }
  });

})

app.get("/api/shorturl/:short_url", function (req, res) {
  const { short_url } = req.params;
  const url_file = fs.readFileSync(__dirname + '/url.json');
  var urlObject = JSON.parse(url_file);
  console.log(short_url);
  const filteredUrl = urlObject.find((value) => {
    return value.short_url === Number(short_url);
});
if (!filteredUrl) {
  res.json({ error: 'invalid url' });
}else{
  res.redirect(filteredUrl?.original_url)

}
})
app.listen(port, function () {
  console.log(`Listening on port ${port}`);
});
