import { generateGrid, generatePlayers } from '../generate';

interface Rooms {
  [roomId: string]: {
    id?: string;
    players: {
      socketId: string;
      name?: string;
    }[];
    name?: string;
  };
}

const rooms: Rooms = {};

interface RoomPayload {
  roomId: string;
  roomName: string;
  [key: string]: any;
}

export function addListeners(io: any, socket: any) {
  let roomId = '';

  // send active rooms when client connects to socket
  io.to(socket.id).emit('rooms:update', rooms);
  console.log('send: rooms:update', rooms);

  socket.on('room:create', ({ name }) => {
    console.log('event: room:create');
    if (!rooms[socket.id]) {
      rooms[socket.id] = {
        id: socket.id,
        name,
        players: [{ socketId: socket.id }],
      };
    }

    roomId = socket.id;

    console.log('send: rooms:update');
    socket.emit('rooms:update', rooms);
  });

  socket.on('room:join', ({ roomId: id }: RoomPayload) => {
    console.log('event: room:join', id);

    // check if room exists
    if (!rooms[id]) {
      return;
    }

    // check if socket exists
    const socketExists = rooms[id]?.players.find(
      ({ socketId }) => socketId === socket.id,
    );

    if (socketExists) {
      return;
    }

    // set roomId for new socket
    roomId = id;

    // add player to room's data
    rooms[id].players.push({ socketId: socket.id });

    // join room
    socket.join(id);

    // update room
    io.in(id).emit('room:update', rooms[id]);
    console.log('send: room:update', rooms[id]);
  });

  socket.on('room:leave', ({}: RoomPayload) => {
    console.log('event: room:leave', roomId);
    // remove player from room data
    rooms[roomId].players = rooms[roomId]?.players.filter(
      ({ socketId }) => socketId !== socket.id,
    );

    if (!rooms[roomId]?.players?.length) {
      delete rooms[roomId];
      socket.emit('rooms:update', rooms);
    }

    // leave room
    socket.leave(roomId);

    // update room
    io.in(roomId).emit('room:update', rooms[roomId]);
    console.log('send: room:update', rooms[roomId]);
  });

  socket.on('update:player', ({ name }: RoomPayload) => {
    // update player name
    rooms[roomId].players = rooms[roomId]?.players?.map((player) =>
      player.socketId === socket.id ? { ...player, name } : player,
    );

    // update room
    io.in(roomId).emit('room:update', rooms[roomId]);
  });

  socket.on('start', () => {
    console.log('event: game:start', roomId);

    const blocks = 16;

    // generate grid
    const grid = generateGrid(blocks);

    // format players data
    const players = generatePlayers(rooms[roomId]?.players, blocks);

    // update room to start game
    io.in(roomId).emit('game:start', { grid, players });
  });

  socket.on('move', (payload: RoomPayload) => {
    socket.broadcast.to(roomId).emit('game:move', payload);
  });

  socket.on('bomb', (payload: RoomPayload) => {
    socket.broadcast.to(roomId).emit('game:bomb', payload);
  });

  socket.on('disconnect', (reason) => {
    console.log('event: disconnect', socket.id);

    if (rooms[roomId]) {
      rooms[roomId].players = rooms[roomId]?.players.filter(
        ({ socketId }) => socketId !== socket.id,
      );
    }

    io.in(roomId).emit('room:update', rooms[roomId]);
  });
}
