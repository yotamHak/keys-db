### The TL:DR
[https://keys-db.web.app/](KeysDB) is your private CD-Keys Database that is safe and easy to use with plenty of features that will make your life easy!

### Introduction

As a Gamer and a key hoarder I had gathered a lot of Steam\GOG\Origin\etc keys to keep,
So I started saving it all into a google spreadsheet, from there I added a [https://github.com/yotamHak/Steam-Related/wiki/Google-Apps-Script](GScript) that collected some data about the key I added,
Overtime the GScript turned into a chore to maintain so I decided to upgrade it a bit and add some more functionality to it,
This is the result!

### What's this then?

I set out some goals when making this:
1. Privacy - I wanted privacy and safty as much as you can get, that's why I decided to go with Google Spreadsheets as the Database itself.
2. Functionality - I wanted to add more functionality compared to the GScript.
3. UI\UX - ReactJS is a proven JavaScript library and a well known and loved. (I enjoy using it and learning from it, so that's why I chose it).

### Features

When I started building it, I had some goals, but everytime I used it, I got more and more ideas and features I wanted to add,
So this is still in-progress, but the main, working features are:
1. It's free!
2. It's safe!
3. Easy key adding - Add a game with integrated additional data collection, like appid, related urls (itad, steam) and more...
4. Intuitive UI - Use filters to view your collection of keys.
5. Game information - View extra game information with bundle history and live bundles if available, screenshots\trailers\youtube gameplay, lowest recorded price, reviews, achievements and more
6. Dynamic Fields - Dynamically change fields from a selection of generic field types, and custom types as-well, easy options managments, select what's private, what's filterable and sortable and more. (I'm still adding more support and more fields)
7. Sharing - Are you a trader? well if you are, or you just want to show-off your collection, you can export your collection without the selected private fields (like the keys), and share it with whomever you want.
8. More features are coming!

### Technologies

[https://keys-db.web.app/](KeysDB) is stored on [https://firebase.google.com/](Firebase), and is purely a client app, there's no back-end, no database and no users.

These are the primary technologies I'm using

[https://reactjs.org/](ReactJS)
[https://react-redux.js.org/](React-Redux)
[https://react.semantic-ui.com/](Semantic-UI)

# I'm also using API from

[https://store.steampowered.com/](Steam)
[https://itad.docs.apiary.io/](IsThereAnyDeal API)