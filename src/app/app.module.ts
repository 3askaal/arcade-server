import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { Server } from 'socket.io';

export const io = new Server(1338, {
  cors: {
    origin: 'http://localhost:3000',
    methods: ['GET', 'POST'],
  },
});

const roomData = {};

interface RoomPayload {
  roomId: string;
  [key: string]: any;
}

@Module({
  imports: [ConfigModule.forRoot()],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {
  constructor() {
    this.setup();
  }

  async setup(): Promise<void> {
    io.on('connection', (socket) => {
      console.log('socket connected!');

      socket.on('join', ({ roomId }: RoomPayload) => {
        if (!roomData[roomId]) {
          roomData[roomId] = { players: [] };
        }

        socket.data.id = roomData[roomId].players.length;

        // roomData[roomId].players.push({
        //   index: roomData[roomId].players.length,
        // });

        socket.join(`${roomId}`);
      });

      socket.on('update:players', ({ roomId, players }: RoomPayload) => {
        console.log('update:players', players);
        socket.broadcast.to(roomId).emit('update:players', players);
      });

      socket.on('start', ({ roomId, payload }: RoomPayload) => {
        console.log('##### start');
        socket.broadcast.to(roomId).emit('start', payload);
      });

      socket.on('move', ({ roomId, payload }: RoomPayload) => {
        console.log('##### move');
        socket.broadcast.to(roomId).emit('move', payload);
      });

      socket.on('bomb', ({ roomId, payload }: RoomPayload) => {
        console.log('##### bomb');
        socket.broadcast.to(roomId).emit('bomb', payload);
      });

      socket.on('disconnect', (reason) => {
        console.log('socket disconnected:', reason);
      });
    });
  }
}
