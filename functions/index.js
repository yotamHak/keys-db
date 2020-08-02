const functions = require('firebase-functions');
const express = require('express');
const https = require('https');
const app = express();
const cors = require('cors')({ origin: true });
const admin = require('firebase-admin');
const cheerio = require('cheerio');

app.use(cors);

admin.initializeApp({
    credential: admin.credential.applicationDefault()
})

// const { request } = require('http');
// const httpGet = url => {
//     return new Promise((resolve, reject) => {
//         http.get(url, res => {
//             res.setEncoding('utf8');
//             let body = '';
//             res.on('data', chunk => body += chunk);
//             res.on('end', () => resolve(body));
//         }).on('error', reject);
//     });
// };

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

    const apiKey = ""
    const steamId = ""
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

app.get('/api/removedGames', (request, response) => {
    response.set('Access-Control-Allow-Origin', "*");
    response.set('Cache-Control', 'public, max-age=300, s-maxage=600')
    cors(request, response, () => { });

    const url = `https://steam-tracker.com/apps/delisted`

    https.get(url, res => {
        let body = '';

        res.on('data', function (chunk) {
            body += chunk;
        });

        res.on('end', function () {
            const $ = cheerio.load(body)
            let games = {}

            $('#delisted-apps tbody tr')
                .each(function () {
                    const rarity = $(this).children('td:nth-child(1)').children('.text-smaller').text().replace('(','').replace(')','').replace(' ','')
                    const appid = $(this).attr('data-appid')
                    const href = $(this).children('td:nth-child(2)').children('a').attr('href')
                    const appname = $(this).children('td:nth-child(3)').text()
                    const type = $(this).children('td:nth-child(4)').text()

                    games[appid] = {
                        "name": appname,
                        "type": type,
                        "steamdb": href,
                        "rarity": rarity,
                    }
                });

            response.json({ status: 200, data: { removedGames: games } });
        });

    }).on('error', function (e) {
        console.log("Got error: " + e.message);
    })
})

exports.api = functions.https.onRequest(app);