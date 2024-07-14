import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import '../App.css';

const Following = () => {
  const [following, setFollowing] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchFollowing = async () => {
      try {
        const response = await axios.get('/user/following', {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        });
        setFollowing(response.data);
      } catch (error) {
        setError('Error fetching following');
      }
    };
    fetchFollowing();
  }, []);

  return (
    <div className="container">
      <div className="form-container">
        <h2>Following</h2>
        {error && <p className="message">{error}</p>}
        <ul>
          {following.map((followed, index) => (
            <li key={index}>
              {followed.name}
            </li>
          ))}
        </ul>
        <p>
          <Link to="/tweets/feed">Back to Feed</Link>
        </p>
      </div>
    </div>
  );
};

export default Following;
