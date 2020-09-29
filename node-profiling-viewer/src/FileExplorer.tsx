import React, { useEffect, useState } from 'react';
import { useQueryState } from 'use-location-state';
import { format } from 'timeago.js';
import './FileExplorer.css';

function convertTargetUrl(targetUrl: string) {
  if (!targetUrl.startsWith('http://') && !targetUrl.startsWith('https://')) {
    targetUrl = 'http://' + targetUrl;
  }
  if (!targetUrl.match(/\:[0-9]+/)) {
    targetUrl += ':13030';
  }
  return targetUrl;
}

function is0x(file: string) {
  return file.endsWith('.0x');
}

function isMySql(file: string) {
  return file.endsWith('.mysql.log');
}

async function getFiles(url: string, path: string) {
  const { files, times } = await fetch(
    `${url}?path=${path}`
  ).then((res) => res.json());
  files.sort((a: string, b: string) => new Date(times[b]).getTime() - new Date(times[a]).getTime());
  return { files, times };
}

function NodeProfViewer() {
  const [targetUrl, setTargetUrl] = useQueryState('targetUrl', '');
  const [path, setPath] = useQueryState('path', '');
  const [files, setFiles] = useState<string[]>([]);
  const [times, setTimes] = useState<{ [file: string]: string }>({});

  useEffect(() => {
    if (targetUrl && path) {
      fetchFileList(targetUrl, path);
    }
  }, []);

  const fetchFileList = async (targetUrl: string, path: string) => {
    const url = convertTargetUrl(targetUrl);
    setTargetUrl(url);
    try {
      const { files, times } = await getFiles(url, path);
      setFiles(files);
      setTimes(times);
    } catch (e) {
      setFiles([]);
      setTimes({});
    }
  }

  const handleClickGetList = () => {
    fetchFileList(targetUrl, path);
  };

  const handleClickFile = async (file: string) => {
    if (is0x(file)) {
      window.open(`${targetUrl}/flamegraph.html?html=1&path=${path}/${file}#{"merged":false,"nodeId":null,"excludeTypes":["init"]}`, "_blank");
      return;
    }
    if (isMySql(file)) {
      window.open(`/mysql?url=${encodeURIComponent(targetUrl)}&path=${encodeURIComponent(`${path}/${file}`)}`);
      return;
    }
    const newPath = `${path}/${file}`;
    setPath(newPath, { method: 'push' });
    fetchFileList(targetUrl, newPath);
  };

  return (
    <div className="App">
      <section>
        <aside>
          <input
            placeholder="URL"
            value={targetUrl}
            onChange={(e) => setTargetUrl(e.target.value)}
          />
          <input
            placeholder="/path/to/*.0x"
            value={path}
            onChange={(e) => {
              setPath(e.target.value);
            }}
          />
          <button onClick={handleClickGetList}>Get list</button>
        </aside>
        <table>
          {files.map((file) => (
            <tr key={file}>
              <td>
                <a className={is0x(file) || isMySql(file) ? 'link0x' : ''} href="#" onClick={(e) => {
                  e.preventDefault();
                  handleClickFile(file)
                }}>
                  {file}
                </a>
              </td>
              <td>
                {format(times[file])}
              </td>
              <td>
                {times[file]}
              </td>
            </tr>
          ))}
        </table>
      </section>
    </div>
  );
}

export default NodeProfViewer;
