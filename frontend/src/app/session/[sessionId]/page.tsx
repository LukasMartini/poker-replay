"use client";
import React, { useEffect, useState } from "react";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { LineChart, generateSessionLineData } from "@/components/SessionLineChart";
import { CategoryScale } from "chart.js/auto";
import { Chart } from "chart.js";
import { Hand } from "@/lib/utils";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

Chart.register(CategoryScale);

export default function SessionDetails() { // Asynchronous server component for pulling api calls. // TODO: pass pathname somehow
    const windowSize = 50;

    var [chartData, setChartData] = useState(generateSessionLineData([]));
    var [links, setLinks] = useState([]);
    var [offset, setOffset] = useState(0);
    var oldOffset = 0; // stores the offset before an update
    var trendStack = [0]; // store a stack of the profit trends for the first item in each data range, for moving the window left and re-setting the trend
    var [handCount, setHandCount] = useState(0);

    const pathname = usePathname();
    const session = pathname.slice(9);

    const fetchQuantity = async () => {
        await fetch(`${API_URL}hand_count/1?sessionid=${session}`)
            .then(resp => resp.json())
            .then(data => {
                setHandCount(data[0].hands);
            });
    };

    useEffect(() => {
        fetchQuantity();
    }, [])
  
    const fetchHandData = async () => { 
        // Run SQL queries to fetch appropriate data. See server.py for further information.
         // TODO: use cached user
        await fetch(`${API_URL}cash_flow/1?sessionid=${session}&limit=${windowSize}&offset=${offset}&descending=no`, {
            method: "GET"
        })
            .then(resp => resp.json())
            .then(data => {
                // if the offset is 0, the starting trend must be zero
                if (offset == 0) {
                    trendStack = [0];
                    setChartData(generateSessionLineData(data));
                }
                // if the window has moved right
                else if (oldOffset < offset) {
                    // update the new data to be offset by the last item in this data
                    var newData = generateSessionLineData(data, [
                        chartData.datasets[0].data[offset-oldOffset-1],
                        -1
                        ]);

                    // now push the starting offset to the stack
                    trendStack.push(newData.datasets[0].data[0]);

                    setChartData(newData);
                }
                // if the window has moved left (or not at all)
                else {
                    // if it hasn't moved, it must be at offset 0, with the value we have saved (perfectly retraces steps)
                    setChartData(generateSessionLineData(data, [
                        trendStack.pop() ?? 0,
                        0
                    ]));
                }

                // new data has been processed, so update oldOffset
                oldOffset = offset;

                setLinks(data.map((hand: Hand) => `${process.env.NEXT_PUBLIC_ROOT_URL}${hand.hand_id}`))
            });
    }

    useEffect(() => {
        fetchHandData();
    }, [offset])

    const handleClickLeft = () => {
        setOffset((prevOffset) => Math.max(prevOffset - windowSize, 0));
    }
    const handleClickRight = () => {
        setOffset((prevOffset) => {
            const newOffset = prevOffset + windowSize;
            return newOffset < handCount ? newOffset : prevOffset;
        });
    }  

    const isLeftButtonDisabled = offset === 0 || handCount <= windowSize;
    const isRightButtonDisabled = offset + windowSize >= handCount || handCount <= windowSize;

    return (
        <div className="relative">
            <div className="flex justify-between translate-y-10">
                <button onClick={handleClickLeft} disabled={isLeftButtonDisabled} className="opacity-50 disabled:cursor-not-allowed disabled:opacity-20 disabled:scale-100 hover:opacity-100 transition ease-in-out delay-100 hover:scale-105">
                    <Image src={"/left-w.svg"} alt="left" width={24} height={24} />
                </button>

                <button onClick={handleClickRight} disabled={isRightButtonDisabled} className="opacity-50 disabled:cursor-not-allowed disabled:opacity-20 disabled:scale-100 hover:opacity-100 transition ease-in-out delay-00 hover:scale-105">
                    <Image src={"/right-w.svg"} alt="right" width={24} height={24} />
                </button>
            </div>
            <div className="bg-[#2C2C2C] text-white px-32"> {/* Global tailwind formatting for both child components.*/}
                <LineChart chartData={chartData} hyperlinks={links} />
            </div>
        </div>
    );
}