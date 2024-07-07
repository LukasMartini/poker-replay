import re
from datetime import datetime
from concurrent.futures import ThreadPoolExecutor

from db_commands import (
    create_action,
    create_board,
    create_hand,
    create_player,
    get_or_create_cash_session,
    get_or_create_tournament_session,
    link_player_to_user,
    update_player_cards
)

def parse_hand_history(content, user_id, upload_id):
    '''Populates the database with the hand history from the given file path. (PokerStars)'''
        
    hands = re.split(r'(?<=\n\n)(?=Hand\s*#\s*\d+: \n\n)', content)
    hands[0] = hands[0].replace('\nHand #', 'Hand #')
    
    with ThreadPoolExecutor() as executor:
        futures = [executor.submit(parse_hand, hand, user_id, upload_id) for hand in hands]
        for future in futures:
            future.result()

def parse_hand(hand, user_id, upload_id):
    lines = hand.split('\n')
    
    if "*** HOLE CARDS ***" not in lines:
        return
    
    hand_num = int(re.search(r'Hand #(\d+)', lines[0]).group(1))
    pokerstars_id = int(re.search(r'PokerStars Hand #(\d+):', lines[2]).group(1))
    
    if "Tournament" in lines[2]:
        game_type = "Tournament"
        
        if "Freeroll" in lines[2]:
            tournament_id, tournament_level, datetime_str = re.search(
                r"Tournament #(\d+), Freeroll\s+Hold'em No Limit - Level (.*?) - (.*)",
                lines[2]
                ).groups()
            stakes = "$0.00+$0.00 NA"
        else:
            tournament_id, stakes, tournament_level, datetime_str = re.search(
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
        small_blind, part = stakes.replace('$', '').split('/')
        big_blind, currency = part.split()
        
        session_id = get_or_create_cash_session(user_id, upload_id, table_name, game_type, currency, table_size, datetime_obj)
        hand_id = create_hand(session_id, pokerstars_id, small_blind, big_blind, total_pot, rake, datetime_obj)
    else:
        buy_in , part = stakes.replace('$', '').split('+')
        rake, currency = part.split()
        total_buy_in = float(buy_in) + float(rake)
        
        level, small_blind, big_blind = re.search(r"(\w+)\s*\((\d+)/(\d+)\)", tournament_level).groups()            
        session_id = get_or_create_tournament_session(user_id, upload_id, tournament_id, total_buy_in, table_name, game_type, currency, table_size, datetime_obj)
        hand_id = create_hand(session_id, pokerstars_id, small_blind, big_blind, total_pot, rake, datetime_obj)
    
    seat_pattern = re.compile(r"Seat (\d+): ([^:]+) \(\$?([\d.]+) in chips\)")
    blind_pattern = re.compile(r"([^:]+): posts (?:small blind|big blind) \$?([\d.]+)")
    
    for line in lines[4:]:
        if "*** HOLE CARDS ***" in line:
            break
        
        seat_match = seat_pattern.match(line)
        if seat_match:
            seat_num, player_name, stack = seat_match.groups()                
            create_player(hand_id, player_name, seat_num, stack)
            
        blind_match = blind_pattern.match(line)
        if blind_match:
            player_name, amount = blind_match.groups()
            create_action(hand_id, player_name, "Preflop", "ante", amount)
    
    dealt_to_pattern = re.compile(r"Dealt to ([^:]+) \[(\w{2}) (\w{2})\]")
    raise_pattern = re.compile(r"([^:]+): raises \$?([\d.]+) to \$?([\d.]+)")
    action_pattern = re.compile(r"([^:]+): (calls|folds|checks|bets) \$?([\d.]+)?")
    collect_pattern = re.compile(r"([^:]+) collected \$?([\d.]+) from pot")
    
    for line in lines[lines.index("*** HOLE CARDS ***") + 1:]:
        if "*** FLOP ***" in line or "*** SUMMARY ***" in line:
            break
        
        dealt_to_match = dealt_to_pattern.match(line)
        if dealt_to_match:
            player_name, card1, card2 = dealt_to_match.groups()
            update_player_cards(hand_id, player_name, (card1, card2))
            link_player_to_user(player_name, user_id)
        
        action_match = action_pattern.match(line)
        if action_match:
            player_name, action, amount = action_match.groups()
            create_action(hand_id, player_name, "Preflop", action, amount)
        
        raise_match = raise_pattern.match(line)
        if raise_match:
            player_name, inital_amount, total = raise_match.groups()
            amount_raised = float(total) - float(inital_amount)
            create_action(hand_id, player_name, "Preflop", "raise", amount_raised)
        
        collect_match = collect_pattern.match(line)
        if collect_match:
            player_name, amount = collect_match.groups()
            create_action(hand_id, player_name, "Preflop", "collect", amount)
    
    if not any("*** FLOP ***" in line for line in lines):
        create_board(hand_id)
        return
    
    flop_index = next(i for i, line in enumerate(lines) if "*** FLOP ***" in line)
    flop_cards = re.search(r"\*\*\* FLOP \*\*\* \[(\w{2}) (\w{2}) (\w{2})\]", lines[flop_index]).groups()
    
    for line in lines[flop_index + 1:]:
        if "*** TURN ***" in line or "*** SUMMARY ***" in line:
            break
        
        action_match = action_pattern.match(line)
        if action_match:
            player_name, action, amount = action_match.groups()
            create_action(hand_id, player_name, "Flop", action, amount)
        
        raise_match = raise_pattern.match(line)
        if raise_match:
            player_name, inital_amount, total = raise_match.groups()
            amount_raised = float(total) - float(inital_amount)
            create_action(hand_id, player_name, "Flop", "raise", amount_raised)
        
        collect_match = collect_pattern.match(line)
        if collect_match:
            player_name, amount = collect_match.groups()
            create_action(hand_id, player_name, "Flop", "collect", amount)
    
    if not any("*** TURN ***" in line for line in lines):
        create_board(hand_id, flop_cards)
        return
    
    turn_index = next(i for i, line in enumerate(lines) if "*** TURN ***" in line)
    turn_card = re.search(r"\*\*\* TURN \*\*\* \[\w{2} \w{2} \w{2}\] \[(\w{2})\]", lines[turn_index]).group(1)
    
    for line in lines[turn_index + 1:]:
        if "*** RIVER ***" in line or "*** SUMMARY ***" in line:
            break
        
        action_match = action_pattern.match(line)
        if action_match:
            player_name, action, amount = action_match.groups()
            create_action(hand_id, player_name, "Turn", action, amount)
        
        raise_match = raise_pattern.match(line)
        if raise_match:
            player_name, inital_amount, total = raise_match.groups()
            amount_raised = float(total) - float(inital_amount)
            create_action(hand_id, player_name, "Turn", "raise", amount_raised)
        
        collect_match = collect_pattern.match(line)
        if collect_match:
            player_name, amount = collect_match.groups()
            create_action(hand_id, player_name, "Turn", "collect", amount)
    
    if not any("*** RIVER ***" in line for line in lines):
        create_board(hand_id, flop_cards, turn_card)
        return
    
    river_index = next(i for i, line in enumerate(lines) if "*** RIVER ***" in line)
    river_card = re.search(r"\*\*\* RIVER \*\*\* \[\w{2} \w{2} \w{2} \w{2}\] \[(\w{2})\]", lines[river_index]).group(1)
    
    for line in lines[river_index + 1:]:
        if "*** SHOW DOWN ***" in line or "*** SUMMARY ***" in line:
            break
        
        action_match = action_pattern.match(line)
        if action_match:
            player_name, action, amount = action_match.groups()
            create_action(hand_id, player_name, "River", action, amount)
            
        raise_match = raise_pattern.match(line)
        if raise_match:
            player_name, inital_amount, total = raise_match.groups()
            amount_raised = float(total) - float(inital_amount)
            create_action(hand_id, player_name, "River", "raise", amount_raised)
            
        collect_match = collect_pattern.match(line)
        if collect_match:
            player_name, amount = collect_match.groups()
            create_action(hand_id, player_name, "River", "collect", amount)
    
    if not any("*** SHOW DOWN ***" in line for line in lines):
        create_board(hand_id, flop_cards, turn_card, river_card)
        return
    
    showdown_index = next(i for i, line in enumerate(lines) if "*** SHOW DOWN ***" in line)
    show_pattern = re.compile(r"([^:]+): shows \[(\w{2}) (\w{2})\] \(.+\)")
    
    for line in lines[showdown_index + 1:]:
        if "*** SUMMARY ***" in line:
            break
        
        show_match = show_pattern.match(line)
        if show_match:
            player_name, *hand = show_match.groups()
            update_player_cards(hand_id, player_name, hand)
            
        collect_match = collect_pattern.match(line)
        if collect_match:
            player_name, amount = collect_match.groups()
            create_action(hand_id, player_name, "Showdown", "collect", amount)
