import expressLoader from './express';
import dependencyInjectorLoader from './dependencyInjector';
import jobsLoader from './jobs';
import Logger from './logger';
//We have to import at least all the events once so they can be triggered
import './events';
import { Application } from 'express';
import typeormLoader from './typeorm';
import mongoDbLoader from './mongodb';

export default async ({ expressApp }: { expressApp: Application }) => {
  // set DB connections
  const [mongoDatabase, typeormConnection] = await Promise.all([
    mongoDbLoader().then(conn => {
      Logger.info('✌️ MongoDB loaded and connected!');
      return conn;
    }),
    typeormLoader().then(conn => {
      Logger.info('✌️ Typeorm DB loaded and connected!');
      return conn;
    })
  ]);

  // /**
  //  * WTF is going on here?
  //  *
  //  * We are injecting the mongoose models into the DI container.
  //  * I know this is controversial but will provide a lot of flexibility at the time
  //  * of writing unit tests, just go and check how beautiful they are!
  //  */

  // const userModel = {
  //   name: 'userModel',
  //   // Notice the require syntax and the '.default'
  //   model: require('../models/user').default,
  // };

  // It returns the agenda instance because it's needed in the subsequent loaders

  const { agenda } = await dependencyInjectorLoader({
    mongoDatabase,
    typeormConnection
  });
  Logger.info('✌️ Dependency Injector loaded');

  await jobsLoader({ agenda });
  Logger.info('✌️ Jobs loaded');

  await expressLoader({ app: expressApp });
  Logger.info('✌️ Express loaded');
};
