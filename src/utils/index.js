import { useEffect, useRef, useState } from "react";
import dateFns from 'date-fns';

export const LINKS_PER_PAGE = 5;

export const getDomain = (url) => url.replace(/^https?:\/\//i, "");

export const isUrl = (url) => /^(ftp|http|https):\/\/[^ "]+$/.test(url)

export const isSteamKey = (key) => /(\w{5}-){2}\w{5}/.test(key)

export const genericSort = (a, b) => a < b ? -1 : a > b ? 1 : 0

export const getFormattedDate = date => dateFns.format(dateFns.parse(date, 'yyyy,mm,dd'), 'DD/MM/YYYY');

export const corsLink = url => `https://cors-anywhere.herokuapp.com/${url}`;

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

/* EMAIL REGEX: !/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i.test(values.email) */
/* URL REGEX: !/^(ftp|http|https):\/\/[^ "]+$/.test(values.url) */
