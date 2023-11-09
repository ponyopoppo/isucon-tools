import { pathToRegexp } from 'path-to-regexp';

const regexpCache: { [key: string]: RegExp } = {};

export function getDisplayName(
    row: DataRow,
    groupName: string,
    patterns: { [key: string]: string }
) {
    const colName = groupName.startsWith('request_uri')
        ? 'request_uri'
        : groupName;
    const pattern = patterns[colName];
    if (pattern) {
        const patlines = pattern.split('\n').filter((line) => line.trim());
        for (let patline of patlines) {
            try {
                if (colName === 'request_uri') {
                    const regExp =
                        regexpCache[patline] ??
                        (regexpCache[patline] = pathToRegexp(patline));
                    if (regExp.test(row[colName] || '')) {
                        return '[P] ' + patline;
                    }
                } else {
                    const pat = patline
                        .split('/')
                        .map((v) => (v.startsWith(':') ? '[^/]*' : v))
                        .join('/');
                    const re = new RegExp(`^${pat}$`);
                    if ((row[colName] || '').match(re)) {
                        return '[P] ' + patline;
                    }
                }
            } catch (e) {}
        }
        return row[colName];
    }
    if (colName === 'request_uri') {
        const num = parseInt(groupName.split('_')[2]);
        return row['request_uri']
            .split('/')
            .slice(0, num + 1)
            .join('/');
    }
    return row[groupName];
}
