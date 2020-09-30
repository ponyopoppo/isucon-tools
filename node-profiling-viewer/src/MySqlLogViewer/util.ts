import moment from 'moment';

export function formatDate(dateNumber: number) {
    return moment(dateNumber).format('mm:ss.SSS');
}

export interface SeriesData {
    x: string;
    y: [number, number];
    fillColor: string;
    query: string;
    connectionId: number;
    args?: string;
    pos: number;
}

export interface LogEntry {
    connectionId: number;
    start: number;
    end: number;
    query: string;
    isFailed?: boolean;
    isTransaction?: boolean;
    args?: string;
    pos: number;
}
