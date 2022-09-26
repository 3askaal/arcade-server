import { Schema, model } from 'mongoose';
import { IScoreDoc } from './score';

const ScoreSchema = new Schema({
  gameId: { type: String, required: true },
  name: { type: String, required: true },
  score: { type: String, required: true },
});

export const ScoreModel = model<IScoreDoc>('Score', ScoreSchema);
