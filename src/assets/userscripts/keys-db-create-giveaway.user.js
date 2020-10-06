// ==UserScript==
// @name         Keys-DB Create Giveaway
// @namespace    http://tampermonkey.net/
// @version      0.1
// @downloadURL  https://github.com/yotamHak/keys-db/raw/master/src/assets/userscripts/keys-db-create-giveaway.user.js
// @description  Handles setting giveaway from keys-db
// @author       Keys-DB
// @match        https://www.steamgifts.com/giveaways/new*
// @grant        none
// ==/UserScript==

'use strict';

const params = getUrlParams();
const form = $('.form__submit-button.js__submit-form').closest('form');

$(document).on('ajaxSuccess.batch', (e, xhr, settings) => {
    if (settings.data.match(`${params.get('appid')}`)) {
        const result = JSON.parse(xhr.responseText).html.match(`${params.get('appid')}`);

        if (result) {
            const node = result.input.match(`data-autocomplete-id=\"(\\d+)\"`);

            if (node) {
                $(`[data-autocomplete-id=${node[1]}]`).click();
            } else {
                console.log("Game not found");
            }

            $(document).trigger("fillKey");
            $(document).trigger("fillStartingDateOffset");
            $(document).trigger("fillEndingDate");
        }
    }
});

function formatDate(date) {
    let formattedDate = $.datepicker.formatDate('M d, yy', date);
    const hours = date.getHours() % 12 < 10 ? '0' + date.getHours() % 12 : date.getHours() % 12;
    const minutes = date.getMinutes() < 10 ? '0' + date.getMinutes() : date.getMinutes();
    const ampm = date.getHours() >= 12 ? 'pm' : 'am';
    formattedDate += " " + hours + ":" + minutes + " " + ampm;

    return formattedDate;
}

function setValueAndTriggerEvent(element, value, eventType) {
    element.val(value).trigger(eventType);
}

function getUrlParams() {
    const queryString = window.location.search;
    const urlParams = new URLSearchParams(queryString);

    return urlParams
}

function fillGameName(appid) {
    const gameInput = $(`input.js__autocomplete-name`);
    setValueAndTriggerEvent(gameInput, appid, 'keyup');
}

function selectGiveawayType(type = `key`) {
    const giveawayTypeKeyValue = form.find(`[data-checkbox-value=${type}]`);
    giveawayTypeKeyValue.click();
}

function fillGameKey(key) {
    const keyTextarea = form.find('textarea[name="key_string"]');
    setValueAndTriggerEvent(keyTextarea, key, 'keyup');
}

function fillStartingDateOffset(startingOffset) {
    const startingDateElement = form.find("input[name='start_time']");
    startingDateElement.val(formatDate(new Date(new Date().getTime() + startingOffset * 60000)));
}

function fillEndingDate(endingIn) {
    const endingDateElement = form.find("input[name='end_time']");
    endingDateElement.val(formatDate(new Date(new Date().getTime() + endingIn * 60000)));
}

params.forEach((param, paramKey) => {
    switch (paramKey) {
        case `appid`:
            fillGameName(param);
            break;
        case `key`:
            $(document).on("fillKey", function (event) {
                fillGameKey(param);
                $(document).off("fillKey");
            }).bind(param);
            break;
        case `starting-time-offset`:
            $(document).on("fillStartingDateOffset", function (event) {
                fillStartingDateOffset(param);
                $(document).off("fillStartingDateOffset");
            }).bind(param);
            break;
        case `time-active`:
            $(document).on("fillEndingDate", function (event) {
                fillEndingDate(param);
                $(document).off("fillEndingDate");
            }).bind(param);
            break;
        default:
    }
});

selectGiveawayType();