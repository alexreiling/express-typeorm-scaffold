import bodyParser from 'body-parser';
import cors from 'cors';
import routes from '../api';
import config from '../config';
import { RequestHandler, Application, ErrorRequestHandler } from 'express';

export default ({ app }: { app: Application }) => {
  /**
   * Health Check endpoints
   * @TODO Explain why they are here
   */
  const statusHandler: RequestHandler = (_req, res) => {
    res.status(200).end();
  };
  app.get('/status', statusHandler);
  app.head('/status', statusHandler);

  // Useful if you're behind a reverse proxy (Heroku, Bluemix, AWS ELB, Nginx, etc)
  // It shows the real origin IP in the heroku or Cloudwatch logs
  app.enable('trust proxy');

  // The magic package that prevents frontend developers going nuts
  // Alternate description:
  // Enable Cross Origin Resource Sharing to all origins by default
  app.use(cors());
  // app.use(
  //   cors({
  //     origin: 'http://localhost:3000',
  //     credentials: true,
  //   })
  // );
  // Some sauce that always add since 2014
  // "Lets you use HTTP verbs such as PUT or DELETE in places where the client doesn't support it."
  // Maybe not needed anymore ?
  app.use(require('method-override')());

  // Middleware that transforms the raw string of req.body into json
  app.use(bodyParser.json());
  // Load API routes
  app.use(config.api.prefix, routes());

  /// catch 404 and forward to error handler
  app.use((_req, _res, next) => {
    const err = new Error('Not Found') as any;
    err['status'] = 404;
    next(err);
  });

  /// error handlers
  app.use(((err, _req, res, next) => {
    /**
     * Handle 401 thrown by express-jwt library
     */
    if (err.name === 'UnauthorizedError') {
      return res
        .status(err.status)
        .send({ message: err.message })
        .end();
    }
    return next(err);
  }) as ErrorRequestHandler);
  app.use(((err, _req, res) => {
    res.status(err.status || 500);
    res.json({
      errors: {
        message: err.message,
      },
    });
  }) as ErrorRequestHandler);
};
