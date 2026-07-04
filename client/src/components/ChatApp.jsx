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
        <input
          placeholder="Enter username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleJoin()}
        />
        <button onClick={handleJoin}>Join Chat</button>
      </div>
    );
  }

  return (
    <div className="chat-app">
      <OnlineUsers users={onlineUsers} currentUser={username} />
      <ChatRoom
        roomId={roomId}
        username={username}
        secretKey={secretKey}
        peerPublicKeys={peerKeys}
      />
    </div>
  );
}