import * as React from 'react';
import { useEffect, useMemo, useState } from 'react';
import 'react-table/react-table.css';
import { Sankey, SankeyPoint, Hint } from 'react-vis';
import { getDisplayName } from '../utils/GroupUtil';

interface Props {
    originalData: DataRow[];
    groupedData: {
        data: DataRow[];
        groupNames: string[];
        patterns: {
            [key: string]: string;
        };
    };
}

interface Edge {
    from: number;
    to: number;
    weight: number;
}

const KEY_SEPARATOR = '#####';

export default function UserFlow({ originalData, groupedData }: Props) {
    const [nodes, setNodes] = useState<string[]>([]);
    const [edges, setEdges] = useState<Edge[]>([]);
    const [maxDepth, setMaxDepth] = useState(0);
    const [activeEdge, setActiveEdge] = useState<SankeyPoint | null>(null);
    const [minEdgeWeight, setMinEdgeWeight] = useState(2);

    const makeDataKey = (row: DataRow) => {
        return (
            groupedData.groupNames
                .filter((name) => !name.startsWith('request_uri_'))
                .map((name) => getDisplayName(row, name, groupedData.patterns))
                .join(' ') + `${KEY_SEPARATOR}(${row.position})`
        );
    };

    useEffect(() => {
        const lastKey: { [sessionId: string]: string } = {};
        const edgeWeight: { [key: string]: number } = {};
        for (const row of originalData) {
            const sessionId = row.session_id || row.remote_addr;
            const key = `${makeDataKey(row)} ${lastKey[sessionId] || ''}`;
            if (lastKey[sessionId]) {
                const edgeKey = JSON.stringify({
                    from: lastKey[sessionId],
                    to: key,
                });
                if (!edgeWeight[edgeKey]) edgeWeight[edgeKey] = 0;
                edgeWeight[edgeKey]++;
            }
            lastKey[sessionId] = key;
        }

        const key2NodeId: { [key: string]: number } = {};
        const edgeKeys = Object.keys(edgeWeight).filter(
            (edgeJson) => edgeWeight[edgeJson] >= minEdgeWeight
        );

        const nodes: string[] = [];
        let maxDepth = 0;
        for (const edgeKey of edgeKeys) {
            const { from, to } = JSON.parse(edgeKey);
            for (const key of [from, to] as string[]) {
                if (typeof key2NodeId[key] === 'undefined') {
                    key2NodeId[key] = nodes.length;
                    nodes.push(key.split(KEY_SEPARATOR)[0]);
                    maxDepth = Math.max(
                        maxDepth,
                        key.split(KEY_SEPARATOR).length - 1
                    );
                }
            }
        }

        setMaxDepth(maxDepth);
        setNodes(nodes);
        setEdges(
            edgeKeys
                .map((edgeJson) => ({
                    ...JSON.parse(edgeJson),
                    weight: edgeWeight[edgeJson],
                }))
                .map((edge) => ({
                    from: key2NodeId[edge.from],
                    to: key2NodeId[edge.to],
                    weight: edge.weight,
                }))
        );
    }, [groupedData, minEdgeWeight]);

    const renderHint = () => {
        if (!activeEdge) return null;
        const x =
            activeEdge.source.x1 +
            (activeEdge.target.x0 - activeEdge.source.x1) / 2;
        const y = activeEdge.y0 - (activeEdge.y0 - activeEdge.y1) / 2;

        const hintValue = {
            [`${activeEdge.source.name} ➞ ${activeEdge.target.name}`]:
                activeEdge.value,
        };
        return <Hint x={x} y={y} value={hintValue} />;
    };

    const sankeyNodes = useMemo(
        () => nodes.map((node) => ({ name: node })),
        [nodes]
    );

    const sankeyEdges = useMemo(
        () =>
            edges.map((edge, i) => ({
                source: edge.from,
                target: edge.to,
                value: edge.weight,
                opacity: i === activeEdge?.index ? 1 : 0.8,
            })),
        [edges]
    );

    return (
        <div>
            <div>Max depth: {maxDepth}</div>
            <div>
                Min edge weight: {minEdgeWeight}
                <button onClick={() => setMinEdgeWeight(minEdgeWeight - 1)}>
                    -
                </button>
                <button onClick={() => setMinEdgeWeight(minEdgeWeight + 1)}>
                    +
                </button>
            </div>
            <Sankey
                animation
                margin={50}
                nodes={sankeyNodes}
                links={sankeyEdges}
                width={200 * maxDepth}
                align="left"
                height={maxDepth ? 800 : 0}
                layout={24}
                nodeWidth={15}
                nodePadding={10}
                onLinkMouseOver={(link) => setActiveEdge(link)}
                onLinkMouseOut={() => setActiveEdge(null)}
                style={sankeyStyle}
            >
                {renderHint()}
            </Sankey>
        </div>
    );
}

const sankeyStyle = {
    links: {
        opacity: 0.3,
    },
    labels: {
        fontSize: '12px',
    },
    rects: {
        strokeWidth: 0,
    },
};
