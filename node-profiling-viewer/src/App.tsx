import React from 'react';

import FileExplorer from './FileExplorer';
import './mvp.css';
import MySqlLogViewer from './MySqlLogViewer/MySqlLogViewer';
function App() {
  if (window.location.pathname.startsWith('/mysql')) {
    return <MySqlLogViewer />;
  }

  return (
    <div className="App">
      <FileExplorer />
    </div>
  );
}

export default App;
