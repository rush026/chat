import { useState, useEffect, useRef } from 'react';
import socket from '../socket';
import { decryptMessage } from '../crypto';
import MessageInput from './MessageInput';
import TypingIndicator from './TypingIndicator';

export default function ChatRoom({ roomId, username, secretKey, peerPublicKeys }) {
  const [messages, setMessages] = useState([]);
  const [typingUsers, setTypingUsers] = useState([]);
  const bottomRef = useRef(null);

  function decryptIncoming(msg) {
  if (msg.sender === username) {
    return { ...msg, plainText: msg.plainPreview || '[sent]' };
  }

  const myEncryption = msg.encryptions?.[username];
  if (!myEncryption) return { ...msg, plainText: '[not for you]' };

  const senderPubKey = peerPublicKeys[msg.sender];
  if (!senderPubKey) return { ...msg, plainText: '[unknown sender]' };

  const plain = decryptMessage(myEncryption.encryptedMsg, myEncryption.nonce, senderPubKey, secretKey);
  return { ...msg, plainText: plain || '[decryption failed]' };
}

  useEffect(() => {
    socket.on('room:history', (history) => {
      setMessages(history.map(decryptIncoming));
    });

    socket.on('message:broadcast', (msg) => {
      console.log('Received:', msg);
      setMessages((prev) => [...prev, decryptIncoming(msg)]);
    });

    socket.on('typing:update', ({ username: who, isTyping }) => {
      setTypingUsers((prev) =>
        isTyping ? [...new Set([...prev, who])] : prev.filter((u) => u !== who)
      );
    });

    return () => {
      socket.off('room:history');
      socket.off('message:broadcast');
      socket.off('typing:update');
    };
  }, [peerPublicKeys, secretKey]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  return (
    <div className="chat-room">
      <div className="messages">
        {messages.map((m, i) => (
          <div key={i} className={m.sender === username ? 'msg mine' : 'msg'}>
            <strong>{m.sender}</strong>: {m.plainText}
          </div>
        ))}
        <div ref={bottomRef} />
      </div>

      <TypingIndicator typingUsers={typingUsers.filter((u) => u !== username)} />
      <MessageInput roomId={roomId} username={username} peerPublicKeys={peerPublicKeys} />
    </div>
  );
}