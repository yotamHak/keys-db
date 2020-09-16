# The TL:DR
[KeysDB](https://keys-db.web.app/) is a completely **free** and **private** database for managing your collection of game keys, with features that appeal for regular gamers, traders and collectors. 👏

# Introduction

As a Gamer and a key hoarder I had gathered a lot of Steam\GOG\Origin\etc keys to keep,
So I started saving it all into a google spreadsheet, from there I added a [GScript](https://github.com/yotamHak/Steam-Related/wiki/Google-Apps-Script) that collected some data about the key I added,
Overtime the GScript turned into a chore to maintain so I decided to upgrade it a bit and add some more functionality to it,
This is the result!

# What's this then?

I set out some goals when making this:
1. Privacy - I wanted privacy and safty as much as you can get, that's why I decided to go with Google Spreadsheets as the Database itself.
2. Functionality - I wanted to add more functionality compared to the GScript.
3. UI\UX - ReactJS is a proven JavaScript library and a well known and loved. (I enjoy using it and learning from it, so that's why I chose it).

# Features

When I started building it, I had some goals, but everytime I used it, I got more and more ideas and features I wanted to add,
So this is still in-progress, but the main, working features are:
1. Easy key adding - Add a game with integrated additional data collection, like appid, related urls (itad, steam) and more...
2. Intuitive UI - Use filters to view your collection of keys.
3. Game information - View extra game information with bundle history and live bundles if available, screenshots\trailers\youtube gameplay, lowest recorded price, reviews, achievements and more
4. Dynamic Fields - Dynamically change fields from a selection of generic field types, and custom types as-well, easy options managments, select what's private, what's filterable and sortable and more. (I'm still adding more support and more fields)
5. Sharing - Are you a trader? well if you are, or you just want to show-off your collection, you can export your collection without the selected private fields (like the keys), and share it with whomever you want.
6. More features are coming!

# Technologies

[KeysDB](https://keys-db.web.app/) is stored on [Firebase](https://firebase.google.com/), and is a pure client app, there's no back-end, no database and no users.

These are the primary technologies I'm using:

[ReactJS](https://reactjs.org/)

[React-Redux](https://react-redux.js.org/)

[Semantic-UI](https://react.semantic-ui.com/)

### I'm also using API from

[Steam](https://store.steampowered.com/)

[IsThereAnyDeal](https://itad.docs.apiary.io/)
