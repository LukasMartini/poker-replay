CREATE TABLE PokerHands (
    HandID SERIAL PRIMARY KEY,
    PokerStarsHandID BIGINT,
    GameType VARCHAR(50),
    Stakes VARCHAR(20),
    DateTime TIMESTAMP,
    TableName VARCHAR(50),
    SeatNumber INT
);

CREATE TABLE Players (
    PlayerID SERIAL PRIMARY KEY,
    PlayerName VARCHAR(50) NOT NULL
);

CREATE TABLE PlayerActions (
    ActionID SERIAL PRIMARY KEY,
    PlayerID INT,
    HandID INT,
    SeatNumber INT,
    ActionType VARCHAR(50),
    Amount NUMERIC(10, 2),
    Card1 CHAR(2),
    Card2 CHAR(2),
    FOREIGN KEY (PlayerID) REFERENCES Players(PlayerID),
    FOREIGN KEY (HandID) REFERENCES PokerHands(HandID)
);

CREATE TABLE BoardCards (
    BoardID SERIAL PRIMARY KEY,
    HandID INT,
    FlopCard1 CHAR(2) NULL,
    FlopCard2 CHAR(2) NULL,
    FlopCard3 CHAR(2) NULL,
    TurnCard CHAR(2) NULL,
    RiverCard CHAR(2) NULL,
    FOREIGN KEY (HandID) REFERENCES PokerHands(HandID)
);

CREATE TABLE HandSummary (
    SummaryID SERIAL PRIMARY KEY,
    HandID INT,
    TotalPot NUMERIC(10, 2),
    Rake NUMERIC(10, 2),
    Board VARCHAR(20),
    WinnerID INT,
    WinningHand VARCHAR(50),
    FOREIGN KEY (HandID) REFERENCES PokerHands(HandID),
    FOREIGN KEY (WinnerID) REFERENCES Players(PlayerID)
);
