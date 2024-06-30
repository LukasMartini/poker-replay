PREPARE createUser AS (
  INSERT INTO users(username, email, password_hash, created_at, token, expiry_date) VALUES($1, $2, $3, $4, $5, $6)

)