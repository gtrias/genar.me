import type { SaverName } from '../config/screensavers';
import logo from './logo';
import scope from './scope';
import starfield from './starfield';
import type { SaverFactory, SaverGrid, SaverInstance } from './types';

const FACTORIES: Record<SaverName, SaverFactory> = { starfield, logo, scope };

export const createSaver = (name: SaverName, grid: SaverGrid): SaverInstance => FACTORIES[name](grid);
