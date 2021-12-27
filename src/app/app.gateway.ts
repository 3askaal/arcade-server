import {
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { generateGrid, generatePlayers } from 'src/generate';

interface Rooms {
  [roomId: string]: {
    id: string;
    name: string;
    players: {
      socketId: string;
      name?: string;
    }[];
  };
}

const rooms: Rooms = {};

@WebSocketGateway({ cors: true })
export class GameGateway {
  @WebSocketServer() server: Server;

  handleConnection(client: Socket) {
    this.server.to(client.id).emit('rooms:update', rooms);
  }

  @SubscribeMessage('room:create')
  onRoomCreate(client: Socket, { name }) {
    console.log('event: room:create ', name);
    if (!rooms[client.id]) {
      rooms[client.id] = {
        id: client.id,
        name,
        players: [{ socketId: client.id }],
      };
    }

    client.data.roomId = client.id;

    console.log('send: rooms:update');
    this.server.emit('rooms:update', rooms);
  }

  @SubscribeMessage('room:join')
  onRoomJoin(client: Socket, { roomId: id }) {
    console.log('event: room:join ', id);

    // check if room exists
    if (!rooms[id]) {
      return;
    }

    // check if socket exists
    const socketExists = rooms[id]?.players.find(
      ({ socketId }) => socketId === client.id,
    );

    if (socketExists) {
      return;
    }

    // set roomId for new socket
    client.data.roomId = id;

    // add player to room's data
    rooms[id].players.push({ socketId: client.id });

    // join room
    client.join(id);

    // update room
    this.server.in(id).emit('room:update', rooms[id]);
    console.log('send: room:update', rooms[id]);
  }

  @SubscribeMessage('room:leave')
  onRoomLeave(client: Socket, {}) {
    console.log('event: room:leave ', client.id);
    const roomId = client.data.roomId;

    if (!rooms[roomId]) {
      return;
    }

    // remove player from room data
    rooms[roomId].players = rooms[roomId]?.players.filter(
      ({ socketId }) => socketId !== client.id,
    );

    if (!rooms[roomId]?.players?.length) {
      delete rooms[roomId];
      client.emit('rooms:update', rooms);
    }

    // leave room
    client.leave(client.data.roomId);

    // update room
    this.server.in(roomId).emit('room:update', rooms[roomId]);
    console.log('send: room:update', rooms[roomId]);
  }

  @SubscribeMessage('update:player')
  onUpdatePlayer(client: Socket, { name }) {
    const roomId = client.data.roomId;

    // update player name
    rooms[roomId].players = rooms[roomId]?.players?.map((player) =>
      player.socketId === client.id ? { ...player, name } : player,
    );

    // update room
    this.server.in(roomId).emit('room:update', rooms[roomId]);
  }

  @SubscribeMessage('start')
  onStartGame(client: Socket) {
    console.log('event: start');
    const roomId = client.data.roomId;

    const blocks = 16;

    // generate grid
    const grid = generateGrid(blocks);

    // format players data
    const players = generatePlayers(rooms[roomId]?.players, blocks);

    // set time
    const minutes = 3;
    const time = minutes * 60 * 1000;

    setTimeout(() => {
      this.server.in(roomId).emit('game:over', { reason: 'time' });
    }, time);

    // update room to start game
    this.server.in(roomId).emit('game:start', { grid, players, time });
    console.log('send: game:start', { grid, players, time });
  }

  @SubscribeMessage('move')
  onMove(client: Socket, payload: any) {
    console.log('event: game:move');
    this.server.in(client.data.roomId).emit('game:move', payload);
    console.log('send: game:move', payload);
  }

  @SubscribeMessage('bomb')
  onBomb(client: Socket, payload: any) {
    console.log('event: game:bomb');
    this.server.in(client.data.roomId).emit('game:bomb', payload);
    console.log('send: game:bomb', payload);
  }

  handleDisconnect(client: Socket) {
    console.log('disconnected: ', client.id);
    const roomId = client.data.roomId;

    if (rooms[roomId]) {
      rooms[roomId].players = rooms[roomId]?.players.filter(
        ({ socketId }) => socketId !== client.id,
      );
    }

    if (!rooms[roomId]?.players?.length) {
      delete rooms[roomId];
    }

    this.server.in(roomId).emit('room:update', rooms[roomId]);
  }
}
