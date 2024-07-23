"use client";
import React, { useEffect, useState } from "react";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { LineChart, generateSessionLineData } from "@/components/SessionLineChart";
import { CategoryScale } from "chart.js/auto";
import { Chart } from "chart.js";
import { Hand } from "@/util/utils";
import { useAuth } from "@/components/auth/AuthContext";
import { fetchCashFlow, fetchHandCountInSession } from "@/util/api-requests";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

Chart.register(CategoryScale);

export default function SessionDetails() { // Asynchronous server component for pulling api calls. // TODO: pass pathname somehow
    const windowSize = 50;

    const user = useAuth();

    var [chartData, setChartData] = useState(generateSessionLineData([]));
    var [links, setLinks] = useState([]);
    var [offset, setOffset] = useState(0);
    var [oldOffset, setOldOffset] = useState(-1); // stores the offset before an update
    var [trendStack, setTrendStack] = useState([0]); // store a stack of the profit trends for the first item in each data range, for moving the window left and re-setting the trend
    var [handCount, setHandCount] = useState(0);

    const pathname = usePathname();
    const session = pathname.slice(9);

    const fetchQuantity = async () => {
        await fetchHandCountInSession(Number(session), user.auth.token)
            .then(resp => resp.json())
            .then(data => {
                setHandCount(data[0].hands);
            });
    };

    useEffect(() => {
        if (user.auth.token != null) {
            fetchQuantity();
        }
    }, [user])
  
    const fetchHandData = async () => { 
        // if we aren't rendering the start, and nothing has moved, don't do anything
        if (offset == oldOffset) return;
        console.log(`Fetching hand data from offset ${offset}`);
        console.log(`Current trend stack is `, trendStack);

        // Run SQL queries to fetch appropriate data. See server.py for further information.
         // TODO: use cached user
        await fetchCashFlow(session, 50, offset, user.auth.token)
            .then(resp => resp.json())
            .then(data => {

                // if the offset is 0, the starting trend must be zero
                if (offset == 0) {
                    setTrendStack([0]);
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
                    trendStack.push(newData.datasets[0].data[0])
                    setTrendStack(trendStack);

                    setChartData(newData);
                }
                // if the window has moved left (or not at all)
                else {
                    trendStack.pop();
                    setTrendStack(trendStack);
                    // if it hasn't moved, it must be at offset 0, with the value we have saved (perfectly retraces steps)
                    setChartData(generateSessionLineData(data, [
                        trendStack.at(-1) ?? 0,
                        0
                    ]));
                }

                // new data has been processed, so update oldOffset
                setOldOffset(offset);

                setLinks(data.map((hand: Hand) => `${process.env.NEXT_PUBLIC_ROOT_URL}${hand.hand_id}`))
            });
    }

    useEffect(() => {
        if (user.auth.token) {
            fetchHandData();
        }
    }, [user, offset])

    const handleClickLeft = () => {
        setOffset((prevOffset) => Math.max(prevOffset - windowSize, 0));
    }
    const handleClickRight = () => {
        setOffset((prevOffset) => {
            const newOffset = prevOffset + windowSize;
            console.log(`Updating offset from ${prevOffset} to ${newOffset}`);
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