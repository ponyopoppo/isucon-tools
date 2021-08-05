import GroupPicker from './GroupPicker';
import Table from './Table';
import { FilterInput } from './FilterInput';
import './App.css';
import * as React from 'react';
import { useState } from 'react';
import FileManager from './FileManager';

export interface Props {
    data: DataRow[];
    onChangeFilter: (data: DataRow[]) => void;
}

function App() {
    const [originalData, setOriginalData] = useState<DataRow[]>([]);
    const [filteredData, setFilteredData] = useState<DataRow[]>([]);
    const [groupedData, setGroupedData] = useState<DataRow[]>([]);

    const changeFilter = (data: DataRow[]) => {
        setFilteredData(data);
    };

    const changeGroup = (data: DataRow[]) => {
        setGroupedData(data);
    };

    return (
        <div className="App" style={{ padding: 10 }}>
            <FileManager onChangeData={setOriginalData} />
            <div>
                <h3>Filter</h3>
                <FilterInput
                    data={originalData}
                    onChangeFilter={changeFilter}
                />
            </div>
            <div>
                <h3>Group</h3>
                <GroupPicker data={filteredData} onChangeGroup={changeGroup} />
            </div>
            <div>
                <h3>Table</h3>
                <Table data={groupedData} />
            </div>
        </div>
    );
}

export default App;
