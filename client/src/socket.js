import { io } from 'socket.io-client';
import { generateKeyPair, encryptMessage, decryptMessage } from './crypto';

const socket = io(
    import.meta.env.VITE_SERVER_URL || 'http://localhost:3000');
const { publicKey, secretKey } = generateKeyPair();
let currentRoomId = null;

export function connectUser(username) {
    socket.emit('user:connect', { username, publicKey });
}

export function joinRoom(roomId) {
    currentRoomId = roomId;
    socket.emit('room:join', roomId);
}

export function sendMessage(message, sender, peerPublicKeys) {
    const encryptions = {};

    Object.keys(peerPublicKeys).forEach((username) => {
        if (username === sender) return; // apne aap ko encrypt karne ki zarurat nahi
        const { encryptedMsg, nonce } = encryptMessage(message, peerPublicKeys[username], secretKey);
        encryptions[username] = { encryptedMsg, nonce };
    });

    socket.emit('message:send', {
        roomId: currentRoomId,
        sender,
        encryptions, // { "priya": {encryptedMsg, nonce}, "amit": {...} }
        plainPreview: message, // sender apna khud ka message turant dikha sake
    });
}

export function notifyTyping() {
    socket.emit('typing:start', { roomId: currentRoomId });
}

export function notifyStopTyping() {
    socket.emit('typing:stop', { roomId: currentRoomId });
}

export { secretKey, publicKey };
export default socket;