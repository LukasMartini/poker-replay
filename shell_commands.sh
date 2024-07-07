#!/bin/zsh

# Function to drop tables
drop_tables() {
    echo "Dropping tables..."
    psql -d cs348 -U admin -f $POKER_REPLAY_ROOT/backend/sql/drop_tables.sql
    echo "Tables dropped successfully."
}

# Function to create tables
create_tables() {
    echo "Creating tables..."
    psql -d cs348 -U admin -f $POKER_REPLAY_ROOT/backend/sql/create_tables.sql
    echo "Tables created successfully."
}

# Function to load data
load_data() {
    local file_path="$1"
    # Set default file path if not provided
    if [ -z "$file_path" ]; then
        file_path="../hand_histories/poker_stars/handHistory.txt"
    fi
    echo "Loading data from $file_path..."
    cd $POKER_REPLAY_ROOT/backend
    python load_data.py "$file_path"
    echo "Data loaded successfully."
}

# Function to reset database
reset_database() {
    drop_tables
    create_tables
    start_time=$(date +%s)
    load_data "$1"
    end_time=$(date +%s)
    duration=$((end_time - start_time))
    echo "Parsing completed in $duration seconds."
    return $duration
}