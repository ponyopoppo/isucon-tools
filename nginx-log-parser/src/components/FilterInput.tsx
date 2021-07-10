import { FILTER_NAMES } from '../utils/Constants';
import { Props } from './App';
import * as React from 'react';
import { useEffect, useState } from 'react';

export function FilterInput({ onChangeFilter, data }: Props) {
    const [filters, setFilters] = useState<{ [key: string]: string }>({});
    const [regexs, setRegexs] = useState<{ [key: string]: RegExp | null }>({});
    const [shouleProcessData, setShouldProcessData] = useState(false);

    useEffect(() => {
        processData();
    }, [data]);

    useEffect(() => {
        if (!shouleProcessData) return;
        processData();
    }, [shouleProcessData]);

    const handleInputChange = (key: string, value: string) => {
        let newRegExp: RegExp | null = null;
        try {
            newRegExp = new RegExp(value);
        } catch (_) {
            newRegExp = null;
        }
        setFilters({
            ...filters,
            [key]: value,
        });
        setRegexs({
            ...regexs,
            [key]: newRegExp,
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
                <div style={{ display: 'inline-block', margin: 10 }}>
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
