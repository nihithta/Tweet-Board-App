CREATE TABLE IF NOT EXISTS user (
  user_id INTEGER PRIMARY KEY AUTOINCREMENT,
  username TEXT UNIQUE NOT NULL,
  password TEXT NOT NULL,
  name TEXT NOT NULL,
  gender TEXT NOT NULL
);

-- Tweet Table
CREATE TABLE IF NOT EXISTS tweet (
  tweet_id INTEGER PRIMARY KEY AUTOINCREMENT,
  tweet TEXT NOT NULL,
  user_id INTEGER NOT NULL,
  date_time TEXT DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES user(user_id)
);

-- Follower Table
CREATE TABLE IF NOT EXISTS follower (
  follower_id INTEGER PRIMARY KEY AUTOINCREMENT,
  follower_user_id INTEGER NOT NULL,
  following_user_id INTEGER NOT NULL,
  FOREIGN KEY (follower_user_id) REFERENCES user(user_id),
  FOREIGN KEY (following_user_id) REFERENCES user(user_id),
  UNIQUE (follower_user_id, following_user_id)
);

-- Like Table
CREATE TABLE IF NOT EXISTS like (
  like_id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  tweet_id INTEGER NOT NULL,
  FOREIGN KEY (user_id) REFERENCES user(user_id),
  FOREIGN KEY (tweet_id) REFERENCES tweet(tweet_id),
  UNIQUE (user_id, tweet_id)
);

-- Reply Table
CREATE TABLE IF NOT EXISTS reply (
  reply_id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  tweet_id INTEGER NOT NULL,
  reply TEXT NOT NULL,
  date_time TEXT DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES user(user_id),
  FOREIGN KEY (tweet_id) REFERENCES tweet(tweet_id)
);