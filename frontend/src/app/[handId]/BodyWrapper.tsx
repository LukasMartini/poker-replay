'use client';
import HandDetails from './HandDetails';
import MetaData from "./MetaData";
import Replay from './Replay';

// A wrapper component used to pass data and rerender the details table and the replay.

interface BodyWrapperProps {
    handID: string;
    tableName: string;
    timestamp: string;
    rows: Array<any>;
}

export default function BodyWrapper(props: BodyWrapperProps) {
    return (
        <div dir="ltr" className="flex flex-row justify-between py-8">
            <div className="flex flex-col"> {/* Contains MetaData, Replay display, and pagination interface. */}
                <MetaData handID={props.handID} tableName={props.tableName} timestamp={props.timestamp}/>
                <Replay/>
            </div>
            <div  className="flex"> {/* Contains HandDetails side bar. */}
                <HandDetails rows={props.rows}/>
            </div>
        </div>
    )
}
