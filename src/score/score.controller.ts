import { Controller, Get, Body, Post, Param } from '@nestjs/common';
import { IScore, IScoreDoc } from './score';
import { ScoreService } from './score.service';

@Controller('score')
export class ScoreController {
  constructor(private readonly scoreService: ScoreService) {}

  @Get()
  async getAll(): Promise<IScore[]> {
    try {
      return this.scoreService.getAll();
    } catch (err) {
      throw err;
    }
  }

  @Get(':gameId')
  async getByGame(@Param() params): Promise<IScore[]> {
    const { gameId } = params;

    try {
      return this.scoreService.getByGame(gameId);
    } catch (err) {
      throw err;
    }
  }

  @Post()
  async create(@Body() payload: IScore): Promise<IScoreDoc> {
    try {
      return this.scoreService.create(payload);
    } catch (err) {
      throw err;
    }
  }
}
