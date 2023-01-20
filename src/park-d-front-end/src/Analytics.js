import React, { useState, useEffect } from 'react';
import './Analytics.css';

import { BarChart, Bar, XAxis, Tooltip, CartesianGrid } from 'recharts';

// set url to fetch parking data
const jsonURL = 'http://localhost:8000/parking_spaces'

function Get(yourUrl){
    var Httpreq = new XMLHttpRequest();
    Httpreq.open("GET",yourUrl,false);
    Httpreq.send(null);
    return Httpreq.responseText;          
}

function Analytics() {
    const data = [
        { name: "12am", occupancy: 1 },
        { name: "1am", occupancy: 1 },
        { name: "2am", occupancy: 1 },
        { name: "3am", occupancy: 1 },
        { name: "4am", occupancy: 1 },
        { name: "5am", occupancy: 1 },
        { name: "6am", occupancy: 2 },
        { name: "7am", occupancy: 3 },
        { name: "8am", occupancy: 4 },
        { name: "9am", occupancy: 5 },
        { name: "10am", occupancy: 8 },
        { name: "11am", occupancy: 9 },
        { name: "12pm", occupancy: 10 },
        { name: "1pm", occupancy: 9 },
        { name: "2pm", occupancy: 8 },
        { name: "3pm", occupancy: 3 },
        { name: "4pm", occupancy: 6 },
        { name: "5pm", occupancy: 7 },
        { name: "6pm", occupancy: 8 },
        { name: "7pm", occupancy: 9 },
        { name: "8pm", occupancy: 6 },
        { name: "9pm", occupancy: 3 },
        { name: "10pm", occupancy: 2 },
        { name: "11pm", occupancy: 1 },
    ];

    // The following code will be used to retrieve live occupancy data
    //spotNum[0] = # of available spots, spotNum[1] = # of occupied spots
    const [spotNum, setSpotNum] = useState([0,0]);

    // periodically check parking data
    useEffect(() => {
        let interval = setInterval(() => {
            let json_obj = JSON.parse(Get(jsonURL));
            let availableSpots = 0;
            let occupiedSpots = 0;
            for (var i = 0; i < json_obj.length; i++) {
                if (json_obj[i].status) {
                    availableSpots += 1;
                } else {
                    occupiedSpots += 1;
                }
            }
            setSpotNum([availableSpots, occupiedSpots]);
        }, 2000);
        return () => {
            clearInterval(interval);
        }
      });

    return (
        <div>
            { /*
                <div>
                    {"Available spots: " + spotNum[0]}
                </div>
                <div>
                    {"Occupied spots: " + spotNum[1]}
                </div>
            */ }

            { /* The following code will be used to retrieve historical occupancy data */ }

            <h2 style={{ textAlign: "center" }}>Analytics</h2>
            <div className="App">
                <BarChart width={500} height={300} data={data}
                margin={{
                    top: 5,
                    right: 30,
                    left: 80,
                    bottom: 5,
                }}
                barSize={20}>
                <XAxis
                    dataKey="name"
                    scale="point"
                    padding={{ left: 10, right: 10 }}
                />
                <Tooltip />
                <CartesianGrid strokeDasharray="3 3" />
                <Bar dataKey="occupancy" fill="#8884d8" background={
                    { fill: "#eee" }} />
                </BarChart>
            </div>
        </div>
    );
}

export default Analytics;