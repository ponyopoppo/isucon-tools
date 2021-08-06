import GroupPicker from './GroupPicker';
import Table from './Table';
import { FilterInput } from './FilterInput';
import './App.css';
import * as React from 'react';
import { useState } from 'react';
import FileManager from './FileManager';
import UserFlow from './UserFlow';

export interface Props {
    data: DataRow[];
    onChangeFilter: (data: DataRow[]) => void;
}

function App() {
    const [originalData, setOriginalData] = useState<DataRow[]>([]);
    const [filteredData, setFilteredData] = useState<DataRow[]>([]);
    const [groupedData, setGroupedData] =
        useState<{
            data: DataRow[];
            groupNames: string[];
            patterns: {
                [key: string]: string;
            };
        } | null>(null);
    const [userFlowShown, setUserFlowShown] = useState(false);

    return (
        <div className="App" style={{ padding: 10 }}>
            <FileManager onChangeData={setOriginalData} />
            <div>
                <h3>Filter</h3>
                <FilterInput
                    data={originalData}
                    onChangeFilter={setFilteredData}
                />
            </div>
            <div>
                <h3>Group</h3>
                <GroupPicker
                    data={filteredData}
                    onChangeGroup={setGroupedData}
                />
            </div>
            <div>
                <h3>User flow</h3>
                <input
                    id="userflowshown"
                    type="checkbox"
                    onChange={(e) => setUserFlowShown(e.target.checked)}
                    checked={userFlowShown}
                />
                <label htmlFor="userflowshown">show</label>
                {groupedData && userFlowShown && (
                    <UserFlow
                        originalData={originalData}
                        groupedData={groupedData}
                    />
                )}
            </div>
            <div>
                <h3>Table</h3>
                <Table data={groupedData?.data || []} />
            </div>
        </div>
    );
}

export default App;
