import { useEffect, useRef, useState } from "react";
import _ from 'lodash';
import moment from 'moment'

const _alphabet = [..."ABCDEFGHIJKLMNOPQRSTUVWXYZ"]

export const colorOptions = [
  { key: 'red', text: 'Red', value: 'red', label: { color: 'red', circular: true, empty: true }, },
  { key: 'orange', text: 'Orange', value: 'orange', label: { color: 'orange', circular: true, empty: true }, },
  { key: 'yellow', text: 'Yellow', value: 'yellow', label: { color: 'yellow', circular: true, empty: true }, },
  { key: 'olive', text: 'Olive', value: 'olive', label: { color: 'olive', circular: true, empty: true }, },
  { key: 'green', text: 'Green', value: 'green', label: { color: 'green', circular: true, empty: true }, },
  { key: 'teal', text: 'Teal', value: 'teal', label: { color: 'teal', circular: true, empty: true }, },
  { key: 'blue', text: 'Blue', value: 'blue', label: { color: 'blue', circular: true, empty: true }, },
  { key: 'violet', text: 'Violet', value: 'violet', label: { color: 'violet', circular: true, empty: true }, },
  { key: 'purple', text: 'Purple', value: 'purple', label: { color: 'purple', circular: true, empty: true }, },
  { key: 'pink', text: 'Pink', value: 'pink', label: { color: 'pink', circular: true, empty: true }, },
  { key: 'brown', text: 'Brown', value: 'brown', label: { color: 'brown', circular: true, empty: true }, },
  { key: 'grey', text: 'Grey', value: 'grey', label: { color: 'grey', circular: true, empty: true }, },
  { key: 'black', text: 'Black', value: 'black', label: { color: 'black', circular: true, empty: true }, },
]

export const getDomain = (url) => url.replace(/^https?:\/\//i, "");

export const isUrl = (url) => /^(ftp|http|https):\/\/[^ "]+$/.test(url)

export const isSteamKey = (key) => /(\w{5}-){2}\w{5}/.test(key)

export const genericSort = (a, b) => a < b ? -1 : a > b ? 1 : 0

export const alphabetSort = (a, b) => a.toLowerCase() < b.toLowerCase() ? -1 : a.toLowerCase() > b.toLowerCase() ? 1 : 0

export const parseSpreadsheetDate = date => {
  if (date) {
    let parsedDate = new Date(date);

    if (!moment.isDate(date)) {
      parsedDate = moment(date, 'DD/MM/YYYY')
    }

    return moment(parsedDate).format('DD/MM/YYYY')
  }
  else {
    return ""
  }
}

export const corsLink = url => `https://cors-anywhere.herokuapp.com/${url}`;

export const parseOptions = options => options.values
  .reduce((acc, option) => (_.concat(acc, [{
    key: acc.length,
    value: option.value,
    text: option.value,
    color: option.color
  }])), [])
  .sort((a, b) => { return alphabetSort(a.text, b.text) })

export const getIndexByLabel = (label, headers) => _alphabet.indexOf(headers[label].id)

export const getValueByLabel = (label, headers, gameData) => gameData[getIndexByLabel(label, headers)]

export const getPrimaryId = headers => Object.keys(headers).find(key => headers[key].type === 'primary').id

export const getUrlsLocationAndValue = (headers, gameData) => Object.keys(headers)
  .filter(key => headers[key].type === 'url')
  .reduce((result, key) => (_.concat(
    ...result,
    [gameData
      ? {
        index: getIndexByLabel(key, headers),
        label: "URLs",
        website: gameData[getIndexByLabel(key, headers)]
          ? _.lowerCase(gameData[getIndexByLabel(key, headers)]).indexOf("isthereanydeal") > -1
            ? "itad"
            : "steam"
          : "",
        url: gameData[getIndexByLabel(key, headers)],
      }
      : {
        index: getIndexByLabel(key, headers),
        label: "URLs",
      }]
  )), [])

// Custom hook for saving previous value
export function usePrevious(value) {
  const ref = useRef();
  useEffect(() => {
    ref.current = value;
  });
  return ref.current;
}

// Custom hook that will alert once reaching the bottom of the page
export function useBottomPage(offset = 100) {
  const [bottom, setBottom] = useState(false);

  useEffect(() => {
    function handleScroll() {
      // const isBottom = Math.ceil(window.innerHeight + document.documentElement.scrollTop) === document.documentElement.scrollHeight;
      const isBottom = document.documentElement.scrollTop !== 0 && window.innerHeight + document.documentElement.scrollTop > document.documentElement.scrollHeight - offset
      setBottom(isBottom);
    }
    window.addEventListener("scroll", handleScroll);
    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  return bottom;
}

// Custom hook for an setTimeout
export function useInterval(callback, delay) {
  const savedCallback = useRef();

  // Remember the latest callback.
  useEffect(() => {
    savedCallback.current = callback;
  }, [callback]);

  // Set up the interval.
  useEffect(() => {
    function tick() {
      savedCallback.current();
    }
    if (delay !== null) {
      let id = setInterval(tick, delay);
      return () => clearInterval(id);
    }
  }, [delay]);
}

/* EMAIL REGEX: !/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i.test(values.email) */
/* URL REGEX: !/^(ftp|http|https):\/\/[^ "]+$/.test(values.url) */
