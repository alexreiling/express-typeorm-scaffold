import { Container } from 'typedi';
import LoggerInstance from './logger';
import agendaFactory from './agenda';
//import config from '../config';
//import mailgun from 'mailgun-js';
import { Db } from 'mongodb';
import { Connection } from 'typeorm';
import { User } from '../model/User';

//export default ({ mongoConnection, models }: { mongoConnection: Db; models: { name: string; model: any }[] }) => {
export default ({ mongoDatabase, typeormConnection }: { mongoDatabase: Db; typeormConnection: Connection }) => {
  try {
    // models.forEach(m => {
    //   Container.set(m.name, m.model);
    // });

    const agendaInstance = agendaFactory({ mongoDatabase });
    LoggerInstance.info('✌️ Agenda instance created');

    Container.set('agendaInstance', agendaInstance);
    Container.set('logger', LoggerInstance);
    Container.set('userRepo', typeormConnection.getRepository(User));
    //Container.set('emailClient', mailgun({ apiKey: config.emails.apiKey, domain: config.emails.domain }))

    LoggerInstance.info('✌️ Agenda injected into container');

    return { agenda: agendaInstance };
  } catch (e) {
    LoggerInstance.error('🔥 Error on dependency injector loader: %o', e);
    throw e;
  }
};
