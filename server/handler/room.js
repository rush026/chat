socket.on('room:join', async(roomId) => {
    socket.join(roomId);
    const history = await godb.scan(`room:${roomId}:msg:`);
    socket.emit('room:history', history.sort((a, b) => a.ts - b.ts));
});