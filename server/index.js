const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const godb = require('./db/godb-client');

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
    cors: {
        origin: process.env.CLIENT_URL || 'http://localhost:5173',
        methods: ['GET', 'POST'],
    },
});

io.on('connection', (socket) => {
    console.log('New client connected:', socket.id);

    // user connect
    socket.on('user:connect', async({ username, publicKey }) => {
        socket.username = username;
        await godb.set(`user:${username}`, { publicKey, socketId: socket.id, status: 'online' });
        const onlineUsers = await godb.scan('user:');
        io.emit('user:online', onlineUsers.filter((u) => u.status === 'online'));
    });

    // room join + history
    socket.on('room:join', async(roomId) => {
        socket.join(roomId);
        const history = await godb.scan(`room:${roomId}:msg:`);
        socket.emit('room:history', history.sort((a, b) => a.ts - b.ts));
    });

    // message send + broadcast
    socket.on('message:send', async({ roomId, sender, encryptions, plainPreview }) => {
        const ts = Date.now();
        const msgData = { sender, encryptions, plainPreview, ts };
        await godb.set(`room:${roomId}:msg:${ts}`, msgData);
        io.to(roomId).emit('message:broadcast', msgData);
    });

    // typing indicators
    socket.on('typing:start', ({ roomId }) => {
        socket.to(roomId).emit('typing:update', { username: socket.username, isTyping: true });
    });

    socket.on('typing:stop', ({ roomId }) => {
        socket.to(roomId).emit('typing:update', { username: socket.username, isTyping: false });
    });

    // disconnect
    socket.on('disconnect', async() => {
        const username = socket.username;
        if (!username) return;
        await godb.set(`user:${username}`, { status: 'offline', lastSeen: Date.now() });
        const onlineUsers = await godb.scan('user:');
        io.emit('user:online', onlineUsers.filter((u) => u.status === 'online'));
    });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});