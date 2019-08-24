import express from 'express';
import fs from 'fs';
import path from 'path';
const app = express();

// const ACCESS_LOG_PATH = '/usr/local/Cellar/nginx/1.17.3/logs';
const ACCESS_LOG_PATH = '/var/log/nginx';

app.use((_, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header(
        'Access-Control-Allow-Methods',
        'GET, POST, PUT, DELETE, OPTIONS',
    );
    next();
});

app.get('/', (req, res) => {
    const files = fs.readdirSync(ACCESS_LOG_PATH);
    res.json({ files });
});

app.get('/:filename', (req, res) => {
    const { filename } = req.params;
    const buffer = fs.readFileSync(path.join(ACCESS_LOG_PATH, filename));
    const content = buffer.toString('utf-8');
    res.json({ content });
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
        path.join(ACCESS_LOG_PATH, to),
    );
    res.json({ from, to });
});

app.listen(13030, () => {
    console.log('listening on 13030');
});
