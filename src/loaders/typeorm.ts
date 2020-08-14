import { createConnection, getConnectionOptions } from 'typeorm';
import Logger from './logger';
import config from '../config';

const typeormLoader = async () => {
  try {
    const connectionOptions = await getConnectionOptions();
    return await createConnection({
      ...connectionOptions,
      type: 'postgres',
      host: config.typeORM.host,
      port: config.typeORM.port,
      username: config.typeORM.user,
      password: config.typeORM.passsword,
      database: config.typeORM.dbName
    });
  } catch (error) {
    Logger.error('🔥 Error in typeORM loader: %o', error);
    throw error;
  }
};

export default typeormLoader;
