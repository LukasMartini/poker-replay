// Table replay display. Interface to move between parts is in wrapper.
// Display active player on the bottom. Other players listed in order decided on page load?
'use client';

interface ReplayProps {
    row: Array<any>;
    test: number;
}

export default function Replay(props: ReplayProps) {
    return (
        <div>
            <h1>{props.test}</h1>
            <h1>HELLO</h1>
        </div>
    )
}

