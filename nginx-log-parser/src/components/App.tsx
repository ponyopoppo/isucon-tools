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
        const newurl = window.location.protocol + "//"  + 
        window.location.host + 
        window.location.pathname + 
        '?' + 'url=' + encodeURIComponent(this.state.targetUrl);
        window.history.pushState({ path: newurl }, '', newurl);
    }

    private handleClickRemoteFile = (file: string) => async () => {
        console.log({ file })    ;
        const { content } = await fetch(this.state.targetUrl + '/' + file).then(res => res.json());        
        this.setState({ currentFile: file, copyTo: `${file}_${moment().format('HH_mm_ss')}` });
        await this.renewData(content);
    }
    
    private async fetchFileList() {
        const { files } = await fetch(this.state.targetUrl).then(res => res.json());
        this.setState({ files });
    }
    
    private handleClickFetch = async (e: any) => {
        e.preventDefault();
        this.setUrlQuery();      
        await this.fetchFileList();  
    }    

    private handleClickMove = async (e: any) => {
        e.preventDefault();        
        if (!confirm('Are you sure?')) return;
        await fetch(`${this.state.targetUrl}/copy/${this.state.currentFile}/${this.state.copyTo}`, {
            method: 'POST'
        });        
        await fetch(`${this.state.targetUrl}/${this.state.currentFile}`, { method: 'DELETE' });                                        
        console.log('hit1')
        await this.handleClickFetch(e);        
        console.log('hit2')
        await this.handleClickRemoteFile(this.state.copyTo)();
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
                            >{file}</button>
                        ))}
                    </div>

                    {this.state.currentFile && !this.state.currentFile.match(/_\d\d_\d\d_\d\d$/) && <div>
                            <form>                                                    
                                <input style={{ width:'50%' }} placeholder="file name" value={this.state.copyTo} onChange={({ target }) => this.setState({ copyTo: target.value })} />    
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
