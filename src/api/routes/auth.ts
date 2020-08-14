import { Router, Request, Response, NextFunction } from 'express';
import { Container } from 'typedi';
import AuthService, { Credentials } from '../../services/auth';
import middlewares from '../middlewares';
import { celebrate, Joi } from 'celebrate';
import { Logger } from 'winston';

const route = Router();

export default (app: Router) => {
  app.use('/auth', route);

  route.post(
    '/register',
    celebrate({
      body: Joi.object({
        email: Joi.string().required(),
        password: Joi.string().required(),
      }),
    }),
    async (req: Request, res: Response, next: NextFunction) => {
      const logger = Container.get<Logger>('logger');
      logger.debug('Calling Sign-Up endpoint with body: %o', req.body);
      try {
        const authServiceInstance = Container.get(AuthService);
        await authServiceInstance.Register(req.body as Credentials);
        return res.status(201).send();
      } catch (e) {
        logger.error('🔥 error: %o', e);
        return next(e);
      }
    },
  );

  route.post(
    '/login',
    celebrate({
      body: Joi.object({
        email: Joi.string().required(),
        password: Joi.string().required(),
      }),
    }),
    async (req: Request, res: Response, next: NextFunction) => {
      const logger = Container.get<Logger>('logger');
      logger.debug('Calling Sign-In endpoint with body: %o', req.body);
      try {
        const { email, password } = req.body;
        const authServiceInstance = Container.get(AuthService);
        const { user, accessToken, refreshToken } = await authServiceInstance.Login(email, password);
        sendRefreshToken(res, refreshToken);

        return res.json({ user, accessToken }).status(200);
      } catch (e) {
        logger.error('🔥 error: %o', e);
        return next(e);
      }
    },
  );

  /**
   * @TODO Let's leave this as a place holder for now
   * The reason for a logout route could be deleting a 'push notification token'
   * so the device stops receiving push notifications after logout.
   *
   * Another use case for advance/enterprise apps, you can store a record of the jwt token
   * emitted for the session and add it to a black list.
   * It's really annoying to develop that but if you had to, please use Redis as your data store
   */
  route.post('/logout', middlewares.isAuth, (req: Request, res: Response, next: NextFunction) => {
    const logger = Container.get<Logger>('logger');
    logger.debug('Calling Sign-Out endpoint with body: %o', req.body);
    try {
      //@TODO AuthService.Logout(req.user) do some clever stuff
      //AuthService.Logout(req.user!.id);
      return res.status(200).end();
    } catch (e) {
      logger.error('🔥 error %o', e);
      return next(e);
    }
  });
};

const sendRefreshToken = (res: Response, token: string) => {
  // TODO: modularize
  var date = new Date();
  date.setDate(date.getDate() + 7);
  res.cookie('jid', token, {
    httpOnly: true,
    expires: date,
    path: '/refresh_token',
  });
};
