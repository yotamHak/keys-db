import { useEffect, useRef, useState } from "react";
import _ from 'lodash';
import moment from 'moment'

const _alphabet = [..."ABCDEFGHIJKLMNOPQRSTUVWXYZ"]

export const getDomain = (url) => url.replace(/^https?:\/\//i, "");

export const isUrl = (url) => /^(ftp|http|https):\/\/[^ "]+$/.test(url)

export const isSteamKey = (key) => /(\w{5}-){2}\w{5}/.test(key)

export const genericSort = (a, b) => a < b ? -1 : a > b ? 1 : 0

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
// export const corsLink = url => `https://api.allorigins.win/get?url=${url}`;

export const parseOptions = options => options.reduce((acc, option) => (_.concat(acc, [{
  key: acc.length,
  value: acc.length,
  text: option
}])), [])

export const getIndexByLabel = (label, headers) => _alphabet.indexOf(headers[label].id)
export const getValueByLabel = (label, headers, gameData) => gameData[getIndexByLabel(label, headers)]
export const getUrlsLocationAndValue = (headers, gameData) => Object.keys(headers)
  .filter(header => _.upperCase(header).indexOf("URL") > -1)
  .reduce((result, key) => (_.concat(
    ...result,
    [gameData
      ? {
        index: getIndexByLabel(key, headers),
        website: gameData[getIndexByLabel(key, headers)]
          ? _.lowerCase(gameData[getIndexByLabel(key, headers)]).indexOf("isthereanydeal") > -1
            ? "itad"
            : "steam"
          : "",
        url: gameData[getIndexByLabel(key, headers)],
      }
      : {
        index: getIndexByLabel(key, headers),
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
