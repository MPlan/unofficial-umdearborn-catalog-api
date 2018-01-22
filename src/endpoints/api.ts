import * as express from 'express';
import { catalog } from './catalog';
export const api = express.Router();

api.use('/catalog', catalog);
