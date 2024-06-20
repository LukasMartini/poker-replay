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
    echo "Loading data..."
    cd $POKER_REPLAY_ROOT/backend
    python load_data.py "$1"
    echo "Data loaded successfully."
}

# Function to reset database
reset_database() {
    drop_tables
    create_tables
    load_data "$1"
}