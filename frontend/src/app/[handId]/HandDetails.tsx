'use client';
// Contains a chronological list of all the necessary details:
//  -- Stakes and Currency
//  -- Time
//  -- Player(s)
//  -- Table Cards
//  -- Action 
//  -- Betting Round
//  -- Player Cards?
// It should be a table taking up about a quarter of the screen on the RHS.

// Useful examples: 12, 594, 1354

// DATA SUMMARIZED HERE: Player (paResult.name), round (paResult.betting_round), action (paResult.action_type), 
//                       betting amount (paResult.amount), table cards.

interface HandDetailsProps {
    name: number; // Used to index in the replay.
    row: Array<string>;
    onClick: Function;
}

export default function HandDetails(props: HandDetailsProps) {
    return (
        <div dir="ltr" style={{width:"7cm", margin:"auto"}} className="bg-[#2C2C2C] flex flex-col border border-[#879195] text-white text-sm rounded-md shadow-md 
                                px-12 py-4 transition ease-in-out delay-150 hover:-translate-y-1 hover:scale-105 duration-300"
             onClick={(e) => {props.onClick(props.name)}}> {/* the onClick here passes this object's name upwards to change displayedAction. */}
            <div className="flex flex-row">
                <h1 className="pe-2">{props.row && props.row[0]}</h1>
            </div>

            <div className="flex flex-row">
                <h1 className="pe-2">{props.row && props.row[1]}</h1>
                <h1 className="pe-2">{props.row && props.row[4]}</h1>
                <h1 className="pe-2">{props.row && props.row[5]}</h1>
                <h1 className="pe-2">{props.row && props.row[6]}</h1>
                <h1 className="pe-2">{props.row && props.row[7]}</h1>
                <h1 className="pe-2">{props.row && props.row[8]}</h1>
            </div>
            
            <div className="flex flex-row">
                <h1 className="pe-2">{props.row && props.row[2]}</h1>
                <h1 className="pe-2">{props.row && props.row[3]}</h1>
            </div>
        </div>
    )
}
