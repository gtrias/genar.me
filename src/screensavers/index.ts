import type { SaverName } from '../config/screensavers';
import clock from './clock';
import fire from './fire';
import life from './life';
import logo from './logo';
import marquee from './marquee';
import matrix from './matrix';
import maze from './maze';
import mystify from './mystify';
import pipes from './pipes';
import pong from './pong';
import scope from './scope';
import snake from './snake';
import starfield from './starfield';
import type { SaverFactory, SaverGrid, SaverInstance } from './types';

const FACTORIES: Record<SaverName, SaverFactory> = {
  starfield, logo, scope, matrix, pipes, maze, life, clock, fire, snake, pong, mystify, marquee,
};

export const createSaver = (name: SaverName, grid: SaverGrid): SaverInstance => FACTORIES[name](grid);
