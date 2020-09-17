import * as React from 'react';
import * as queryString from 'query-string';
import * as moment from 'moment';
import { parse, readText } from '../utils/LogParser';
import GroupPicker from './GroupPicker';
import Table from './Table';
import { FilterInput } from './FilterInput';
import './App.css';

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
        targetUrl: '',
        files: [],
        sizes: {},
        currentFile: '',
        copyTo: '',
    };

    componentDidMount() {
        const query = queryString.parse(window.location.search);
        if (query && typeof query.url === 'string') {
            const targetUrl = decodeURIComponent(query.url);
            this.setState({ targetUrl }, () => this.fetchFileList());
        }
    }

    private getTragetUrl() {
        let { targetUrl } = this.state;
        if (!targetUrl.startsWith('http://') && !targetUrl.startsWith('https://')) {
            targetUrl = 'http://' + targetUrl;
        }
        if (!targetUrl.match(/\:[0-9]+/)) {
            targetUrl += ':13030';
        }
        return targetUrl;
    }

    private async renewData(text: string) {
        const data: DataRow[] = await parse(text);
        const totalTime = data.reduce((pre, cur) => pre + parseFloat(cur.request_time), 0);
        this.setState({ totalTime, originalData: data });
    }

    private changeFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
        await this.renewData(await readText(e));
    }

    private changeFilter = (data: DataRow[]) => {
        this.setState({ filteredData: data });
    }

    private changeGroup = (data: DataRow[]) => {
        this.setState({ groupedData: data });
    }

    private setUrlQuery() {
        const newurl = window.location.protocol + "//" +
            window.location.host +
            window.location.pathname +
            '?' + 'url=' + encodeURIComponent(this.getTragetUrl());
        window.history.pushState({ path: newurl }, '', newurl);
    }

    private handleClickRemoteFile = (file: string) => async () => {
        console.log({ file });
        const { content } = await fetch(this.getTragetUrl() + '/' + file).then(res => res.json());
        this.setState({ currentFile: file, copyTo: `${file}_${moment().format('HH_mm_ss')}` });
        await this.renewData(content);
    }

    private async fetchFileList() {
        this.setState({ files: [], sizes: {} });
        const { files, sizes } = await fetch(this.getTragetUrl()).then(res => res.json());
        this.setState({ files, sizes });
    }

    private handleClickFetch = async (e: any) => {
        e.preventDefault();
        this.setUrlQuery();
        this.setState({ targetUrl: this.getTragetUrl() })
        await this.fetchFileList();
    }

    private handleClickMove = async (e: any) => {
        e.preventDefault();
        const score = prompt('スコアは？');
        if (!score) return;
        const newFile = this.state.copyTo + '__' + score;
        await fetch(`${this.getTragetUrl()}/copy/${this.state.currentFile}/${newFile}`, {
            method: 'POST'
        });
        await fetch(`${this.getTragetUrl()}/${this.state.currentFile}`, { method: 'DELETE' });
        await this.handleClickFetch(e);
        await this.handleClickRemoteFile(newFile)();
    }

    private isOriginalSelected() {
        return !this.state.currentFile.match(/log_/);
    }

    private handleClickRemove = async (e: any) => {
        if (this.isOriginalSelected()) {
            if (!confirm(`Reset ${this.state.currentFile}?`)) return;
            await fetch(`${this.getTragetUrl()}/${this.state.currentFile}`, { method: 'DELETE' });
            await this.handleClickRemoteFile(this.state.currentFile)();
        } else {
            if (!confirm('Delete file?')) return;
            await fetch(`${this.getTragetUrl()}/removeFile/${this.state.currentFile}`, { method: 'DELETE' });
            await this.handleClickFetch(e);
        }
    }

    render() {
        return (
            <div className="App" style={{ padding: 10 }}>
                <div>
                    <h3>File</h3>
                    <div>
                        <input type="file" onChange={e => this.changeFile(e)} />
                    </div>
                    <form className="fetch-form" onSubmit={this.handleClickFetch}>
                        <input className="fetch-field" placeholder="remote url(:13030)" value={this.state.targetUrl} onChange={({ target }) => this.setState({ targetUrl: target.value })} />
                        <button className="fetch-button">Get file list</button>
                    </form>
                    <div>
                        {this.state.files.map(file => (
                            <button
                                onClick={this.handleClickRemoteFile(file)}
                                className={file === this.state.currentFile ? 'selected-file-button' : 'file-button'}
                                key={file}
                            >{file} ({this.state.sizes[file]})</button>
                        ))}
                    </div>
                    {this.state.currentFile && <div>
                        <button className={this.isOriginalSelected() ? 'remove-original' : 'remove-copied'} onClick={this.handleClickRemove}>{this.isOriginalSelected() ? 'Reset' : 'Remove'}</button>
                    </div>}
                    {this.state.currentFile && this.isOriginalSelected() && <div>
                        <form>
                            <input style={{ width: '50%' }} placeholder="file name" value={this.state.copyTo} onChange={({ target }) => this.setState({ copyTo: target.value })} />
                            <button onClick={this.handleClickMove}>Move</button>
                        </form>
                    </div>
                    }
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
