# Tweet Board

## Project Overview

The Tweet Board App is a microblogging and social interaction web application. It enables users to register, log in, post tweets, follow other users, and interact with tweets by liking or replying to them. This app can be integrated into various platforms such as educational forums, corporate communication tools, and community engagement sites, enhancing quick and effective communication. The Tweet Board App is built using React for the frontend and Express.js for the backend, with SQLite as the database. Security and authentication are handled using bcrypt and JWT, ensuring a secure user experience. The app's design focuses on user engagement and scalability, making it adaptable to different contexts and user bases.

P.S, the main focus of this project is the backend providing various APIs to navigate different function calls, hence a simple frontend code has been given. One can freely integrate the backend with numerous frontend layouts either using HTML, React, etc.

## Features

- User Registration and Authentication
- User Login
- View Tweets Feed
- View Following Users
- View Followers
- View Tweet Details
- Like Tweets
- Reply to Tweets
- Create and Delete Tweets

## Technologies Used

### Frontend
- React
- Axios for API requests
- React Router for navigation

### Backend
- Express.js
- SQLite for the database
- bcrypt for password hashing
- jsonwebtoken for JWT authentication

## Installation and Setup

### Prerequisites

- Node.js (v12 or higher)
- npm or yarn
- SQLite

### Backend Setup

1. **Clone the repository**:
   ```sh
   git clone <repository-url>
   cd <repository-directory>
   ```

2. **Install backend dependencies**:
   ```sh
   cd backend
   npm install
   ```

3. **Create and set up the database**:
   ```sh
   sqlite3 twitterClone.db < create_tables.sql
   ```

4. **Start the backend server**:
   ```sh
   npm start
   ```

### Frontend Setup

1. **Navigate to the frontend directory**:
   ```sh
   cd frontend
   ```

2. **Install frontend dependencies**:
   ```sh
   npm install
   ```

3. **Start the frontend development server**:
   ```sh
   npm start
   ```

## Database Schema

- **User Table**:
  - `user_id` (Primary Key)
  - `username`
  - `password`
  - `name`
  - `gender`

- **Tweet Table**:
  - `tweet_id` (Primary Key)
  - `tweet`
  - `user_id` (Foreign Key)
  - `date_time`

- **Follower Table**:
  - `follower_user_id` (Foreign Key)
  - `following_user_id` (Foreign Key)

- **Like Table**:
  - `like_id` (Primary Key)
  - `tweet_id` (Foreign Key)
  - `user_id` (Foreign Key)

- **Reply Table**:
  - `reply_id` (Primary Key)
  - `tweet_id` (Foreign Key)
  - `user_id` (Foreign Key)
  - `reply`

## API Endpoints

- **Register**: `POST /register`
- **Login**: `POST /login`
- **Get Tweets Feed**: `GET /user/tweets/feed`
- **Get Following Users**: `GET /user/following`
- **Get Followers**: `GET /user/followers`
- **Get Tweet Details**: `GET /tweets/:tweetId`
- **Get Likes for a Tweet**: `GET /tweets/:tweetId/likes`
- **Get Replies for a Tweet**: `GET /tweets/:tweetId/replies`
- **Get User Tweets**: `GET /user/tweets`
- **Create Tweet**: `POST /user/tweets`
- **Delete Tweet**: `DELETE /tweets/:tweetId`

## Usage

1. **Register a new user**: Navigate to `/register` and fill out the form.
2. **Log in**: Navigate to `/login` and enter your credentials.
3. **View Tweets Feed**: After logging in, navigate to `/tweets/feed`.
4. **View Following Users**: Navigate to `/user/following`.
5. **View Followers**: Navigate to `/user/followers`.
