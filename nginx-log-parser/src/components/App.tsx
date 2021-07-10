import * as moment from 'moment';
import { parse, readText } from '../utils/LogParser';
import GroupPicker from './GroupPicker';
import Table from './Table';
import { FilterInput } from './FilterInput';
import './App.css';
import * as React from 'react';
import { useEffect, useState } from 'react';
import { useQueryState } from 'use-location-state';

export interface Props {
    data: DataRow[];
    onChangeFilter: (data: DataRow[]) => void;
}

function App() {
    const [targetUrl, setTargetUrl] = useQueryState<string>('targetUrl', '');
    const [totalTime, setTotalTime] = useState(0);
    const [originalData, setOriginalData] = useState<DataRow[]>([]);
    const [filteredData, setFilteredData] = useState<DataRow[]>([]);
    const [groupedData, setGroupedData] = useState<DataRow[]>([]);
    const [files, setFiles] = useState<string[]>([]);
    const [sizes, setSizes] = useState<any>({});
    const [currentFile, setCurrentFile] = useState<string>('');
    const [copyTo, setCopyTo] = useState<string>('');

    useEffect(() => {
        if (targetUrl) {
            fetchFileList();
        }
    }, []);

    const getTargetUrl = () => {
        let url = targetUrl;
        if (!url.startsWith('http://') && !url.startsWith('https://')) {
            url = 'http://' + url;
        }
        if (!targetUrl.match(/\:[0-9]+/)) {
            url += ':13030';
        }
        return url;
    };

    const renewData = async (text: string) => {
        const data: DataRow[] = await parse(text);
        const totalTime = data.reduce(
            (pre, cur) => pre + parseFloat(cur.request_time),
            0
        );
        setTotalTime(totalTime);
        setOriginalData(data);
    };

    const changeFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
        await renewData(await readText(e));
    };

    const changeFilter = (data: DataRow[]) => {
        setFilteredData(data);
    };

    const changeGroup = (data: DataRow[]) => {
        setGroupedData(data);
    };

    const handleClickRemoteFile = (file: string) => async () => {
        const { content } = await fetch(getTargetUrl() + '/' + file).then(
            (res) => res.json()
        );
        setCurrentFile(file);
        setCopyTo(`${file}_${moment().format('HH_mm_ss')}`);
        await renewData(content);
    };

    const fetchFileList = async () => {
        setFiles([]);
        setSizes({});
        const { files, sizes } = await fetch(getTargetUrl()).then((res) =>
            res.json()
        );
        setFiles(files);
        setSizes(sizes);
    };

    const handleClickFetch = async (e: any) => {
        e.preventDefault();
        setTargetUrl(getTargetUrl());
        await fetchFileList();
    };

    const handleClickMove = async (e: any) => {
        e.preventDefault();
        const score = prompt('スコアは？');
        if (!score) return;
        const newFile = copyTo + '__' + score;
        await fetch(`${getTargetUrl()}/copy/${currentFile}/${newFile}`, {
            method: 'POST',
        });
        await fetch(`${getTargetUrl()}/${currentFile}`, { method: 'DELETE' });
        await handleClickFetch(e);
        await handleClickRemoteFile(newFile)();
    };

    const isOriginalSelected = () => {
        return !currentFile.match(/log_/);
    };

    const handleClickRemove = async (e: any) => {
        if (isOriginalSelected()) {
            if (!confirm(`Reset ${currentFile}?`)) return;
            await fetch(`${getTargetUrl()}/${currentFile}`, {
                method: 'DELETE',
            });
            await handleClickRemoteFile(currentFile)();
        } else {
            if (!confirm('Delete file?')) return;
            await fetch(`${getTargetUrl()}/removeFile/${currentFile}`, {
                method: 'DELETE',
            });
            await handleClickFetch(e);
        }
    };

    return (
        <div className="App" style={{ padding: 10 }}>
            <div>
                <h3>File</h3>
                <div>
                    <input type="file" onChange={(e) => changeFile(e)} />
                </div>
                <form className="fetch-form" onSubmit={handleClickFetch}>
                    <input
                        className="fetch-field"
                        placeholder="remote url(:13030)"
                        value={targetUrl}
                        onChange={({ target }) => setTargetUrl(target.value)}
                    />
                    <button className="fetch-button">Get file list</button>
                </form>
                <div>
                    {files.map((file) => (
                        <button
                            onClick={handleClickRemoteFile(file)}
                            className={
                                file === currentFile
                                    ? 'selected-file-button'
                                    : 'file-button'
                            }
                            key={file}
                        >
                            {file} ({sizes[file]})
                        </button>
                    ))}
                </div>
                {currentFile && (
                    <div>
                        <button
                            className={
                                isOriginalSelected()
                                    ? 'remove-original'
                                    : 'remove-copied'
                            }
                            onClick={handleClickRemove}
                        >
                            {isOriginalSelected() ? 'Reset' : 'Remove'}
                        </button>
                    </div>
                )}
                {currentFile && isOriginalSelected() && (
                    <div>
                        <form>
                            <input
                                style={{ width: '50%' }}
                                placeholder="file name"
                                value={copyTo}
                                onChange={({ target }) =>
                                    setCopyTo(target.value)
                                }
                            />
                            <button onClick={handleClickMove}>Move</button>
                        </form>
                    </div>
                )}
                <p>Total time: {totalTime}</p>
            </div>
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
