interface DataRow {
    id: number;
    position: number;
    session_id: string;
    remote_addr: string;
    time_local: string;
    request_uri: string;
    request_query: string;
    request_method: string;
    request_time: string;
    request_body: string;
    request_status: string;
}
