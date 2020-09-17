import { FILTER_NAMES } from '../utils/Constants';
import { Props } from './App';
import * as React from 'react';

export class FilterInput extends React.Component<Props> {
    state = {
        filters: {},
        regexs: {},
    };

    componentWillReceiveProps(nextProps: Props) {
        if (this.props.data === nextProps.data) {
            return;
        }
        this.processData(nextProps);
    }

    private handleInputChange = (key: string, value: string) => {
        const stateClone = Object.assign({}, this.state);
        stateClone.filters[key] = value;
        try {
            stateClone.regexs[key] = new RegExp(value);
        } catch (_) {
            stateClone.regexs[key] = null;
        }
        this.setState(stateClone);
        this.processData(this.props);
    }

    private processData = (props: Props) => {
        const filteredData = props.data
            .filter(row => FILTER_NAMES
                .every(name => !this.state.regexs[name] || row[name].match(this.state.regexs[name])));
        props.onChangeFilter(filteredData);
    }

    private getTextInputBackgroundColor(key: string) {
        if (this.state.filters[key] && !this.state.regexs[key]) return '#f88';
        if (this.state.filters[key]) return '#3273F6';
        return '#fff';
    }

    private getTextInputColor(key: string) {
        if (this.state.filters[key]) return '#fff';
        return '#000';
    }

    render() {
        return (
            <div>
                {FILTER_NAMES.map(key => (
                    <div style={{ display: 'inline-block', margin: 10 }}>
                        <div>{key}</div>
                        <input
                            key={key}
                            style={{ backgroundColor: this.getTextInputBackgroundColor(key), color: this.getTextInputColor(key) }}
                            name={key}
                            type="text"
                            value={this.state.filters[key] || ''}
                            onChange={e => this.handleInputChange(key, e.target.value)}
                        />
                    </div>)
                )}
            </div>
        );
    }
}
