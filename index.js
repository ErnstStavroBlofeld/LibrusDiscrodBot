import {config as configureEnvironment} from 'dotenv';
import LibrusBot from './src/LibrusBot';

configureEnvironment();

let librusBot = new LibrusBot();
librusBot.run();
