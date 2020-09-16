// import { useLocation } from "react-router-dom";

import { useState } from "react";
import { useEffect } from "react";

// Custom hook for manipulating url params
function useUrlParams(location) {
    const [urlParamsObject, setUrlParamsObject] = useState(null)

    useEffect(() => {
        if (!urlParamsObject) {
            setUrlParamsObject(toParamObject())
        }
    }, [])

    function toParamObject(queryString = location.search) {
        if (urlParamsObject) {
            return urlParamsObject
        }

        const params = new URLSearchParams(queryString);
        let paramObject = {};

        params.forEach((value, key) => {
            if (paramObject[key]) {
                paramObject = {
                    ...paramObject,
                    [key]: [
                        ...paramObject[key],
                        value,
                    ],
                };
            } else {
                paramObject = {
                    ...paramObject,
                    [key]: [value],
                };
            }
        });

        return paramObject
    }

    // const toParamObject = (queryString = location.search) => {
    //     if (urlParamsObject) {
    //         return urlParamsObject
    //     }
    //     console.log("toParamObject")

    //     const params = new URLSearchParams(queryString);
    //     let paramObject = {};

    //     params.forEach((value, key) => {
    //         if (paramObject[key]) {
    //             paramObject = {
    //                 ...paramObject,
    //                 [key]: [
    //                     ...paramObject[key],
    //                     value,
    //                 ],
    //             };
    //         } else {
    //             paramObject = {
    //                 ...paramObject,
    //                 [key]: [value],
    //             };
    //         }
    //     });

    //     setUrlParamsObject(paramObject)

    //     return paramObject;
    // };

    const toQueryString = (paramObject) => {
        let queryString = '';

        Object.entries(paramObject).forEach(([paramKey, paramValue]) => {
            if (paramValue.length === 0) {
                return;
            }
            queryString += '?';
            paramValue.forEach((value, index) => {
                if (index > 0) {
                    queryString += '&';
                }
                queryString += `${paramKey}=${value}`;
            });
        });

        // This is kind of hacky, but if we push '' as the route, we lose 
        // our page, and base path etc.
        // So instead.. pushing a '?' just removes all the current query strings
        return queryString !== '' ? queryString : '?';
    };

    // const cleanUrl = () => {
    //     const remove = (key, value) => {
    //         // First get the current params get()
    //         const thisParam = get(param).filter((val) => val !== value);
    //         const newParamObject = {
    //             ...toParamObject(search), // from useLocation
    //             [param]: thisParam,
    //         };
    //         push(`${toQueryString(newParamObject)}`); // from useHistory
    //     };
    // }

    return {
        urlParamsObject,
        toParamObject,
        toQueryString
    }
}

export default useUrlParams;