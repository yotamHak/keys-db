const functions = require('firebase-functions');
const LINKS_PER_PAGE = 5;

const admin = require('firebase-admin');
admin.initializeApp({
    credential: admin.credential.applicationDefault(),
    // databaseURL: "https://yotam-app.firebaseio.com"
})
const db = admin.firestore();

// // Create and Deploy Your First Cloud Functions
// // https://firebase.google.com/docs/functions/linksPagination?offset={offset}
//
// exports.linkPagination = functions.https.onRequest((request, response) => {
//     response.set('Access-Control-Allow-Origin', "*");
//     let linksRef = db.collection('links')
//     const offset = Number(request.query.offset);
//     linksRef
//         .orderBy('created', 'desc')
//         .limit(LINKS_PER_PAGE)
//         .offset(offset)
//         .get()
//         .then(snapshot => {
//             const links = snapshot.docs.map(doc => {
//                 return {
//                     id: doc.id,
//                     ...doc.data()
//                 }
//             })

//             response.json(links)
//         })
// });

exports.steamOwnedGames = functions.https.onRequest((request, response) => {
    response.set('Access-Control-Allow-Origin', "*");

    return fetch(`http://api.steampowered.com/IPlayerService/GetOwnedGames/v0001/?key=00D5B3E37E04C5E734BF1B98A3CA9ADE}&steamid=76561197967370369&format=json`)
});
