import * as React from 'react';
import { GROUP_NAMES } from '../utils/Constants';

function percentile(rows: DataRow[], percent: number) {
    return (rows[Math.floor((rows.length - 1) * percent)] || {}).request_time;
}

function aggregateData(originalData: DataRow[], groupNames: string[]) {
    const agg = {};
    originalData.forEach((row) => {
        const key = groupNames.map((name) => {
            if (name.startsWith('request_uri')) {
                const num = parseInt(name.split('_')[2]);
                return row['request_uri'].split('/').slice(0, num + 1).join('/');
            }
            return row[name];
        }).join('###');
        if (!agg[key]) agg[key] = [];
        agg[key].push(row);
    });
    return Object.keys(agg).map((key) => {
        const ret: any = {};
        const rows: DataRow[] = agg[key];
        groupNames.forEach((name) => {
            if (name.startsWith('request_uri')) {
                const num = parseInt(name.split('_')[2]);
                ret['request_uri'] = rows[0]['request_uri'].split('/').slice(0, num + 1).join('/');
            }
            ret[name] = rows[0][name];
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
    };

    componentWillReceiveProps(nextProps: Props) {
        if (this.props.data === nextProps.data) return;
        this.processData(nextProps);
    }

    handleInputChange = (key: string, value: boolean) => {
        console.log('handleChange', key, value);
        const stateClone = Object.assign({}, this.state);
        stateClone.checked[key] = value;
        this.setState(stateClone);
        this.processData(this.props);
    }

    processData = (props: Props) => {
        const groupNames = Object.keys(this.state.checked).filter(k => this.state.checked[k]);
        props.onChangeGroup(aggregateData(props.data, groupNames));
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
                {GROUP_NAMES.map(key => (
                    <span key={key} style={{ margin: 10 }}>
                        <input
                            name={key}
                            type="checkbox"
                            checked={!!this.state.checked[key]}
                            onChange={e => this.handleInputChange(key, e.target.checked)}
                        />
                        <label htmlFor={key}>{key}</label>
                    </span>
                ))}
            </div>
        );
    }
}
