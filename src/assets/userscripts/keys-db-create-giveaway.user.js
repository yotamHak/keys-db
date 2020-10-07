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

function formatDate(date) {
    let formattedDate = $.datepicker.formatDate('M d, yy', date);
    const hours = date.getHours() % 12 < 10 ? '0' + date.getHours() % 12 : date.getHours() % 12;
    const minutes = date.getMinutes() < 10 ? '0' + date.getMinutes() : date.getMinutes();
    const ampm = date.getHours() >= 12 ? 'pm' : 'am';
    formattedDate += " " + hours + ":" + minutes + " " + ampm;

    return formattedDate;
}

function getUrlParams() {
    const queryString = window.location.search;
    const urlParams = new URLSearchParams(queryString);

    return urlParams
}

function runOnEvent() {
    if (this.value) {
        this.element.val(this.value);
    }

    if (this.triggerEventName) {
        this.element.trigger(this.triggerEventName);
    }

    if (this.event) {
        $(document).off(this.event);
    }
}

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
})

$(document).ready(() => {
    params.forEach((param, paramKey) => {
        switch (paramKey) {
            case `appid`:
                runOnEvent.bind({
                    "element": form.find(`input.js__autocomplete-name`),
                    "value": param,
                    "triggerEventName": "keyup",
                })();
                break;
            case `key`:
                $(document).on("fillKey",
                    runOnEvent.bind({
                        "event": "fillKey",
                        "element": form.find('textarea[name="key_string"]'),
                        "value": param,
                        "triggerEventName": "keyup",
                    }));
                break;
            case `starting-time-offset`:
                $(document).on("fillStartingDateOffset",
                    runOnEvent.bind({
                        "event": "fillStartingDateOffset",
                        "element": form.find("input[name='start_time']"),
                        "value": formatDate(new Date(new Date().getTime() + param * 60000))
                    }));
                break;
            case `time-active`:
                $(document).on("fillEndingDate",
                    runOnEvent.bind({
                        "event": "fillEndingDate",
                        "element": form.find("input[name='end_time']"),
                        "value": formatDate(new Date(new Date().getTime() + param * 60000))
                    }));
                break;
            default:
        }
    });

    runOnEvent.bind({
        "element": form.find(`[data-checkbox-value=key]`),
        "triggerEventName": "click",
    })();
})