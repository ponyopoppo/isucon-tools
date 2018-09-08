import * as React from 'react';
import { parse } from '../utils/LogParser';
import GroupPicker from './GroupPicker';
import Table from './Table';
import { FilterInput } from './FilterInput';

export interface Props {
    data: DataRow[];
    onChangeFilter: (data: DataRow[]) => void;
}

class App extends React.Component {
    state = {
        originalData: [],
        filteredData: [],
        groupedData: [],
        totalTime: 0,
    };

    changeFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const data: DataRow[] = await parse(e);
        const totalTime = data.reduce((pre, cur) => pre + parseFloat(cur.request_time), 0);
        this.setState({ totalTime, originalData: data });
    }

    changeFilter = (data: DataRow[]) => {
        this.setState({ filteredData: data });
    }

    changeGroup = (data: DataRow[]) => {
        this.setState({ groupedData: data });
    }

    render() {
        return (
            <div className="App" style={{ padding: 10 }}>
                <div>
                    <h3>File</h3>
                    <input type="file" onChange={e => this.changeFile(e)} />
                    <p>Total time: {this.state.totalTime}</p>
                </div>
                <div>
                    <h3>Filter</h3>
                    <FilterInput data={this.state.originalData} onChangeFilter={this.changeFilter} />
                </div>
                <div>
                    <h3>Group</h3>
                    <GroupPicker data={this.state.filteredData} onChangeGroup={this.changeGroup} />
                </div>
                <div>
                    <h3>Table</h3>
                    <Table data={this.state.groupedData} />
                </div>
            </div>
        );
    }
}

export default App;
