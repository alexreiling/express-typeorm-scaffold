import Agenda from 'agenda';
import config from '../config';
import { Db } from 'mongodb';
import Logger from './logger';

export default ({ mongoDatabase }: { mongoDatabase: Db }) => {
  try {
    return new Agenda({
      mongo: mongoDatabase,
      db: { collection: config.agenda.dbCollection },
      processEvery: config.agenda.pooltime,
      maxConcurrency: config.agenda.concurrency
    });
  } catch (error) {
    Logger.error('🔥 Error in Agenda loader: %o', error);
    throw error;
  }

  /**
   * This voodoo magic is proper from agenda.js so I'm not gonna explain too much here.
   * https://github.com/agenda/agenda#mongomongoclientinstance
   */
};
