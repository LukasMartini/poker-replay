// Table replay display. Interface to move between parts is in wrapper.
// Display active player on the bottom. Other players listed in position order.
'use client';
/* 
    Display:
        - All information in summary
        - Link to player profiles (for each player)
        - Stack sizes (for each player)
        - Player cards (for each player)
        - Player positions (for each player)
        - Big blind, small blind (non-player-specific)
        - Total pot (non-player-specific)
        - Rake (non-player-specific)
*/


interface ReplayProps {
    // The entire set of query results is sent to Replay through these.
    othiResult: any;
    paResult: any;
    pcResult: any;
    action: number; // An index pointing to exactly which action row is applicable.
}

export default function Replay(props: ReplayProps) {

    if (props.action < 0) {
        // Bad code design? yes. I don't care.
        return <div style={{height:"70vh"}}></div>;
    } else {
        // Find non-player-specific data
        let flop_card1 = props.othiResult[0].flop_card1;
        let flop_card2 = props.othiResult[0].flop_card2;
        let flop_card3 = props.othiResult[0].flop_card3;
        let turn_card = props.othiResult[0].turn_card;
        let river_card = props.othiResult[0].river_card;
        let betting_round = props.paResult[props.action].betting_round;
        let small_blind = props.othiResult[0].small_blind;
        let big_blind = props.othiResult[0].big_blind;
        let total_pot = props.othiResult[0].total_pot;
        let rake = props.othiResult[0].rake;

        // Find data specific to the acting player
        let action_type = props.paResult[props.action].action_type;
        let amount = props.paResult[props.action].amount;

        // Find data for each player
        let playerData: Array<any> = [];
        for (let p = 0; p < props.pcResult.length; p++) {
            // These are declared here to prevent nulls from being overwritten by previous player values.
            let player_name = props.pcResult[p].name;
            let hole_card1 = props.pcResult[p].hole_card1;
            let hole_card2 = props.pcResult[p].hole_card2;
            let stack_size = props.pcResult[p].stack_size;
            let position = props.pcResult[p].position;
            let classnom = `row-start-${p}`
            playerData.push(
                <div className={"pe-8"}>
                    <div><h1>{player_name}</h1></div>
                    <div><h1>{hole_card1}</h1></div>
                    <div><h1>{hole_card2}</h1></div>
                    <div><h1>{stack_size}</h1></div>
                    <div><h1>{position}</h1></div>
                </div>
            );
        }

        // TODO: display current user's cards separately.

        return ( // TODO: remove overflow later, as this section should not scroll once it has been formatted correctly.
            <div style={{height:"70vh", overflow:"scroll"}}> 
                <h1>Action ID: {props.action == -1 ? '' : props.action}</h1>
                <h1>{flop_card1}</h1>
                <h1>{flop_card2}</h1>
                <h1>{flop_card3}</h1>
                <h1>{turn_card}</h1>
                <h1>{river_card}</h1>
                <h1>{betting_round}</h1>
                <h1>{small_blind}</h1>
                <h1>{big_blind}</h1>
                <h1>{total_pot}</h1>
                <h1>{rake}</h1>

                <h1>{action_type}</h1>
                <h1>{amount}</h1>

                <div className="flex flex-rows">{playerData}</div>
            </div>
        )
    }

}

