import { Container } from 'typedi';
import { Logger } from 'winston';
import { Handler } from 'express';
import {} from 'typeorm-typedi-extensions';
import { User } from '../../model/User';

const attachCurrentUser: Handler = async (req, res, next) => {
  const Logger = Container.get<Logger>('logger');
  try {
    // TODO: inject
    // TODO: remove password
    const user = await User.findOne(req.accessTokenPayload!.userId);
    if (!user) {
      return res.sendStatus(401);
    }
    const currentUser = user;
    Reflect.deleteProperty(currentUser, 'password');
    req.currentUser = currentUser;
    return next();
  } catch (e) {
    Logger.error('🔥 Error attaching user to req: %o', e);
    return next(e);
  }
};

export default attachCurrentUser;
