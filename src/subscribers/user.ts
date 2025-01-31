import { Container } from 'typedi';
import { EventSubscriber, On } from 'event-dispatch';
import events from './events';
import { User } from 'src/model/User';
import { Logger } from 'winston';

@EventSubscriber()
export default class UserSubscriber {
  /**
   * A great example of an event that you want to handle
   * save the last time a user signin, your boss will be pleased.
   *
   * Altough it works in this tiny toy API, please don't do this for a production product
   * just spamming insert/update to mongo will kill it eventualy
   *
   * Use another approach like emit events to a queue (rabbitmq/aws sqs),
   * then save the latest in Redis/Memcache or something similar
   */
  @On(events.user.login)
  public onUserLogin({ id }: Partial<User>) {
    const Logger = Container.get<Logger>('logger');
    Logger.debug('user logged in with id: ' + id);
    // try {
    //   const UserModel = Container.get('UserModel') as mongoose.Model<IUser & mongoose.Document>;

    //   UserModel.update({ _id }, { $set: { lastLogin: new Date() } });
    // } catch (e) {
    //   Logger.error(`🔥 Error on event ${events.user.signIn}: %o`, e);

    //   // Throw the error so the process die (check src/app.ts)
    //   throw e;
    // }
  }
  @On(events.user.register)
  public onUserSignUp(user: Partial<User>) {
    const Logger = Container.get<Logger>('logger');
    Logger.debug('new user registered ', JSON.stringify(user));
    try {
      /**
       * @TODO implement this
       */
      // Call the tracker tool so your investor knows that there is a new signup
      // and leave you alone for another hour.
      // TrackerService.track('user.signup', { email, _id })
      // Start your email sequence or whatever
      // MailService.startSequence('user.welcome', { email, name })
    } catch (e) {
      Logger.error(`🔥 Error on event ${events.user.register}: %o`, e);

      // Throw the error so the process dies (check src/app.ts)
      throw e;
    }
  }
}
