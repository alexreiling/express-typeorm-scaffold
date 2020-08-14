import { MongoClient } from 'mongodb';
import config from '../config';
import Logger from './logger';

const mongoDbLoader = async () => {
  try {
    const {
      mongoDB: { host, port }
    } = config;
    const uri = `mongodb://${host}:${port}`;
    const client = new MongoClient(uri, { appname: process.env.npm_package_name });
    return await client.connect().then(client => client.db(config.mongoDB.dbName));
  } catch (error) {
    Logger.error('🔥 Error in MongoDB loader: %o', error);
    throw error;
  }
};

export default mongoDbLoader;
