import * as React from 'react';
import ReactTable from 'react-table';
import 'react-table/react-table.css';
import { DATA_ROW_KEYS, SHORT_KEYS } from '../utils/Constants';

interface Props {
    data: DataRow[];
}

export default function Table({ data }: Props) {
    return (
        <ReactTable
            data={data}
            columns={DATA_ROW_KEYS.map((key) => ({
                Header: key,
                accessor: key,
                width: SHORT_KEYS.indexOf(key) >= 0 ? 80 : undefined,
            }))}
        />
    );
}
