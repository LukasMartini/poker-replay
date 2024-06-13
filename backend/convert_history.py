import re
from datetime import datetime
from db_commands import execute_query

def parse_hand_history(file_path, user_id):
    '''Populates the database with the hand history from the given file path.'''
    with open(file_path, 'r') as file:
        content = file.read()
        
    hands = re.split(r'(?<=\n\n)(?=Hand\s*#\s*\d+: \n\n)', content)
    hands[0] = hands[0].replace('\nHand #', 'Hand #')
    
    poker_session = None
    session_id = None
    
    for hand in hands:
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
            
            query = """
            INSERT INTO poker_session 
            (user_id, tournament_id, table_name, game_type, small_blind, big_blind, currency, total_hands, max_players, start_time, end_time)
            VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
            """
            execute_query(query, (user_id, None, table_name, game_type, stakes.split('/')[0], stakes.split('/')[1], stakes.split(' ')[1], 0, table_size, datetime_obj, None)
            
            
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
