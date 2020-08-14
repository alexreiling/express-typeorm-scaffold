import dotenv from 'dotenv';
// Set the NODE_ENV to 'development' by default
process.env.NODE_ENV = process.env.NODE_ENV || 'development';

const envFound = dotenv.config();
if (envFound.error) {
  // This error should crash whole process

  throw new Error("⚠️  Couldn't find .env file  ⚠️");
}
const config = {
  port: parseInt(process.env.PORT || '3000', 10),

  api: {
    prefix: '/api'
  },

  mongoDB: {
    host: process.env.MONGODB_HOST || 'localhost',
    port: parseInt(process.env.MONGODB_PORT || '27017', 10),
    //user: process.env.MONGODB_USER,
    //password: process.env.MONGODB_PW,
    dbName: process.env.MONGODB_DB_NAME
  },

  typeORM: {
    host: process.env.TYPEORM_HOST || 'localhost',
    port: parseInt(process.env.TYPEORM_PORT || '5432', 10),
    user: process.env.TYPEORM_USER,
    passsword: process.env.TYPEORM_PW,
    dbName: process.env.TYPEORM_DB_NAME
  },

  accessTokenSecret: process.env.ACCESS_TOKEN_SECRET,
  refreshTokenSecret: process.env.REFRESH_TOKEN_SECRET,

  logs: {
    level: process.env.LOG_LEVEL || 'silly'
  },

  agenda: {
    dbCollection: process.env.AGENDA_DB_COLLECTION,
    // https://www.npmjs.com/package/agenda#processeveryinterval
    pooltime: process.env.AGENDA_POOL_TIME || '10 seconds',
    concurrency: parseInt(process.env.AGENDA_CONCURRENCY || '20', 10)
  },

  agendash: {
    user: process.env.AGENDASH_USER || 'admin',
    password: process.env.AGENDASH_PW || 'dim982e192310m239812m3'
  }
};
function validateConfig<T extends { [key: string]: any }>(c: T, parents: string[] = []): T {
  Object.keys(c).forEach(key => {
    const value = c[key];
    if (value === undefined) throw new Error('missing config parameter: ' + [...parents, key].join('.'));
    else if (typeof value === 'object') {
      const passParents = [...parents, key];
      validateConfig(value, passParents);
    }
  });
  return c;
}
export default validateConfig(config);
