PREPARE createUser(text, text, text, text, timestamp, text) AS 
  INSERT INTO users(username, email, password_hash, created_at, token, expiry_date, salt) VALUES($1, $2, $3, NOW(), $4, $5, $6);

PREPARE login(text) AS
  SELECT salt, password_hash, token, username, email, expiry_date > NOW() FROM users 
    WHERE email = $1 OR username = $1;

PREPARE renewToken(text, text, timestamp) AS 
  UPDATE users 
  SET token = $2, expiry_date = $3
  WHERE email = $1 OR username = $1;

PREPARE authorize(text) AS 
  SELECT id FROM users 
    WHERE token = $1 AND expiry_date > NOW();

CREATE INDEX users_token_index ON users(token);
CREATE INDEX users_email_index ON users(email);
CREATE INDEX users_username_index ON users(user);