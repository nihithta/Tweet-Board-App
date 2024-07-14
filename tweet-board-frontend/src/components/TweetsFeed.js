import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import '../App.css';

const TweetsFeed = () => {
  const [tweets, setTweets] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchTweets = async () => {
      try {
        const response = await axios.get('/user/tweets/feed', {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        });
        setTweets(response.data);
      } catch (error) {
        setError('Error fetching tweets');
      }
    };
    fetchTweets();
  }, []);

  return (
    <div className="container">
      <div className="form-container">
        <h2>Tweets Feed</h2>
        {error && <p className="message">{error}</p>}
        <ul>
          {tweets.map((tweet, index) => (
            <li key={index}>
              <strong>{tweet.username}</strong>: {tweet.tweet}
            </li>
          ))}
        </ul>
        <p>
          <Link to="/user/followers">Followers</Link> |{' '}
          <Link to="/user/following">Following</Link>
        </p>
      </div>
    </div>
  );
};

export default TweetsFeed;
