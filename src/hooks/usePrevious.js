import { useRef, useEffect } from "react";

// Custom hook for saving previous value
function usePrevious(value) {
    const ref = useRef();

    useEffect(() => {
        ref.current = value;
    });
    return ref.current;
}

export default usePrevious;