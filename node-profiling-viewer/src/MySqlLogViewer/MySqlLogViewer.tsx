import React, { useEffect, useState } from 'react';
import TimelineChart from './TimlineChart';
import { LogEntry, SeriesData } from './util';
import './MySqlLogViewer.css';
import { useQueryState } from 'use-location-state';
import queryString from 'querystring';

export default function MySqlLogViewer() {
  const [originalEntries, setOriginalEntries] = useState<LogEntry[] | null>(null);
  const [selectedData, setSelectedData] = useState<SeriesData | null>(null);
  const [skip, setSkip] = useQueryState<number>('skip', 0);
  const [limit, setLimit] = useQueryState<number>('limit', 500);
  const [laneNum, setLaneNum] = useQueryState<number>('lastNum', 20);
  const [filter, setFilter] = useQueryState<string>('filter', '');


  useEffect(() => {
    (async () => {
      let { url, path } = queryString.parse(window.location.search.replace(/^\?/, ''));
      const pathAry = (path as string).split('/');
      url = decodeURIComponent(url as string);
      const { content }: { content: string } = await fetch(
        `${url}/${pathAry[pathAry.length - 1]}?path=${pathAry.slice(0, pathAry.length - 1).join('/')}`
      ).then((res) => res.json());
      setOriginalEntries(content.split('\n').filter((line) => line).map((line, i) => ({ ...JSON.parse(line), pos: i })))
    })();
  }, []);

  if (!originalEntries) {
    return <div>loading</div>
  }

  return (<div>
    <TimelineChart
      skip={skip}
      limit={limit}
      onSelect={setSelectedData}
      originalEntries={originalEntries}
      laneNum={laneNum}
      filter={filter}
    />
    {selectedData && <>
      <div>
        <samp>{selectedData.query}</samp>
      </div>
      <div>
        {selectedData.args && <samp><pre>{JSON.stringify(JSON.parse(selectedData.args), null, 2)}</pre></samp>}
      </div>
    </>}

    <div>
      <label>Lane num</label>
      <input type="number" onChange={(e) => setLaneNum(parseInt(e.target.value))} value={laneNum} />
    </div>
    <div>
      {selectedData && <div>
        <div>
          <button onClick={() => setSkip(selectedData.pos)}>skip = {selectedData.pos}</button>
          <button onClick={() => setLimit(selectedData.pos - skip)}>limit = {selectedData.pos - skip}</button>
        </div>
      </div>}
    </div>
    <div>
      <div className="inline-block">
        <label>Length</label>
        <p>{originalEntries.length}</p>
      </div>
      <div className="inline-block">
        <label>Skip</label>
        <input type="number" onChange={(e) => setSkip(parseInt(e.target.value))} value={skip} />
      </div>
      <div className="inline-block">
        <label>Limit</label>
        <input type="number" onChange={(e) => setLimit(parseInt(e.target.value))} value={limit} />
      </div>
    </div>
    <div>
      <label>Filter</label>
      <input onChange={(e) => setFilter(e.target.value)} value={filter} />
    </div>
    <button onClick={() => {
      window.location.hash = '#'
    }}>Reset</button>
  </div>);
}