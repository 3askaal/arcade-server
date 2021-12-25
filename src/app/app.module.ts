import { Module } from '@nestjs/common';
import { Server } from 'socket.io';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { addListeners } from './app.listeners';
import { CONFIG } from 'src/config';

export const io = new Server({
  cors: {
    origin: ['http://localhost:3000', 'https://b0mberman.vercel.app/'],
    methods: ['GET', 'POST'],
  },
});

io.listen(CONFIG.SOCKET_PORT);

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
      addListeners(io, socket);
    });
  }
}
