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

    handleInputChange = (key: string, value: string) => {
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

    processData = (props: Props) => {
        const filteredData = props.data
            .filter(row => FILTER_NAMES
                .every(name => !this.state.regexs[name] || row[name].match(this.state.regexs[name])));
        props.onChangeFilter(filteredData);
    }

    render() {
        return (
            <div>
                {FILTER_NAMES.map(key => (<input key={key} style={{
                    backgroundColor: this.state.filters[key] && !this.state.regexs[key] ? '#f88' : '#fff',
                    margin: 10,
                }} name={key} placeholder={key} type="text" value={this.state.filters[key] || ''} onChange={e => this.handleInputChange(key, e.target.value)} />))}
            </div>
        );
    }
}
