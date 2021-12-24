import { generateGrid, generatePlayers } from '../generate';

interface Rooms {
  [roomId: string]: {
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
  const roomId = '';

  socket.on(
    'join',
    ({ roomId: newRoomId, roomName: newRoomName }: RoomPayload) => {
      console.log('join: ', socket.id);

      if (!rooms[newRoomId]) {
        rooms[newRoomId] = { players: [] };
      }

      const socketExists = rooms[newRoomId].players.find(
        ({ socketId }) => socketId === socket.id,
      );

      if (socketExists) {
        return;
      }

      rooms[newRoomId].players.push({ socketId: socket.id });
      rooms[newRoomId].name = newRoomName;

      socket.join(newRoomId);
      io.in(newRoomId).emit('room:update', rooms[newRoomId].players);
    },
  );

  socket.on('update:player', ({ name }: RoomPayload) => {
    console.log('update:player');
    console.log('roomId: ', roomId);

    rooms[roomId].players = rooms[roomId]?.players?.map((player) =>
      player.socketId === socket.id ? { ...player, name } : player,
    );

    io.in(roomId).emit('update:players', rooms[roomId]?.players);
  });

  socket.on('start', (payload: RoomPayload) => {
    console.log('start');
    const blocks = 16;
    const grid = generateGrid(blocks);
    const players = generatePlayers(rooms[roomId]?.players, blocks);
    console.log({ grid, players });
    io.in(roomId).emit('start', { grid, players });
  });

  socket.on('move', (payload: RoomPayload) => {
    console.log('##### move');
    socket.broadcast.to(roomId).emit('move', payload);
  });

  socket.on('bomb', (payload: RoomPayload) => {
    console.log('##### bomb');
    socket.broadcast.to(roomId).emit('bomb', payload);
  });

  socket.on('disconnect', (reason) => {
    console.log('amount players: ', rooms[roomId]?.players?.length);
    console.log('disconnect');

    if (rooms[roomId]) {
      rooms[roomId].players = rooms[roomId]?.players?.filter(
        ({ socketId }) => socket.id !== socketId,
      );
    }

    io.in(roomId).emit('update:players', rooms[roomId]?.players);
  });
}
