import { useState, useEffect } from "react";

// Custom hook that will alert once reaching the bottom of the page
function useBottomPage(offset = 100) {
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

export default useBottomPage;