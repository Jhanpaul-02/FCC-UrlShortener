require('dotenv').config();
const express = require('express');
const cors = require('cors');
const app = express();
const { MongoClient } = require('mongodb');
const urlparser = require('url');
const dns = require('dns');
const { url } = require('inspector');


const client = new MongoClient(process.env.MONGO_URL);
const db = client.db("urlshortener");
const urls = db.collection("urls");

app.use(express.json());
app.use(express.urlencoded({extended: true}));


// Basic Configuration
const port = process.env.PORT || 3000;


app.use(cors());

app.use('/public', express.static(`${process.cwd()}/public`));

app.get('/', function(req, res) {
  res.sendFile(process.cwd() + '/views/index.html');
});


// Your first API endpoint
app.post('/api/shorturl', function(req, res) {
  console.log(req.body)
  const url = req.body.url;
  const dnsLookup = dns.lookup(urlparser.parse(url).hostname, async (err, address) => {
    if (!address){
      res.json({error: 'invalid url'});
    } else {
      const urlCount = await  urls.countDocuments({})
      const urlDoc = {
        url,
        short_url: urlCount
      }
      const result = await urls.insertOne(urlDoc);
      console.log(result);
      res.json({original_url: url, short_url: urlCount});
    }
  })
});

app.get('/api/shorturl/:short_url', async (req, res) =>{
  const shorturl = req.params.short_url;  
  const urlDoc = await urls.findOne({short_url: +shorturl});
  res.redirect(urlDoc.url);
})

app.listen(port, function() {
  console.log(`Listening on port ${port}`);
});
