import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { MultiplayerGateway } from 'src/multiplayer/bomberman/multiplayer.gateway';
import { ScoreModule } from 'src/score/score.module';

@Module({
  imports: [ConfigModule.forRoot(), ScoreModule],
  controllers: [AppController],
  providers: [AppService, MultiplayerGateway],
})
export class AppModule {}
