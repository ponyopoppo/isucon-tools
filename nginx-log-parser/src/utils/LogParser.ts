const reader = new FileReader();

export async function readText(
    e: React.ChangeEvent<HTMLInputElement>
): Promise<string> {
    return new Promise<string>((resolve) => {
        reader.onload = (e: any) => {
            if (!e.target) return;
            if (e.target.readyState !== 2) return;
            if (e.target.error) {
                alert('Error while reading file');
                return;
            }

            const filecontent: string = e.target.result;
            resolve(filecontent);
        };

        reader.readAsText((e.target as any).files[0]);
    });
}

export async function parse(text: string): Promise<DataRow[]> {
    const positions: { [key: string]: number } = {};
    const rows = text
        .split('\n')
        .filter((row) => row)
        .map((row) => {
            try {
                return JSON.parse(row);
            } catch (e) {
                return null;
            }
        })
        .filter((row) => row)
        .map((row, i) => {
            const ret: any = {};
            (ret as any).id = i;
            Object.keys(row).forEach((key) => {
                const value = row[key];
                if (!key) return;
                if (key === 'request_uri') {
                    ret[key] = value.split('?')[0];
                    ret['request_query'] = value.split('?').slice(1).join('?');
                    return;
                }
                ret[key] = value;
            });
            const sessionId = row.session_id || row.remote_addr;
            ret.position = (positions[sessionId] || 0) + 1;
            positions[sessionId] = ret.position;
            return ret as DataRow;
        });
    return rows;
}
