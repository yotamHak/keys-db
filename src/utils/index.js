import { useEffect, useRef } from "react";

export const LINKS_PER_PAGE = 5;

export function getDomain(url) {
  return url.replace(/^https?:\/\//i, "");
}

export const isUrl = (url) => /^(ftp|http|https):\/\/[^ "]+$/.test(url)

export const isSteamKey = (key) => /(\w{5}-){2}\w{5}/.test(key)

export function usePrevious(value) {
  const ref = useRef();
  useEffect(() => {
    ref.current = value;
  });
  return ref.current;
}

export const genericSort = (a, b) => a < b ? -1 : a > b ? 1 : 0

/* EMAIL REGEX: !/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i.test(values.email) */
/* URL REGEX: !/^(ftp|http|https):\/\/[^ "]+$/.test(values.url) */
