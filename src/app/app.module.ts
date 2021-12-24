import { Module } from '@nestjs/common';
import { Server } from 'socket.io';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { addListeners } from './app.listeners';

export const io = new Server(1338, {
  cors: {
    origin: 'http://localhost:3000',
    methods: ['GET', 'POST'],
  },
});


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
      addListeners(io, socket)
    });
  }
}
