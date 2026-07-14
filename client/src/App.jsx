import ChatApp from './components/ChatApp';
import '../styles.css';

function App() {
  return <ChatApp />;
}

export default App;
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