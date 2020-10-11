export const SPREADSHEET_METADATA_HEADERS_ID = 1986
export const SPREADSHEET_METADATA_PERMISSIONS_ID = 1988
export const SPREADSHEET_METADATA_SHEET_ID = 1910
export const SPREADSHEET_METADATA_DEFAULT_SETTINGS = { "ID": { "id": "A", "label": "ID", "type": "number", "pattern": "General", "display": false }, "Title": { "id": "B", "label": "Title", "type": "steam_title", "isPrivate": false, "display": true, "isFilter": false, "sortable": false }, "Status": { "id": "C", "label": "Status", "type": "dropdown", "isPrivate": false, "options": { "allowEdit": false, "values": [{ "value": "Used", "color": "red" }, { "value": "Unused", "color": "green" }, { "value": "Traded", "color": "yellow" }, { "value": "Gifted", "color": "orange" }] }, "display": true, "isFilter": true, "sortable": true }, "Key": { "id": "D", "label": "Key", "type": "key", "isPrivate": true, "display": true, "isFilter": false, "sortable": false }, "From": { "id": "E", "label": "From", "type": "dropdown", "isPrivate": false, "options": { "allowEdit": true, "values": [{ "value": "Fanatical", "color": "green" }, { "value": "Indiegala", "color": "red" }, { "value": "Other", "color": "grey" }, { "value": "Amazon", "color": "brown" }, { "value": "Alienware", "color": "blue" }, { "value": "AMD", "color": "orange" }, { "value": "Indiegamestand", "color": "pink" }, { "value": "Sega", "color": "blue" }, { "value": "DigitalHomicide", "color": "brown" }, { "value": "Humblebundle", "color": "blue" }] }, "display": true, "isFilter": true, "sortable": true }, "Own Status": { "id": "F", "label": "Own Status", "type": "steam_ownership", "isPrivate": false, "options": { "allowEdit": false, "values": [{ "value": "Own", "color": "green" }, { "value": "Missing", "color": "red" }] }, "display": true, "isFilter": true, "sortable": true }, "Date Added": { "id": "G", "label": "Date Added", "type": "date", "pattern": "dd-mm-yyyy", "isPrivate": true, "display": true, "isFilter": true, "sortable": true }, "Note": { "id": "H", "label": "Note", "type": "text", "isPrivate": true, "display": true, "isFilter": false, "sortable": false }, "isthereanydeal URL": { "id": "I", "label": "isthereanydeal URL", "type": "url", "isPrivate": false, "display": true, "isFilter": false, "sortable": false }, "Steam URL": { "id": "J", "label": "Steam URL", "type": "steam_url", "isPrivate": false, "display": true, "isFilter": false, "sortable": false }, "Cards": { "id": "K", "label": "Cards", "type": "steam_cards", "isPrivate": false, "options": { "allowEdit": false, "values": [{ "value": "Have", "color": "green" }, { "value": "Missing", "color": "red" }] }, "display": true, "isFilter": true, "sortable": true }, "AppId": { "id": "L", "label": "AppId", "type": "steam_appid", "pattern": "General", "isPrivate": false, "display": true, "isFilter": false, "sortable": false } }
export const SPREADSHEET_TEMPLATE_SPREADSHEET_ID = '13WFCn_RDuz9ZaCS4fj5VkpCUTz8HuIhSTYRjSXC-7bU'
export const SPREADSHEET_IMPORT_TEMPLATE_SPREADSHEET_ID = '1qlzwzis9pyxI_C2s534oOPDjCaMp8ou_nTQ_SClZTxg'