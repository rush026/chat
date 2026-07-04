import { useState, useRef } from 'react';
import { sendMessage, notifyTyping, notifyStopTyping } from '../socket';

export default function MessageInput({ roomId, username, peerPublicKeys }) {
  const [text, setText] = useState('');
  const typingTimeout = useRef(null);

  function handleChange(e) {
    setText(e.target.value);
    notifyTyping();
    clearTimeout(typingTimeout.current);
    typingTimeout.current = setTimeout(() => notifyStopTyping(), 2000);
  }

  function handleSend() {
    if (!text.trim()) return;
    sendMessage(text, username, peerPublicKeys);
    setText('');
    notifyStopTyping();
  }

  return (
    <div className="message-input">
      <input
        value={text}
        onChange={handleChange}
        onKeyDown={(e) => e.key === 'Enter' && handleSend()}
        placeholder="Type a message..."
      />
      <button onClick={handleSend}>Send</button>
    </div>
  );
}