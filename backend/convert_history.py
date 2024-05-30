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
        lines = hand.split('\n')
        
        for i, line in enumerate(lines):
            print(i, line)
        
        hand_num = int(re.search(r'Hand #(\d+)', lines[0]).group(1))
        pokerstars_id = int(re.search(r'PokerStars Hand #(\d+):', lines[2]).group(1))
        print(lines[2])
        stakes, datetime_str = re.search(r" Hold'em No Limit \((.*)\) - (.*)", lines[2]).groups()
        # datetime_obj = datetime.strptime(datetime_str, '%Y/%m/%d %H:%M:%S ET')
        # table_name = re.search(r"Table '(.+)'", lines[1]).group(1)
        # button_seat = int(re.search(r'Seat #(\d+) is the button', lines[2]).group(1))
        
        print(pokerstars_id, datetime_str, stakes) # datetime_obj, table_name, button_seat)
        


parse_hand_history("handHistory-126997.txt")

# Close the connection
cur.close()
conn.close()
