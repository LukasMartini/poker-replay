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

interface HandDetailsProps {
    rows: Array<any>;
}

export default function HandDetails(props: HandDetailsProps) {
    return (
        <div>
            <h1>HANDDETAILS</h1>
        </div>
    )
}
