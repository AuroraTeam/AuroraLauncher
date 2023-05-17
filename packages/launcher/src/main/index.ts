// Без этой либы почему-то в лаунчере сурсмапы не работают
import 'source-map-support/register';
import 'reflect-metadata';

import Container from 'typedi';

import { Launcher } from './core/Launcher';

Container.get(Launcher);
