import React, { } from 'react';
import { CartesianGrid, Cell, Legend, Line, LineChart, Pie, PieChart, Tooltip, XAxis, YAxis } from 'recharts';
import { Card } from 'semantic-ui-react';

import useWindowDimensions from './useWindowDimensions';

function useRecharts() {
    const { width } = useWindowDimensions();



    const RADIAN = Math.PI / 180;

    const renderCustomizedLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent, index }) => {
        const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
        const x = cx + radius * Math.cos(-midAngle * RADIAN);
        const y = cy + radius * Math.sin(-midAngle * RADIAN);

        return (
            <text x={x} y={y} fill="white" textAnchor={x > cx ? 'start' : 'end'} dominantBaseline="central">
                {`${(percent * 100).toFixed(0)}%`}
            </text>
        );
    };

    const CustomTooltip = ({ active, payload }) => active
        ? (
            <Card>
                <Card.Content textAlign="left" header={`${payload[0].name}`} />
                <Card.Content textAlign="left" description={`${payload[0].value}`} />
            </Card>
        )
        : null

    function renderPieChart(data, isDonut = false, colors = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042']) {
        return (
            <PieChart width={(width / 3) - 28} height={500}>
                <Pie
                    data={data}
                    dataKey={"value"}
                    nameKey={"name"}
                    cx={"50%"}
                    cy={"50%"}
                    innerRadius={isDonut}
                    outerRadius={150}
                    labelLine={false}
                    label={renderCustomizedLabel}
                // fill="#8884d8"
                >
                    {
                        data.map((entry, index) => <Cell fill={colors[index % colors.length]} key={index} />)
                    }
                </Pie>

                <Tooltip content={CustomTooltip} />
            </PieChart>
        )
    }

    function renderLineChart(data, dataKey) {
        return (
            <LineChart
                width={width * 0.9}
                height={300}
                data={data}
                margin={{ left: width * 0.075 }}
            >
                <XAxis dataKey="name" />
                <YAxis />
                <CartesianGrid strokeDasharray="3 3" />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey={dataKey} stroke="#82ca9d" />
            </LineChart>
        );
    }

    return {
        renderPieChart,
        renderLineChart,
    };
}

export default useRecharts;