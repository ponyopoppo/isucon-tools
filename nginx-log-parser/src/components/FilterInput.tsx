import { FILTER_NAMES } from '../utils/Constants';
import { Props } from './App';
import * as React from 'react';
import { useEffect, useState } from 'react';
import { useLocalStorageState } from '../hooks/useLocalStorageState';

export function FilterInput({ onChangeFilter, data }: Props) {
    const [filters, setFilters] = useLocalStorageState<{
        [key: string]: string;
    }>('filters', {});
    const [regexs, setRegexs] = useState<{ [key: string]: RegExp | null }>({});
    const [shouleProcessData, setShouldProcessData] = useState(false);

    useEffect(() => {
        processData();
    }, [data]);

    useEffect(() => {
        if (!shouleProcessData) return;
        processData();
    }, [shouleProcessData]);

    useEffect(() => {
        const regexs: { [key: string]: RegExp | null } = {};
        for (const key of Object.keys(filters)) {
            try {
                regexs[key] = new RegExp(filters[key]);
            } catch (_) {
                regexs[key] = null;
            }
        }
        setRegexs(regexs);
    }, [filters]);

    const handleInputChange = (key: string, value: string) => {
        setFilters({
            ...filters,
            [key]: value,
        });
        setShouldProcessData(true);
    };

    const processData = () => {
        const filteredData = data.filter((row) =>
            FILTER_NAMES.every(
                (name) => !regexs[name] || row[name].match(regexs[name])
            )
        );
        onChangeFilter(filteredData);
        setShouldProcessData(false);
    };

    const getTextInputBackgroundColor = (key: string) => {
        if (filters[key] && !regexs[key]) return '#f88';
        if (filters[key]) return '#3273F6';
        return '#fff';
    };

    const getTextInputColor = (key: string) => {
        if (filters[key]) return '#fff';
        return '#000';
    };

    return (
        <div>
            {FILTER_NAMES.map((key) => (
                <div key={key} style={{ display: 'inline-block', margin: 10 }}>
                    <div>{key}</div>
                    <input
                        key={key}
                        style={{
                            backgroundColor: getTextInputBackgroundColor(key),
                            color: getTextInputColor(key),
                        }}
                        name={key}
                        type="text"
                        value={filters[key] || ''}
                        onChange={(e) => handleInputChange(key, e.target.value)}
                    />
                </div>
            ))}
        </div>
    );
}
