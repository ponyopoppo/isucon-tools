import * as React from 'react';
import { GROUP_NAMES, GROUP_PATTERN_NAMES } from '../utils/Constants';

function percentile(rows: DataRow[], percent: number) {
    return (rows[Math.floor((rows.length - 1) * percent)] || {}).request_time;
}

function getDisplayName(row: DataRow, groupName: string, patterns: { [key: string]: string }) {
    const colName = groupName.startsWith('request_uri') ? 'request_uri' : groupName;
    const pattern = patterns[colName];
    if (pattern) {
        const patlines = pattern.split('\n')
            .filter(line => line.trim());
        for (let patline of patlines) {
            try {
                const pat = patline
                    .split('/')
                    .map(v => v.startsWith(':') ? '[^/]*' : v)
                    .join('/');
                const re = new RegExp(`^${pat}$`);
                if ((row[colName] || '').match(re)) {
                    return '[P] ' + patline;
                }
            } catch (e) { }
        }
        return row[colName];
    }
    if (colName === 'request_uri') {
        const num = parseInt(groupName.split('_')[2]);
        return row['request_uri'].split('/').slice(0, num + 1).join('/');
    }
    return row[groupName];
}

function aggregateData(originalData: DataRow[], groupNames: string[], patterns: { [key: string]: string }) {
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
            const colName = name.startsWith('request_uri') ? 'request_uri' : name;
            ret[colName] = getDisplayName(rows[0], name, patterns);
        });

        rows.sort((a, b) => parseFloat(a.request_time) - parseFloat(b.request_time));
        const count = rows.length;
        const sum = parseFloat(rows.reduce((pre, cur) => pre + parseFloat(cur.request_time), 0).toFixed(3));
        const avg = parseFloat((sum / count).toFixed(3));
        const med = percentile(rows, 0.5);
        const p75 = percentile(rows, 0.75);
        const p90 = percentile(rows, 0.90);
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

export default class GroupPicker extends React.Component<Props> {
    state = {
        checked: {},
        patternChecked: {},
        patterns: {},
    };

    componentWillReceiveProps(nextProps: Props) {
        if (this.props.data === nextProps.data) return;
        this.processData(nextProps);
    }

    handleInputChange = (key: string, value: boolean) => {
        const stateClone = Object.assign({}, this.state);
        if (key.startsWith('request_uri')) {
            const keys = Object.keys(stateClone.checked).filter(k => k.startsWith('request_uri'));
            for (const requestUriKey of keys) {
                stateClone.checked[requestUriKey] = false;
            }
        }

        stateClone.checked[key] = value;
        this.setState(stateClone);
        this.processData(this.props);
    }

    handlePatternCheckBoxChange = (key: string, value: boolean) => {
        this.setState({
            patternChecked: {
                ...this.state.patternChecked,
                [key]: value,
            }
        }, () => {
            this.processData(this.props);
        });
    }

    handlePatternChange = (key: string, value: string) => {
        this.setState({
            patterns: {
                ...this.state.patterns,
                [key]: value,
            }
        }, () => {
            if (this.state.patternChecked[key]) {
                this.processData(this.props);
            }
        });
    }

    processData = (props: Props) => {
        const groupNames = ([] as string[]).concat(
            Object.keys(this.state.checked)
                .filter(k => this.state.checked[k]),
            Object.keys(this.state.patternChecked)
                .filter(k => this.state.patternChecked[k])
        );
        const patterns = {};
        Object.keys(this.state.patterns)
            .filter(pattern => this.state.patternChecked[pattern])
            .forEach(pattern => patterns[pattern] = this.state.patterns[pattern])
        props.onChangeGroup(aggregateData(props.data, groupNames, patterns));
    }

    render() {
        const hasChecked = Object.keys(this.state.checked).some(key => this.state.checked[key]);
        return (
            <div>
                <div>
                    {hasChecked ?
                        <button onClick={() => GROUP_NAMES.forEach(key => this.handleInputChange(key, false))}>unselect all</button>
                        :
                        <button onClick={() => GROUP_NAMES.forEach(key => this.handleInputChange(key, true))}>select all</button>
                    }
                </div>
                <div>
                    {GROUP_NAMES.map(key => (
                        <span key={key} style={{ margin: 10 }}>
                            <input
                                id={key}
                                name={key}
                                type="checkbox"
                                checked={!!this.state.checked[key]}
                                onChange={e => this.handleInputChange(key, e.target.checked)}
                            />
                            <label htmlFor={key}>{key}</label>
                        </span>
                    ))}
                </div>
                <h4>Patterns</h4>
                <div>
                    {GROUP_PATTERN_NAMES.map(key => (
                        <div key={key} style={{ margin: 10, display: 'inline-block', width: '30%' }}>
                            <input
                                id={`pattern-${key}`}
                                name={key}
                                type="checkbox"
                                checked={!!this.state.patternChecked[key]}
                                onChange={e => this.handlePatternCheckBoxChange(key, e.target.checked)}
                            />
                            <label htmlFor={`pattern-${key}`}>{key}</label>
                            <div>
                                <textarea
                                    style={{ width: '100%', height: 40 }}
                                    name={key}
                                    value={this.state.patterns[key]}
                                    onChange={e => this.handlePatternChange(key, e.target.value)}
                                />
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        );
    }
}
