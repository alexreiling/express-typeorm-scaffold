import { createConnection } from 'typeorm';

const typeormLoader = async () => {
  return createConnection();
};

export default typeormLoader;
