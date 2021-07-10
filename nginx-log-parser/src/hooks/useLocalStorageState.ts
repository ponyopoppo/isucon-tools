import { useEffect, useMemo, useState } from 'react';

export function useLocalStorageState<T>(
    key: string,
    initialValue: T
): [T, React.Dispatch<React.SetStateAction<T>>] {
    const localInitialValue = useMemo(() => {
        const localStr = localStorage.getItem(key);
        return localStr ? JSON.parse(localStr) : initialValue;
    }, []);
    const [value, setValue] = useState<T>(localInitialValue);
    useEffect(() => {
        localStorage.setItem(key, JSON.stringify(value));
    }, [value]);
    return [value, setValue];
}
