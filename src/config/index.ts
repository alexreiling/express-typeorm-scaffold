import dotenv from 'dotenv';
// Set the NODE_ENV to 'development' by default
process.env.NODE_ENV = process.env.NODE_ENV || 'development';

const envFound = dotenv.config();
if (envFound.error) {
  // This error should crash whole process

  throw new Error("⚠️  Couldn't find .env file  ⚠️");
}
const config = {
  /**
   * Your favorite port
   */
  port: parseInt(process.env.PORT!, 10),

  mongoURI: process.env.MONGODB_URI,

  typeORM: {
    host: process.env.TYPEORM_HOST,
    port: process.env.TYPEORM_PORT,
    user: process.env.TYPEORM_USER,
    passsword: process.env.TYPEORM_PW,
    dbName: process.env.TYPEORM_DB_NAME
  },

  accessTokenSecret: process.env.ACCESS_TOKEN_SECRET,
  refreshTokenSecret: process.env.REFRESH_TOKEN_SECRET,

  /**
   * Used by winston logger
   */
  // TODO: add type safety and checks
  logs: {
    level: process.env.LOG_LEVEL || 'silly'
  },

  /**
   * Agenda.js stuff
   */
  agenda: {
    dbCollection: process.env.AGENDA_DB_COLLECTION,
    pooltime: process.env.AGENDA_POOL_TIME,
    concurrency: parseInt(process.env.AGENDA_CONCURRENCY!, 10)
  },

  /**
   * Agendash config
   */
  agendash: {
    user: 'agendash',
    password: '123456',
    test: undefined
  },
  /**
   * API configs
   */
  api: {
    prefix: '/api'
  }
  // /**
  //  * Mailgun email credentials
  //  */
  // emails: {
  //   apiKey: process.env.MAILGUN_API_KEY,
  //   domain: process.env.MAILGUN_DOMAIN,
  // },
};
function validateConfig<T extends { [key: string]: any }>(c: T, parents: string[] = []): T {
  Object.keys(c).forEach(key => {
    const value = c[key];
    if (!value) throw new Error('missing config parameter: ' + [...parents, key].join('.'));
    else if (typeof value === 'object') {
      const passParents = [...parents, key];
      validateConfig(value, passParents);
    }
  });
  return c;
}
export default validateConfig(config);
