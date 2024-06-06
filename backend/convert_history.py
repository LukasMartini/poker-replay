import re
from datetime import datetime
from server import get_db_connection

# Connect to the database
conn = get_db_connection()
cur = conn.cursor()

'''
Hand #1: 

PokerStars Hand #246222355402:  Hold'em No Limit ($0.01/$0.02 CAD) - 2023/09/27 22:56:41 ET
Table 'Alya III' 6-max Seat #1 is the button
Seat 1: HortonRoundtree ($1.86 in chips) 
Seat 2: fourz4444 ($1.91 in chips) 
Seat 3: CashMatteo ($2 in chips) 
Seat 5: ljab26 ($2.96 in chips) 
Seat 6: vegasricky ($1.56 in chips) 
fourz4444: posts small blind $0.01
CashMatteo: posts big blind $0.02
bouchizzle: sits out 
*** HOLE CARDS ***
Dealt to CashMatteo [8c 3d]
ljab26: raises $0.02 to $0.04
vegasricky: folds 
HortonRoundtree: folds 
fourz4444: calls $0.03
CashMatteo: folds 
'''

# Function to parse hand history
def parse_hand_history(file_path):
    with open(file_path, 'r') as file:
        content = file.read()
        
    hands = re.split(r'(?<=\n\n)(?=Hand\s*#\s*\d+: \n\n)', content)
    hands[0] = hands[0].replace('\nHand #', 'Hand #')
    
    for hand in hands:
        print("\n\n\n\n")
        
        lines = hand.split('\n')
        
        if "*** HOLE CARDS ***" not in lines:
            continue
        
        hand_num = int(re.search(r'Hand #(\d+)', lines[0]).group(1))
        pokerstars_id = int(re.search(r'PokerStars Hand #(\d+):', lines[2]).group(1))
        
        if "Tournament" in lines[2]:
            game_type = "Tournament"
            
            if "Freeroll" in lines[2]:
                tournament_id, level, datetime_str = re.search(
                    r"Tournament #(\d+), Freeroll\s+Hold'em No Limit - Level (.*?) - (.*)",
                    lines[2]
                    ).groups()
                buy_in = "$0.00+$0.00 NA"
            else:
                tournament_id, buy_in, level, datetime_str = re.search(
                    r"Tournament #(\d+), (\$\d+\.\d+\+\$\d+\.\d+ .*) Hold'em No Limit - Level (.*?) - (.*)", 
                    lines[2]
                    ).groups()
        else:
            game_type = "Cash"
            stakes, datetime_str = re.search(
                r"Hold'em No Limit \((.*)\) - (.*)", 
                lines[2]
                ).groups()
        
        datetime_obj = datetime.strptime(datetime_str, "%Y/%m/%d %H:%M:%S ET")
        table_name, table_size, button_seat = re.search(r"Table '(.+)' (\d+)-max Seat #(\d+) is the button", lines[3]).groups()
        total_pot, rake = re.search(r"Total pot \$?([\d.]+)(?:.*)\| Rake \$?([\d.]+)", lines[lines.index("*** SUMMARY ***") + 1]).groups()

        if game_type == "Cash":
            print(hand_num, pokerstars_id, game_type, stakes, datetime_obj, table_name, table_size, button_seat)
        else:
            print(hand_num, pokerstars_id, game_type, tournament_id, buy_in, level, datetime_obj, table_name, table_size, button_seat)
        
        print("-"*80)
        
        seat_pattern = re.compile(r"Seat (\d+): ([^:]+) \(\$?([\d.]+) in chips\)")
        blind_pattern = re.compile(r"([^:]+): posts (?:small blind|big blind) \$?([\d.]+)")
        for line in lines[4:]:
            if "*** HOLE CARDS ***" in line:
                break
            seat_match = seat_pattern.match(line)
            if seat_match:
                seat_num, player_name, stack = seat_match.groups()
                print(seat_num, player_name, stack)
                
            blind_match = blind_pattern.match(line)
            if blind_match:
                player_name, amount = blind_match.groups()
                print(player_name, amount)
        
        print("Preflop", "-"*20)
        
        raise_pattern = re.compile(r"([^:]+): raises \$?([\d.]+) to \$?([\d.]+)")
        action_pattern = re.compile(r"([^:]+): (calls|folds|checks|bets) \$?([\d.]+)?")
        for line in lines[lines.index("*** HOLE CARDS ***") + 1:]:
            if "*** FLOP ***" in line:
                break
            action_match = action_pattern.match(line)
            if action_match:
                player_name, action, amount = action_match.groups()
                print(player_name, action, amount)
        
        if not any("*** FLOP ***" in line for line in lines):
            continue
        print("Flop", "-"*20)
        
        flop_index = next(i for i, line in enumerate(lines) if "*** FLOP ***" in line)
        flop_cards = re.search(r"\*\*\* FLOP \*\*\* \[(\w{2}) (\w{2}) (\w{2})\]", lines[flop_index]).groups()
        print(flop_cards)
        
        for line in lines[flop_index + 1:]:
            if "*** TURN ***" in line:
                break
            action_match = action_pattern.match(line)
            if action_match:
                player_name, action, amount = action_match.groups()
                print(player_name, action, amount)
        
        if not any("*** TURN ***" in line for line in lines):
            continue
        print("Turn", "-"*20)
        
        turn_index = next(i for i, line in enumerate(lines) if "*** TURN ***" in line)
        turn_card = re.search(r"\*\*\* TURN \*\*\* \[\w{2} \w{2} \w{2}\] \[(\w{2})\]", lines[turn_index]).group(1)
        print(turn_card)
        
        for line in lines[turn_index + 1:]:
            if "*** RIVER ***" in line:
                break
            action_match = action_pattern.match(line)
            if action_match:
                player_name, action, amount = action_match.groups()
                print(player_name, action, amount)
        
        if not any("*** RIVER ***" in line for line in lines):
            continue
        print("River", "-"*20)
        
        river_index = next(i for i, line in enumerate(lines) if "*** RIVER ***" in line)
        river_card = re.search(r"\*\*\* RIVER \*\*\* \[\w{2} \w{2} \w{2} \w{2}\] \[(\w{2})\]", lines[river_index]).group(1)
        print(river_card)
        
        for line in lines[river_index + 1:]:
            if "*** SHOW DOWN ***" in line:
                break
            action_match = action_pattern.match(line)
            if action_match:
                player_name, action, amount = action_match.groups()
                print(player_name, action, amount)
        
        if not any("*** SHOW DOWN ***" in line for line in lines):
            continue
        print("Showdown", "-"*20)
        showdown_index = next(i for i, line in enumerate(lines) if "*** SHOW DOWN ***" in line)
        show_pattern = re.compile(r"([^:]+): shows \[(\w{2}) (\w{2})\] \(.+\)")
        collect_pattern = re.compile(r"([^:]+) collected \$?([\d.]+) from pot")
        for line in lines[showdown_index + 1:]:
            if "*** SUMMARY ***" in line:
                break
            show_match = show_pattern.match(line)
            if show_match:
                player_name, *hand = show_match.groups()
                print(player_name, hand)
                
            collect_match = collect_pattern.match(line)
            if collect_match:
                player_name, amount = collect_match.groups()
                print(player_name, amount)

parse_hand_history("hand_histories/poker_stars/handHistory-126997.txt")

cur.close()
conn.close()
