import express from 'express';
import fs from 'fs';
import path from 'path';
import compression from 'compression';
import prettyBytes from 'pretty-bytes';

const app = express();

const ACCESS_LOG_PATH = '/var/log/nginx';

app.use((_, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header(
        'Access-Control-Allow-Methods',
        'GET, POST, PUT, DELETE, OPTIONS'
    );
    next();
});

app.use(compression() as any);

app.get('/', (req, res) => {
    const logPath = req.query.path || ACCESS_LOG_PATH;
    const files = fs.readdirSync(logPath);
    const sizes: { [file: string]: string } = {};
    const times: { [file: string]: Date } = {};
    for (const file of files) {
        const stat = fs.statSync(path.join(logPath, file));
        sizes[file] = prettyBytes(stat.size);
        times[file] = stat.birthtime;
    }
    res.json({ files, sizes, times });
});

app.get('/:filename', (req, res) => {
    const { filename } = req.params;
    const logPath = req.query.path || ACCESS_LOG_PATH;
    const buffer = fs.readFileSync(path.join(logPath, filename));
    const content = buffer.toString('utf-8');
    if (req.query.html) {
        res.header('Content-Type', 'text/html');
        res.send(content);
    } else {
        res.json({ content });
    }
});

app.delete('/removeFile/:filename', (req, res) => {
    const { filename } = req.params;
    fs.unlinkSync(path.join(ACCESS_LOG_PATH, filename));
    res.json({ filename });
});

app.delete('/:filename', (req, res) => {
    const { filename } = req.params;
    fs.truncateSync(path.join(ACCESS_LOG_PATH, filename), 0);
    res.json({ filename });
});

app.post('/copy/:from/:to', (req, res) => {
    const { from, to } = req.params;
    fs.copyFileSync(
        path.join(ACCESS_LOG_PATH, from),
        path.join(ACCESS_LOG_PATH, to)
    );
    res.json({ from, to });
});

app.listen(13030, () => {
    console.log('listening on 13030');
});
