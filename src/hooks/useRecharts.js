import React, { } from 'react';
import { CartesianGrid, Cell, Legend, Line, LineChart, Pie, PieChart, Tooltip, XAxis, YAxis, Label } from 'recharts';

import { PIE_CHART_CHUNK } from '../constants/statisticsConstants';
import useWindowDimensions from './useWindowDimensions';

function useRecharts() {
    const RADIAN = Math.PI / 180;

    const renderCustomizedLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent, index, name, value, fill }) => {
        // const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
        // const x = cx + radius * Math.cos(-midAngle * RADIAN);
        // const y = cy + radius * Math.sin(-midAngle * RADIAN);

        const radius = outerRadius + 25;
        const x = cx + radius * Math.cos(-midAngle * RADIAN);
        const y = cy + radius * Math.sin(-midAngle * RADIAN);


        return (
            <text fontSize='12' fill={fill} x={x} y={y} textAnchor={x > cx ? 'start' : 'end'} dominantBaseline="central" >
                {`${name}: ${value} (${(percent * 100).toFixed(0)}%)`}
            </text>
        );
    };

    // const CustomTooltip = ({ active, payload }) => active
    //     ? (
    //         <Card>
    //             <Card.Content textAlign="left" header={`${payload[0].name}`} />
    //             <Card.Content textAlign="left" description={`${payload[0].value}`} />
    //         </Card>
    //     )
    //     : null

    function renderPieChart(options) {
        const { data, isDonut, colors, width } = options

        return (
            <PieChart width={width} height={500}>
                <Pie
                    data={data}
                    dataKey={"value"}
                    nameKey={"name"}
                    cx={"50%"}
                    cy={"50%"}
                    innerRadius={isDonut}
                    outerRadius={150}
                    labelLine={true}
                    label={renderCustomizedLabel}
                >
                    {
                        data.map((entry, index) => <Cell fill={colors[index % colors.length]} key={index} />)
                    }
                </Pie>
                <Tooltip />
                {/* <Tooltip content={CustomTooltip} /> */}
            </PieChart>
        )
    }

    function renderLineChart(options) {
        const { data, dataKey, width } = options

        return (
            <LineChart
                width={width * 0.9}
                height={300}
                data={data}
                margin={{ left: width * 0.05 }}
            >
                <XAxis dataKey="name" />
                <YAxis />
                <CartesianGrid strokeDasharray="3 3" />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey={dataKey} stroke="#0088FE" />
            </LineChart>
        );
    }

    return {
        renderPieChart,
        renderLineChart,
    };
}

export default useRecharts;