import { useState, useEffect } from 'react';
import socket, { connectUser, joinRoom, secretKey } from '../socket';
import OnlineUsers from './OnlineUsers';
import ChatRoom from './ChatRoom';

export default function ChatApp() {
  const [username, setUsername] = useState('');
  const [joined, setJoined] = useState(false);
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [peerKeys, setPeerKeys] = useState({});
  const [roomId] = useState('general');

  useEffect(() => {
    socket.on('user:online', (users) => {
      setOnlineUsers(users);
      const keys = {};
      users.forEach((u) => (keys[u.username] = u.publicKey));
      setPeerKeys(keys);
    });
    return () => socket.off('user:online');
  }, []);

  function handleJoin() {
    if (!username.trim()) return;
    connectUser(username);
    joinRoom(roomId);
    setJoined(true);
  }

  if (!joined) {
  return (
    <div className="login-screen">
      <div className="login-card">
        <div className="login-logo">💬</div>
        <h1>ChatWave</h1>
        <p className="login-subtitle">Real-time. Encrypted. Simple.</p>
        <input
          placeholder="Enter your username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleJoin()}
          autoFocus
        />
        <button onClick={handleJoin}>Join Chat</button>
      </div>
    </div>
  );
}
}