import React,{useEffect, useState} from 'react'
import axios,{ AxiosResponse } from 'axios'
import {
    ResponsiveContainer,
    LineChart,
    Line,
    CartesianGrid,
    XAxis,
    YAxis,
    Legend,
    Tooltip,
} from "recharts";


const SessionsHoues: React.FC = () => {
    const [dataByHours, setDataByHours] = useState([]);
    const [offset, setOffset] = useState(5);
    useEffect(() => {
        (async ()=>{
        try {
            const {data}=await axios.get(`http://localhost:3001/events/by-hours/${offset}`);
            setDataByHours(data)
        } catch (error) {
            
        }
    })()}, [])
    return (
        // <div style={{ width: "100vw", height: "80vh" }}>
        <div style={{ width: "100%", height: "450px" }}>
        <ResponsiveContainer width="100%" height="100%">
        <LineChart
            data={dataByHours}
            margin={{ top: 20, right: 80, left: 40, bottom: 0 }}
        >
            <Line name="aaaaa" type="monotone" dataKey="count" stroke="red" />
            <CartesianGrid stroke="#ccc" />
            <XAxis dataKey="hour" />
            <YAxis  />
            <Legend verticalAlign="top" height={36} />
            <Tooltip />
        </LineChart>
    </ResponsiveContainer>
    </div>
    )
}

export default SessionsHoues;