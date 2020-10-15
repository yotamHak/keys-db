import { functions } from 'lodash';
import React, { } from 'react';
import { CartesianGrid, Cell, Legend, Line, LineChart, Pie, PieChart, Tooltip, XAxis, YAxis } from 'recharts';
import { Card } from 'semantic-ui-react';
import useWindowDimensions from './useWindowDimensions';


function useRecharts(options,) {
    const { height, width } = useWindowDimensions();

    const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];
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

    function renderPieChart(data) {
        return (
            <PieChart width={(width / 3) - 28} height={500}>
                {/* <Pie isAnimationActive={false} data={data} cx={200} cy={200} outerRadius={80} fill="#8884d8" label /> */}
                <Pie
                    data={data}
                    dataKey={"value"}
                    nameKey={"name"}
                    cx={"50%"}
                    cy={"50%"}
                    // innerRadius={75}
                    outerRadius={150}
                    labelLine={false}
                    label={renderCustomizedLabel}
                    fill="#8884d8"
                >
                    {
                        data.map((entry, index) => <Cell fill={COLORS[index % COLORS.length]} key={index} />)
                    }
                </Pie>

                <Tooltip content={CustomTooltip} />
            </PieChart>

            // <PieChart width={500} height={500}>
            //     <Pie
            //         data={data}
            //         dataKey="value"
            //         nameKey="name"
            //         cx={"50%"}
            //         cy={"50%"}
            //         // label={renderCustomizedLabel}
            //         outerRadius={150}
            //         fill="#8884d8"
            //         labelLine={true}
            //         label

            //     >
            //         <Tooltip />
            //         {/* {
            //             data.map((entry, index) => <Cell fill={COLORS[index % COLORS.length]} />)
            //         } */}
            //     </Pie>
            // </PieChart>
        )
    }

    function renderLineChart() {
        const data = [
            { name: 'Page A', pv: 2400, },
            { name: 'Page B', pv: 1398, },
            { name: 'Page C', pv: 9800, },
            { name: 'Page D', pv: 3908, },
            { name: 'Page E', pv: 4800, },
            { name: 'Page F', pv: 3800, },
            { name: 'Page G', pv: 4300, },
        ];

        return (
            <LineChart
                width={600}
                height={300}
                data={data}
                margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
            >
                <XAxis dataKey="name" />
                <YAxis />
                <CartesianGrid strokeDasharray="3 3" />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="pv" stroke="#8884d8" activeDot={{ r: 8 }} />
                <Line type="monotone" dataKey="uv" stroke="#82ca9d" />
            </LineChart>
        );
    }

    return {
        renderPieChart,
        renderLineChart,
    };
}

export default useRecharts;