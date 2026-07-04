const godb = require('../db/godb-client');

socket.on('user:connect', async({ username, publicKey }) => {
    await godb.set(`user:${username}`, { publicKey, socketId: socket.id, status: 'online' });
    const onlineUsers = await godb.scan('user:');
    io.emit('user:online', onlineUsers.filter(u => u.status === 'online'));
});

socket.on('message:send', async({ roomId, sender, encryptedMsg, iv }) => {
    const ts = Date.now();
    await godb.set(`room:${roomId}:msg:${ts}`, { sender, encryptedMsg, iv });
    io.to(roomId).emit('message:broadcast', { sender, encryptedMsg, iv, ts });
});

socket.on('disconnect', async() => {
    // find username by socketId, mark offline, update GOD-B, broadcast
});