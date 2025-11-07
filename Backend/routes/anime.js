import { Router } from 'express';
import requireAuth from '../middlewares/requireAuth.js';

const r = Router();

r.get('/', requireAuth, (_req, res) => {
  res.json({ data: ['One Piece', 'Attack on Titan', 'Naruto'] });
});

export default r;