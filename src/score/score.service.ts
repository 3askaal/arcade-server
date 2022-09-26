import { Injectable } from '@nestjs/common';
import { IScore, IScoreDoc } from './score';
import { ScoreModel } from './score.model';

@Injectable()
export class ScoreService {
  async getAll(): Promise<IScoreDoc[]> {
    const results: IScoreDoc[] = await ScoreModel.find();
    return results;
  }

  async getByGame(gameId: string): Promise<IScoreDoc[]> {
    const results: IScoreDoc[] = await ScoreModel.find({ gameId });
    return results;
  }

  async create(payload: IScore): Promise<IScoreDoc> {
    const score: IScoreDoc = await ScoreModel.create(payload);
    return score;
  }
}
