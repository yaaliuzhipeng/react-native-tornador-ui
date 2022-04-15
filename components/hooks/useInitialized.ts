import { useEffect, useRef } from 'react';

const useInitialized = () => {
    const initialized = useRef(false);
    useEffect(() => {
        initialized.current = true;
    }, [])
    return initialized.current;
}
export default useInitialized;