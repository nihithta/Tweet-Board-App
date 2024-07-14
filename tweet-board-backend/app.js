const {open} = require('sqlite')
const sqlite3 = require('sqlite3')
const express = require('express')
const path = require('path')
const jwt = require('jsonwebtoken')
const bcrypt = require('bcrypt')

const app = express()
app.use(express.json())

const dbPath = path.join(__dirname, 'twitterClone.db')
let db = null

const initializeDBAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    })
    await db.exec(`
        CREATE TABLE IF NOT EXISTS user (
          user_id INTEGER PRIMARY KEY AUTOINCREMENT,
          username TEXT NOT NULL UNIQUE,
          password TEXT NOT NULL,
          name TEXT NOT NULL,
          gender TEXT NOT NULL
        );
  
        CREATE TABLE IF NOT EXISTS tweet (
          tweet_id INTEGER PRIMARY KEY AUTOINCREMENT,
          tweet TEXT NOT NULL,
          user_id INTEGER NOT NULL,
          date_time TEXT NOT NULL,
          FOREIGN KEY (user_id) REFERENCES user(user_id)
        );
  
        CREATE TABLE IF NOT EXISTS follower (
          follower_id INTEGER PRIMARY KEY AUTOINCREMENT,
          follower_user_id INTEGER NOT NULL,
          following_user_id INTEGER NOT NULL,
          FOREIGN KEY (follower_user_id) REFERENCES user(user_id),
          FOREIGN KEY (following_user_id) REFERENCES user(user_id)
        );

      `);
    console.log('Database tables created successfully');

    app.listen(3000, () => {
      console.log('Server running successfully at http://localhost:3000/')
    })
  } catch (e) {
    console.log(`Error Message: ${e.message}`)
    process.exit(1)
  }
}

initializeDBAndServer()

// API 1: Register
app.post('/register/', async (request, response) => {
  const {username, password, name, gender} = request.body
  const userQuery = `SELECT * FROM user WHERE username = '${username}'`
  const dbUser = await db.get(userQuery)

  if (dbUser !== undefined) {
    response.status(400).send('User already exists')
  } else {
    if (password.length < 6) {
      response.status(400).send('Password is too short')
    } else {
      const hashedPass = await bcrypt.hash(password, 10)
      const createUserQuery = `
        INSERT INTO user (username, password, name, gender)
        VALUES ('${username}', '${hashedPass}', '${name}', '${gender}')
      `
      await db.run(createUserQuery)
      response.send('User created successfully')
    }
  }
})

// API 2: Login
app.post('/login/', async (request, response) => {
  const {username, password} = request.body
  const userQuery = 'SELECT * FROM user WHERE username = ?'
  const dbUser = await db.get(userQuery, [username])

  if (dbUser === undefined) {
    response.status(400).send('Invalid user')
  } else {
    const passwordMatch = await bcrypt.compare(password, dbUser.password)
    if (passwordMatch === true) {
      const payload = {username: username}
      const jwtToken = jwt.sign(payload, 'MY_SECRET_TOKEN')
      response.send({jwtToken})
    } else {
      response.status(400).send('Invalid password')
    }
  }
})

// JWT Authentication Middleware
const authenticateToken = (request, response, next) => {
  let jwtToken
  const authHeader = request.headers['authorization']

  if (authHeader !== undefined) {
    jwtToken = authHeader.split(' ')[1]
  }

  if (jwtToken === undefined) {
    response.status(401).send('Invalid JWT Token')
  } else {
    jwt.verify(jwtToken, 'MY_SECRET_TOKEN', async (error, payload) => {
      if (error) {
        response.status(401).send('Invalid JWT Token')
      } else {
        request.user = payload
        next()
      }
    })
  }
}

// API 3
app.get('/user/tweets/feed/', authenticateToken, async (request, response) => {
  const {username} = request.user
  const getUserIdQuery = `SELECT user_id FROM user WHERE username = '${username}'`
  const user = await db.get(getUserIdQuery)

  if (!user) {
    response.status(404).send('User not found')
    return
  }
  const getTweetsQuery = `
    SELECT 
      user.username,
      tweet.tweet,
      tweet.date_time AS dateTime
    FROM 
      follower 
      INNER JOIN tweet ON follower.following_user_id = tweet.user_id
      INNER JOIN user ON tweet.user_id = user.user_id
    WHERE 
      follower.follower_user_id = ${user.user_id}
    ORDER BY 
      tweet.date_time DESC
    LIMIT 4;
  `

  try {
    const tweetsFeed = await db.all(getTweetsQuery)
    response.send(tweetsFeed)
  } catch (error) {
    console.error('Error fetching tweets:', error.message)
    response.status(500).send('Internal Server Error')
  }
})

//api 4
app.get('/user/following/', authenticateToken, async (request, response) => {
  const {username} = request.user
  const getUserIdQuery = `SELECT user_id FROM user WHERE username = '${username}'`
  const user = await db.get(getUserIdQuery)

  const getFollowingQuery = `
    SELECT 
      user.name
    FROM 
      follower 
      INNER JOIN user ON follower.following_user_id = user.user_id
    WHERE 
      follower.follower_user_id = ${user.user_id};
  `

  const followingList = await db.all(getFollowingQuery)

  response.send(followingList)
})

//api 5
app.get('/user/followers/', authenticateToken, async (request, response) => {
  const {username} = request.user
  const getUserIdQuery = `SELECT user_id FROM user WHERE username = '${username}'`
  const user = await db.get(getUserIdQuery)

  const getFollowersQuery = `
    SELECT 
      user.name
    FROM 
      follower 
      INNER JOIN user ON follower.follower_user_id = user.user_id
    WHERE 
      follower.following_user_id = ${user.user_id};
  `

  const followersList = await db.all(getFollowersQuery)

  response.send(followersList)
})

//api 6
app.get('/tweets/:tweetId/', authenticateToken, async (request, response) => {
  const {tweetId} = request.params
  const {username} = request.user
  const getUserIdQuery = `SELECT user_id FROM user WHERE username = '${username}'`
  const user = await db.get(getUserIdQuery)
  const getTweetAuthorIdQuery = `SELECT user_id FROM tweet WHERE tweet_id = ${tweetId}`
  const tweetAuthor = await db.get(getTweetAuthorIdQuery)
  if (!tweetAuthor) {
    response.status(401)
    response.send('Invalid Request')
    return
  }

  const followingQuery = `SELECT * FROM follower WHERE follower_user_id = ${user.user_id} AND following_user_id = ${tweetAuthor.user_id}`
  const followingVerify = await db.get(followingQuery)
  if (!followingVerify) {
    response.status(401)
    response.send('Invalid Request')
  } else {
    const getTweetDetailsQuery = `
      SELECT 
        tweet.tweet,
        (SELECT COUNT(*) FROM like WHERE tweet_id = ${tweetId}) AS likes,
        (SELECT COUNT(*) FROM reply WHERE tweet_id = ${tweetId}) AS replies,
        tweet.date_time AS dateTime
      FROM 
        tweet
      WHERE 
        tweet_id = ${tweetId};
    `
    const tweetDetails = await db.get(getTweetDetailsQuery)
    response.send(tweetDetails)
  }
})

//api 7
app.get(
  '/tweets/:tweetId/likes/',
  authenticateToken,
  async (request, response) => {
    const {tweetId} = request.params
    const {username} = request.user
    const getUserIdQuery = `SELECT user_id FROM user WHERE username = '${username}'`
    const user = await db.get(getUserIdQuery)
    const getTweetAuthorIdQuery = `SELECT user_id FROM tweet WHERE tweet_id = ${tweetId}`
    const tweetAuthor = await db.get(getTweetAuthorIdQuery)
    if (!tweetAuthor) {
      response.status(401)
      response.send('Invalid Request')
      return
    }

    const followingQuery = `SELECT * FROM follower WHERE follower_user_id = ${user.user_id} AND following_user_id = ${tweetAuthor.user_id}`
    const followingVerify = await db.get(followingQuery)
    if (!followingVerify) {
      response.status(401)
      response.send('Invalid Request')
    } else {
      const getLikeDetailsQuery = `
      SELECT 
        username
      FROM 
        like
        INNER JOIN user ON like.user_id = user.user_id
      WHERE 
        tweet_id = ${tweetId};
    `
      const likeDetails = await db.all(getLikeDetailsQuery)
      const likes = likeDetails.map(like => like.username)
      response.send({likes})
    }
  },
)

//api 8
app.get(
  '/tweets/:tweetId/replies/',
  authenticateToken,
  async (request, response) => {
    const {tweetId} = request.params
    const {username} = request.user

    // Get the user ID of the authenticated user
    const getUserIdQuery = `SELECT user_id FROM user WHERE username = '${username}'`
    const user = await db.get(getUserIdQuery)

    // Get the user ID of the author of the tweet
    const getTweetAuthorIdQuery = `SELECT user_id FROM tweet WHERE tweet_id = ${tweetId}`
    const tweetAuthor = await db.get(getTweetAuthorIdQuery)

    if (!tweetAuthor) {
      response.status(401).send('Invalid Request')
      return
    }

    // Check if the authenticated user follows the author of the tweet
    const followingQuery = `SELECT * FROM follower WHERE follower_user_id = ${user.user_id} AND following_user_id = ${tweetAuthor.user_id}`
    const followingVerify = await db.get(followingQuery)

    if (!followingVerify) {
      response.status(401).send('Invalid Request')
    } else {
      // Get the tweet details
      const getTweetQuery = `SELECT tweet FROM tweet WHERE tweet_id = ${tweetId}`
      const tweetDetails = await db.get(getTweetQuery)
      const getReplyDetailsQuery = `
        SELECT 
          user.name AS name,
          reply.reply
        FROM 
          reply
          INNER JOIN user ON reply.user_id = user.user_id
        WHERE 
          reply.tweet_id = ${tweetId};
      `
      const replyDetails = await db.all(getReplyDetailsQuery)

      const replies = replyDetails.map(reply => ({
        name: reply.name,
        reply: reply.reply,
      }))
      response.send({replies})
    }
  },
)

//api 9
app.get('/user/tweets/', authenticateToken, async (request, response) => {
  const {username} = request.user
  const getUserIdQuery = `SELECT user_id FROM user WHERE username = '${username}'`
  const user = await db.get(getUserIdQuery)

  if (user) {
    const getTweetDetailsQuery = `
      SELECT 
        tweet.tweet,
        (SELECT COUNT(*) FROM like WHERE like.tweet_id = tweet.tweet_id) AS likes,
        (SELECT COUNT(*) FROM reply WHERE reply.tweet_id = tweet.tweet_id) AS replies,
        tweet.date_time AS dateTime
      FROM 
        tweet
      WHERE 
        tweet.user_id = ${user.user_id};
    `
    const tweetsList = await db.all(getTweetDetailsQuery)
    response.send(tweetsList)
  } else {
    response.status(404).send('User not found')
  }
})

//api 10
app.post('/user/tweets/', authenticateToken, async (request, response) => {
  const {username} = request.user
  const {tweet} = request.body
  const getUserIdQuery = `SELECT user_id FROM user WHERE username = '${username}'`
  const user = await db.get(getUserIdQuery)

  if (user) {
    const createTweetQuery = `
      INSERT INTO tweet (tweet, user_id, date_time)
      VALUES ('${tweet}', ${user.user_id}, '${new Date().toISOString()}');
    `
    await db.run(createTweetQuery)
    response.send('Created a Tweet')
  } else {
    response.status(404).send('User not found')
  }
})

//api 11
app.delete(
  '/tweets/:tweetId/',
  authenticateToken,
  async (request, response) => {
    const {username} = request.user
    const {tweetId} = request.params
    const getUserIdQuery = `SELECT user_id FROM user WHERE username = '${username}'`
    const user = await db.get(getUserIdQuery)
    if (!user) {
      response.status(401).send('Invalid Request')
      return
    }

    const getTweetQuery = `SELECT user_id FROM tweet WHERE tweet_id = ${tweetId}`
    const tweet = await db.get(getTweetQuery)
    if (!tweet) {
      response.status(404).send('Tweet not found')
      return
    }
    if (tweet.user_id !== user.user_id) {
      response.status(401).send('Invalid Request')
      return
    }
    const deleteTweetQuery = `DELETE FROM tweet WHERE tweet_id = ${tweetId}`
    await db.run(deleteTweetQuery)
    response.send('Tweet Removed')
  },
)

module.exports = app
