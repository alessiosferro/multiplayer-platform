const socket = io();
const canvas = document.getElementById('canvas');
const context = canvas.getContext('2d');

const upButton = document.getElementById('up-button');
const leftButton = document.getElementById('left-button');
const rightButton = document.getElementById('right-button');
const downButton = document.getElementById('down-button');


class Game {
    constructor() {
        this.players = [];
    }

    run() {
        this.setup();
        this.loop();
    }

    setup() {
        const users = document.getElementById('players-count');

        socket.on('connect', () => {
            socket.on('players', (players) => {
                users.textContent = players.length;

                this.players = players.map(player => new Player({ ...player }));

                const currentPlayer = this.players.find(p => p.id === socket.id);

                if (!currentPlayer) return;

                upButton.addEventListener('click', () => currentPlayer.goUp());

                rightButton.addEventListener('click', () => currentPlayer.goRight());

                downButton.addEventListener('click', () => currentPlayer.goDown());

                leftButton.addEventListener('click', () => currentPlayer.goLeft());

                document.addEventListener('keydown', e => {
                    switch (e.key) {
                        case 'ArrowDown':
                            currentPlayer.goDown();
                            break;

                        case 'ArrowLeft':
                            currentPlayer.goLeft();
                            break;

                        case 'ArrowRight':
                            currentPlayer.goRight();
                            break;

                        case 'ArrowUp':
                            currentPlayer.goUp();
                            break;
                    }
                });
            });
        });
    }

    loop() {
        context.clearRect(0, 0, canvas.width, canvas.height);

        this.players.forEach(player => {
            player.draw();
        });

        requestAnimationFrame(() => this.loop());
    }
}

class Player {
    constructor(player) {
        const {x, y, id, color} = player;

        this.id = id;
        this.x = x;
        this.y = y;
        this.speed = 30;
        this.color = color;

        socket.on('playerChange', playerData => {
            if (playerData.id !== id) return;

            this.x = playerData.x;
            this.y = playerData.y;
        });


    }

    goUp() {
        const position = this.y - this.speed;

        this.emitPlayerMove({ y: position < 0 ? canvas.height - this.speed : position });
    }

    goDown() {
        const position = this.y + this.speed;

        this.emitPlayerMove({ y: position >= canvas.height ? 0 : position });
    }

    goRight() {
        const position = this.x + this.speed;

        this.emitPlayerMove({ x: position >= canvas.width ? 0 : position });
    }

    goLeft() {
        const position = this.x - this.speed;

        this.emitPlayerMove({ x: position < 0 ? canvas.width - this.speed : position });
    }

    emitPlayerMove({ x = this.x, y = this.y }) {
        socket.emit('playerMove', { id: this.id, x, y });
    }

    draw() {
        context.fillStyle = this.color;
        context.fillRect(this.x, this.y, 30, 30);
    }
}

const game = new Game();

game.run();
