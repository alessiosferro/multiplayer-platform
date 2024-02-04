const express = require('express');
const http = require('http');
const app = express();
const { Server } = require('socket.io');
const httpServer = http.createServer(app);
const io = new Server(httpServer);

app.use(express.static('./www'));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

let players = [];

const generateRandomColor = () => {
    const red = Math.round(Math.random() * 255);
    const green = Math.round(Math.random() * 255);
    const blue = Math.round(Math.random() * 255);

    return `rgb(${red}, ${green}, ${blue})`;
}

io.on('connection', (socket) => {
    const playerId = socket.id;

    players.push({
        id: playerId,
        x: 0,
        y: 0,
        color: generateRandomColor()
    });

    io.sockets.emit('players', players);

    socket.on('playerMove', (playerData) => {
        players = players.map(player => {
            if (player.id !== playerData.id) return player;

            return {...player, x: playerData.x, y: playerData. y};
        });

        io.sockets.emit('playerChange', playerData);
    })

    socket.on('disconnect', () => {
        players = players.filter(player => player.id !== playerId);

        io.sockets.emit('players', players);
    });
});

httpServer.listen(3000, () => console.log(`App listening on port 3000`));