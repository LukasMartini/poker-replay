# Setup Instructions for the CS348 Database

This document outlines the steps required to create and configure the `cs348` database locally. These steps assume that PostgreSQL is installed on your machine.

## Prerequisites

- PostgreSQL installed on your local machine.
- Should be in the `backend` directory.

## Step 1: Log into PostgreSQL

Open your terminal and connect to the default PostgreSQL user (typically `postgres`). Run the following command:

```bash
psql postgres
```

## Step 2: Create the Database

Run the following command to create the `cs348` database:

```sql
CREATE DATABASE cs348;
```

## Step 3: Switch to the New Database

Once the database is created, connect to it using the following command:

```sql
\c cs348
```

## Step 4: Create a User

Create a new user called admin and set a password. This user will be used to manage the database:

```sql
CREATE USER admin WITH PASSWORD 'admin123';
```

## Step 5: Grant Privileges

Grant all privileges on the database to the admin user to allow full control over the database:

```sql
GRANT ALL PRIVILEGES ON DATABASE cs348 TO admin;
```

## Step 6: Exit psql

Exit the PostgreSQL command line interface:

```sql
\q
```

## Step 7: Verify the Database

You can verify that the database was created successfully by connecting to it using the `admin` user:

```bash
psql -d cs348 -U admin
```

## Step 8: Load the Schema

Run the following command to load the schema into the database:

```bash
psql -d cs348 -U admin -f sql/create_tables.sql
```
