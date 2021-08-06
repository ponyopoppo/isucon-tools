import * as React from 'react';
import { useEffect, useState } from 'react';
import { Highlight, VerticalRectSeries, XAxis, XYPlot, YAxis } from 'react-vis';

interface Props {
    data: DataRow[];
    onChangeData: (data: DataRow[]) => void;
}

const NUM = 100;
export default function BarChart({ data, onChangeData }: Props) {
    const [selectedData, setSelectedData] = useState<DataRow[]>(data);
    const [chartData, setChartData] = useState<
        { x0: number; x: number; y0: number; y: number }[]
    >([]);
    const [selection, setSelection] =
        useState<{ left: number; right: number } | null>(null);
    useEffect(() => {
        setSelectedData(data);
    }, [data]);
    useEffect(() => {
        onChangeData(selectedData);
    }, [selectedData]);
    const calcChunk = () => {
        const times = selectedData.map((row) => new Date(row.time).getTime());
        let minDate = times[0];
        let maxDate = times[0];
        for (const time of times) {
            minDate = Math.min(minDate, time);
            maxDate = Math.max(maxDate, time);
        }

        const chunk = (maxDate - minDate) / NUM;
        return { minDate, maxDate, chunk };
    };
    useEffect(() => {
        const { minDate, chunk } = calcChunk();
        const counts = new Array<number>(NUM).fill(0);
        for (const row of selectedData) {
            let key = Math.floor(
                (new Date(row.time).getTime() - minDate) / chunk
            );
            if (key === NUM) key--;
            if (key < NUM) {
                counts[key]++;
            }
        }
        setChartData(
            counts.map((count, i) => ({
                x0: (i * chunk) / 1000,
                x: ((i + 1) * chunk) / 1000,
                y0: 0,
                y: count,
            }))
        );
    }, [selectedData]);
    const updateDragState = (area: any) => {
        if (area) {
            const { minDate, chunk } = calcChunk();
            setSelectedData(
                selectedData.filter((row) => {
                    const x =
                        new Date(row.time).getTime() - minDate + chunk / 2;
                    return area.left * 1000 < x && x < area.right * 1000;
                })
            );
            setSelection({ left: area.left, right: area.right });
        }
    };

    const handlePressReset = () => {
        setSelectedData(data);
    };

    return (
        <div>
            <button onClick={handlePressReset}>Reset</button>
            {chartData.length && (
                <XYPlot width={500} height={300}>
                    <XAxis />
                    <YAxis />
                    <VerticalRectSeries
                        data={chartData as any}
                        stroke="white"
                        colorType="literal"
                    />
                    <Highlight
                        color="#829AE3"
                        enableY={false}
                        onBrushEnd={updateDragState}
                    />
                </XYPlot>
            )}

            <div>
                <b>left:</b>{' '}
                {selection && `${Math.floor(selection.left * 100) / 100},`}
                <b>right:</b>{' '}
                {selection && `${Math.floor(selection.right * 100) / 100},`}
            </div>
        </div>
    );
}
