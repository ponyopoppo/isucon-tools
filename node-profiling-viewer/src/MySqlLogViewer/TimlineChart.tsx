import React, { useEffect, useMemo, useState } from 'react';
import ReactApexChart from 'react-apexcharts';
import { formatDate, LogEntry, SeriesData } from './util';

interface Props {
  start: number;
  end: number;
  onSelect: (data: SeriesData) => void;
  originalEntries: LogEntry[];
  laneNum: number;
  skip: number;
  limit: number;
}

const APEX_OPTIONS = {
  chart: {},
  plotOptions: {
    bar: {
      horizontal: true,
      distributed: true,
      dataLabels: {
        hideOverflowingLabels: false
      }
    }
  },
  dataLabels: {
    enabled: false,
  },
  xaxis: {
    type: 'datetime',
    labels: {
      formatter: formatDate
    }
  },
  yaxis: {
    type: 'number'

  },
  grid: {
    row: {
      colors: ['#f3f4f5', '#fff'],
      opacity: 1
    }
  },
  tooltip: {
    show: true,
    y: {},
    x: {},
  },
};

export default function TimelineChart({ onSelect, start, end, originalEntries, laneNum, skip, limit }: Props) {
  const [logEntries, setLogEngties] = useState<LogEntry[]>([]);
  const [key, setKey] = useState(0);

  useEffect(() => {
    setLogEngties(originalEntries
      .filter(log => log.start >= start && log.end <= end)
      .slice(skip, limit + skip)
      .sort((a, b) => (a.connectionId % laneNum) - (b.connectionId % laneNum)));
    setKey(Math.random())
  }, [start, end, skip, limit, originalEntries, laneNum]);

  const series: [{ data: SeriesData[] }] = useMemo(() => [{
    data: logEntries
      .map(log => ({
        x: `${log.connectionId % laneNum}`,
        y: [
          log.start,
          log.end,
        ],
        fillColor: log.isFailed ? '#ff0000' : log.isTransaction ? '#ff8800' : '#08f8f8',
        query: log.query,
        connectionId: log.connectionId,
      }))
  }], [logEntries, laneNum]);

  APEX_OPTIONS.tooltip.x = {
    formatter: (value: any) => {
      return formatDate(value);
    },
  }
  APEX_OPTIONS.tooltip.y = {
    formatter: (_value: any, { seriesIndex, dataPointIndex }: any) => {
      const data = series[seriesIndex].data[dataPointIndex];
      return 'connection: ' + data.connectionId + `(${data.x})`;
    },
    title: {
      formatter: (_value: any, { seriesIndex, dataPointIndex }: any) => {
        const data = series[seriesIndex].data[dataPointIndex];
        if (data.query.length < 50) return data.query;
        return data.query.slice(0, 50) + '...';
      }
    },
  };
  APEX_OPTIONS.chart = {
    height: 350,
    type: 'rangeBar',
    animations: {
      enabled: false,
    },
    events: {
      click: (_e: any, _value: any, { seriesIndex, dataPointIndex }: any) => {
        if (seriesIndex < 0 || dataPointIndex < 0) return;
        const data = series[seriesIndex].data[dataPointIndex];
        onSelect(data);
      },
    }
  }

  return <>
    {logEntries.length}
    <ReactApexChart key={key} options={APEX_OPTIONS} series={series} type="rangeBar" height={350} />
  </>

}
