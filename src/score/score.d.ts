import { Document } from 'mongoose';

export interface IScore {
  gameId: string;
  name: string;
  score: string;
}

export interface IScoreDoc extends IScore, Document {}
