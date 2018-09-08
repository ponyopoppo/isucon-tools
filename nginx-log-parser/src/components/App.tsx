import * as React from 'react';
import { parse } from '../utils/LogParser';
import GroupPicker from './GroupPicker';
import Table from './Table';

class App extends React.Component {
    state = {
        data: [],
        originalData: [],
        totalTime: 0,
    };

    changeFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const data: DataRow[] = await parse(e);
        const totalTime = data.reduce((pre, cur) => pre + parseFloat(cur.request_time), 0);
        this.setState({ data, totalTime, originalData: data });
    }

    changeGroup = (data: DataRow[]) => {
        this.setState({ data });
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
                    <h3>Group</h3>
                    <GroupPicker data={this.state.originalData} onChangeGroup={this.changeGroup} />
                </div>
                <div>
                    <h3>Table</h3>
                    <Table data={this.state.data} />
                </div>
            </div>
        );
    }
}

export default App;
