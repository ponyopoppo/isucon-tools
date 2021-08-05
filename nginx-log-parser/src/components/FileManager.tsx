import * as moment from 'moment';
import { parse, readText } from '../utils/LogParser';
import './App.css';
import * as React from 'react';
import { useEffect, useState } from 'react';
import { useQueryState } from 'use-location-state';

export default function FileManager({
    onChangeData,
}: {
    onChangeData: (data: DataRow[]) => void;
}) {
    const [targetUrl, setTargetUrl] = useQueryState<string>('targetUrl', '');
    const [totalTime, setTotalTime] = useState(0);

    const [files, setFiles] = useState<string[]>([]);
    const [sizes, setSizes] = useState<any>({});
    const [currentFile, setCurrentFile] = useState<string>('');
    const [copyTo, setCopyTo] = useState<string>('');
    const [path, setPath] = useQueryState<string>('path', '');
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
        onChangeData(data);
    };

    const changeFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
        await renewData(await readText(e));
    };
    const handleClickRemoteFile = (file: string) => async () => {
        const { content } = await fetch(
            `${getTargetUrl()}/${file}?path=${path}`
        ).then((res) => res.json());
        setCurrentFile(file);
        setCopyTo(`${file}_${moment().format('YYYY_MM_DD_HH_mm_ss')}`);
        await renewData(content);
    };

    const fetchFileList = async () => {
        setFiles([]);
        setSizes({});
        const { files, sizes } = await fetch(
            `${getTargetUrl()}?path=${path}`
        ).then((res) => res.json());
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
        await fetch(
            `${getTargetUrl()}/copy/${currentFile}/${newFile}?path=${path}`,
            {
                method: 'POST',
            }
        );
        await fetch(`${getTargetUrl()}/${currentFile}?path=${path}`, {
            method: 'DELETE',
        });
        await handleClickFetch(e);
        await handleClickRemoteFile(newFile)();
    };

    const isOriginalSelected = () => {
        return !currentFile.match(/log_/);
    };
    const handleClickRemove = async (e: any) => {
        if (isOriginalSelected()) {
            if (!confirm(`Reset ${currentFile}?`)) return;
            await fetch(`${getTargetUrl()}/${currentFile}?path=${path}`, {
                method: 'DELETE',
            });
            await handleClickRemoteFile(currentFile)();
        } else {
            if (!confirm('Delete file?')) return;
            await fetch(
                `${getTargetUrl()}/removeFile/${currentFile}?path=${path}`,
                {
                    method: 'DELETE',
                }
            );
            await handleClickFetch(e);
        }
    };
    return (
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
                <input
                    className="fetch-field"
                    placeholder="/var/log/nginx"
                    value={path}
                    onChange={({ target }) => setPath(target.value)}
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
                            onChange={({ target }) => setCopyTo(target.value)}
                        />
                        <button onClick={handleClickMove}>Move</button>
                    </form>
                </div>
            )}
            <p>Total time: {totalTime}</p>
        </div>
    );
}
