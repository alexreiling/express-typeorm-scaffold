import { MongoClient } from 'mongodb';
import config from '../config';

const mongoDbLoader = async () => {
  const client = new MongoClient(config.mongoURI!);
  await client.connect();
  return client.db();
};

export default mongoDbLoader;
