import React, { useEffect, useState } from 'react';
import TimelineChart from './TimlineChart';
import { LogEntry, SeriesData } from './util';
import './MySqlLogViewer.css';
import { useQueryState } from 'use-location-state';
import queryString from 'querystring';

export default function MySqlLogViewer() {
  const [originalEntries, setOriginalEntries] = useState<LogEntry[] | null>(null);
  const [selectedData, setSelectedData] = useState<SeriesData | null>(null);
  const [start, setStart] = useQueryState<number>('start', 0);
  const [end, setEnd] = useQueryState<number>('end', 0);
  const [skip, setSkip] = useQueryState<number>('skip', 0);
  const [limit, setLimit] = useQueryState<number>('limit', 200);
  const [laneNum, setLaneNum] = useQueryState<number>('lastNum', 10);

  useEffect(() => {
    if (!originalEntries) return;
    setStart(originalEntries[0]?.start);
    setEnd(originalEntries[originalEntries.length - 1]?.end);
  }, [originalEntries]);

  useEffect(() => {
    (async () => {
      let { url, path } = queryString.parse(window.location.search.replace(/^\?/, ''));
      const pathAry = (path as string).split('/');
      url = decodeURIComponent(url as string);
      const { content } = await fetch(
        `${url}/${pathAry[pathAry.length - 1]}?path=${pathAry.slice(0, pathAry.length - 1).join('/')}`
      ).then((res) => res.json());
      setOriginalEntries(content.split('\n').map((line: string) => JSON.parse(line)))
    })();
  }, []);

  if (!originalEntries) {
    return <div>loading</div>
  }

  return (<div>
    <TimelineChart
      start={start}
      end={end}
      skip={skip}
      limit={limit}
      onSelect={setSelectedData}
      originalEntries={originalEntries}
      laneNum={laneNum}
    />
    {selectedData && <samp>
      {selectedData.query}
    </samp>}
    <div>
      <label>Lane num</label>
      <input type="number" onChange={(e) => setLaneNum(parseInt(e.target.value))} value={laneNum} />
    </div>
    <div>
      <div className="inline-block">
        <label>From</label>
        <input type="number" onChange={(e) => setStart(parseInt(e.target.value))} value={start} />
      </div>
      <div className="inline-block">
        <label>To</label>
        <input type="number" onChange={(e) => setEnd(parseInt(e.target.value))} value={end} />
      </div>
      {selectedData && <div>
        <div>
          <button onClick={() => setStart(selectedData.y[0])}>From = {selectedData.y[0]}</button>
          <button onClick={() => setEnd(selectedData.y[1])}>To = {selectedData.y[1]}</button>
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
    <button onClick={() => {
      window.location.hash = '#'
    }}>Reset</button>
  </div>);
}