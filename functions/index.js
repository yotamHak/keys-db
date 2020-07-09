const functions = require('firebase-functions');
const express = require('express');
const https = require('https');
const app = express();
const cors = require('cors')({ origin: true });
app.use(cors);

const admin = require('firebase-admin');
const { request } = require('http');
admin.initializeApp({
    credential: admin.credential.applicationDefault()
})

const httpGet = url => {
    return new Promise((resolve, reject) => {
        http.get(url, res => {
            res.setEncoding('utf8');
            let body = '';
            res.on('data', chunk => body += chunk);
            res.on('end', () => resolve(body));
        }).on('error', reject);
    });
};

app.get('/api/appDetails', (request, response) => {
    response.set('Access-Control-Allow-Origin', "*");
    response.set('Cache-Control', 'public, max-age=300, s-maxage=600')
    cors(request, response, () => { });

    const appids = Number(request.query.appids);
    const url = `https://store.steampowered.com/api/appdetails/?appids=${appids}`

    https.get(url, res => {
        let body = '';

        res.on('data', function (chunk) {
            body += chunk;
        });

        res.on('end', function () {
            response.json({ status: "ok", result: JSON.parse(body)[appids] });
        });

    }).on('error', function (e) {
        console.log("Got error: " + e.message);
    })
})

app.get('/api/ownedGames', (request, response) => {
    response.set('Access-Control-Allow-Origin', "*");
    response.set('Cache-Control', 'public, max-age=300, s-maxage=600')
    cors(request, response, () => { });

    const apiKey = "00D5B3E37E04C5E734BF1B98A3CA9ADE"
    const steamId = "76561197967370369"
    const url = `https://api.steampowered.com/IPlayerService/GetOwnedGames/v0001/?key=${apiKey}&include_played_free_games=1&include_appinfo=1&steamid=${steamId}&format=json`
    // const url = `http://store.steampowered.com/api/appdetails/?appids=57690`

    https.get(url, res => {
        let body = '';

        res.on('data', function (chunk) {
            body += chunk;
        });

        res.on('end', function () {
            response.json({ status: "ok", result: JSON.parse(body).response });
        });

    }).on('error', function (e) {
        console.log("Got error: " + e.message);
    })
})

app.get('/api/ownedGames-cached', (request, response) => {
    response.set('Cache-Control', 'public, max-age=300, s-maxage=600')
    response.send(`${Date.now()}`)
})

exports.app = functions.https.onRequest(app);