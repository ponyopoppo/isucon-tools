import * as React from 'react';
import { useEffect, useState } from 'react';
import { GROUP_NAMES, GROUP_PATTERN_NAMES } from '../utils/Constants';

function percentile(rows: DataRow[], percent: number) {
    return (rows[Math.floor((rows.length - 1) * percent)] || {}).request_time;
}

function getDisplayName(
    row: DataRow,
    groupName: string,
    patterns: { [key: string]: string }
) {
    const colName = groupName.startsWith('request_uri')
        ? 'request_uri'
        : groupName;
    const pattern = patterns[colName];
    if (pattern) {
        const patlines = pattern.split('\n').filter((line) => line.trim());
        for (let patline of patlines) {
            try {
                const pat = patline
                    .split('/')
                    .map((v) => (v.startsWith(':') ? '[^/]*' : v))
                    .join('/');
                const re = new RegExp(`^${pat}$`);
                if ((row[colName] || '').match(re)) {
                    return '[P] ' + patline;
                }
            } catch (e) {}
        }
        return row[colName];
    }
    if (colName === 'request_uri') {
        const num = parseInt(groupName.split('_')[2]);
        return row['request_uri']
            .split('/')
            .slice(0, num + 1)
            .join('/');
    }
    return row[groupName];
}

function aggregateData(
    originalData: DataRow[],
    groupNames: string[],
    patterns: { [key: string]: string }
) {
    const agg = {};
    originalData.forEach((row) => {
        const key = groupNames
            .map((name) => getDisplayName(row, name, patterns))
            .join('###');
        if (!agg[key]) agg[key] = [];
        agg[key].push(row);
    });

    return Object.keys(agg).map((key) => {
        const ret: any = {};
        const rows: DataRow[] = agg[key];
        groupNames.forEach((name) => {
            const colName = name.startsWith('request_uri')
                ? 'request_uri'
                : name;
            ret[colName] = getDisplayName(rows[0], name, patterns);
        });

        rows.sort(
            (a, b) => parseFloat(a.request_time) - parseFloat(b.request_time)
        );
        const count = rows.length;
        const sum = parseFloat(
            rows
                .reduce((pre, cur) => pre + parseFloat(cur.request_time), 0)
                .toFixed(3)
        );
        const avg = parseFloat((sum / count).toFixed(3));
        const med = percentile(rows, 0.5);
        const p75 = percentile(rows, 0.75);
        const p90 = percentile(rows, 0.9);
        const p99 = percentile(rows, 0.99);
        const min = percentile(rows, 0);
        const max = percentile(rows, 1);
        Object.assign(ret, {
            count,
            sum,
            avg,
            med,
            p75,
            p90,
            p99,
            min,
            max,
        });
        return ret as DataRow;
    });
}

interface Props {
    onChangeGroup: (data: DataRow[]) => void;
    data: DataRow[];
}

export default function GroupPicker({ onChangeGroup, data }: Props) {
    const [checked, setChecked] = useState<{ [key: string]: boolean }>({});
    const [patternChecked, setPatternChecked] = useState<{
        [key: string]: boolean;
    }>({});
    const [patterns, setPatterns] = useState<{ [key: string]: string }>({});
    const [shouldProcessData, setShouldProcessData] = useState(true);

    useEffect(() => {
        if (!shouldProcessData) return;
        processData();
    }, [shouldProcessData]);

    useEffect(() => {
        processData();
    }, [data]);

    const handleInputChange = (key: string, value: boolean) => {
        const tmpChecked = { ...checked };
        if (key.startsWith('request_uri')) {
            const keys = Object.keys(tmpChecked).filter((k) =>
                k.startsWith('request_uri')
            );
            for (const requestUriKey of keys) {
                tmpChecked[requestUriKey] = false;
            }
        }

        tmpChecked[key] = value;
        setChecked(tmpChecked);
        setShouldProcessData(true);
    };

    const handleSelectAll = (value: boolean) => {
        const tmpChecked = { ...checked };
        for (const key of GROUP_NAMES) {
            if (key.startsWith('request_uri')) {
                const keys = Object.keys(tmpChecked).filter((k) =>
                    k.startsWith('request_uri')
                );
                for (const requestUriKey of keys) {
                    tmpChecked[requestUriKey] = false;
                }
            }

            tmpChecked[key] = value;
        }
        setChecked(tmpChecked);
        setShouldProcessData(true);
    };

    const handlePatternCheckBoxChange = (key: string, value: boolean) => {
        setPatternChecked({
            ...patternChecked,
            [key]: value,
        });
        setShouldProcessData(true);
    };

    const handlePatternChange = (key: string, value: string) => {
        setPatterns({
            ...patterns,
            [key]: value,
        });
        setShouldProcessData(true);
    };

    const processData = () => {
        const groupNames = ([] as string[]).concat(
            Object.keys(checked).filter((k) => checked[k]),
            Object.keys(patternChecked).filter((k) => patternChecked[k])
        );
        const patterns = {};
        Object.keys(patterns)
            .filter((pattern) => patternChecked[pattern])
            .forEach((pattern) => (patterns[pattern] = patterns[pattern]));
        onChangeGroup(aggregateData(data, groupNames, patterns));
        setShouldProcessData(false);
    };

    const hasChecked = Object.keys(checked).some((key) => checked[key]);
    return (
        <div>
            <div>
                {hasChecked ? (
                    <button onClick={() => handleSelectAll(false)}>
                        unselect all
                    </button>
                ) : (
                    <button onClick={() => handleSelectAll(true)}>
                        select all
                    </button>
                )}
            </div>
            <div>
                {GROUP_NAMES.map((key) => (
                    <span key={key} style={{ margin: 10 }}>
                        <input
                            id={key}
                            name={key}
                            type="checkbox"
                            checked={!!checked[key]}
                            onChange={(e) =>
                                handleInputChange(key, e.target.checked)
                            }
                        />
                        <label htmlFor={key}>{key}</label>
                    </span>
                ))}
            </div>
            <h4>Patterns</h4>
            <div>
                {GROUP_PATTERN_NAMES.map((key) => (
                    <div
                        key={key}
                        style={{
                            margin: 10,
                            display: 'inline-block',
                            width: '30%',
                        }}
                    >
                        <input
                            id={`pattern-${key}`}
                            name={key}
                            type="checkbox"
                            checked={!!patternChecked[key]}
                            onChange={(e) =>
                                handlePatternCheckBoxChange(
                                    key,
                                    e.target.checked
                                )
                            }
                        />
                        <label htmlFor={`pattern-${key}`}>{key}</label>
                        <div>
                            <textarea
                                style={{ width: '100%', height: 40 }}
                                name={key}
                                value={patterns[key]}
                                onChange={(e) =>
                                    handlePatternChange(key, e.target.value)
                                }
                            />
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
