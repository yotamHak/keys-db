import React from 'react'

const getCache = (key, initial) => {
    const cached = localStorage.getItem(key)

    if (cached === null && initial !== null) {
        localStorage.setItem(key, initial)
    }

    return cached !== null ? cached : initial
}

// Usage: const [state, setState] = useLocalStorage("LOCAL_STORAGE_KEY", initialValue)
const useLocalStorage = (key, initial) => {
    const [nativeState, setNativeState] = React.useState(getCache(key, initial))
    const setState = state => {
        if (typeof state === 'function') {
            setNativeState(prev => {
                const newState = state(prev)
                localStorage.setItem(key, newState)
                return newState
            })
        } else {
            localStorage.setItem(key, state)
            setNativeState(state)
        }
    }

    return [nativeState, setState]
}
export default useLocalStorage