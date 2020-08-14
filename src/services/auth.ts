import { Service, Inject } from 'typedi';
import { sign } from 'jsonwebtoken';
import config from '../config';
import { EventDispatcher, EventDispatcherInterface } from '../decorators/eventDispatcher';
import events from '../subscribers/events';
import { User } from '../model/User';
import { hash, compare } from 'bcryptjs';
import { Repository, getConnection } from 'typeorm';
import validator from 'validator';

// TODO: move interfaces
export interface Credentials {
  email: string;
  password: string;
}
interface LoginResponse {
  accessToken: string;
  refreshToken: string;
  user: User;
}
export interface AccessTokenPayload {
  userId: number; // We are gonna use this in the middleware 'isAuth'
  //role: user.role,
  email: string;
  //exp: number;
}
@Service()
export default class AuthService {
  constructor(
    @Inject('userRepo') private userRepo: Repository<User>,
    //private mailer: MailerService,
    @Inject('logger') private logger: any,
    @EventDispatcher() private eventDispatcher: EventDispatcherInterface
  ) {}

  public async Register(credentials: Credentials): Promise<{ user: User }> {
    try {
      let isEmail = validator.isEmail(credentials.email);
      if (!isEmail) throw new Error(`registration error: ${credentials.email} is no valid email`);

      let existingUser = await User.findOne({ where: { email: credentials.email } });
      if (existingUser) throw new Error(`registration error: user with email ${credentials.email} already exists`);

      this.logger.silly('Hashing password');
      const hashed = await hash(credentials.password, 12);

      this.logger.silly('Creating user db record');
      let { generatedMaps } = await User.insert({
        email: credentials.email,
        password: hashed
      });
      let user = generatedMaps[0] as User;

      //this.logger.silly('Sending welcome email');
      //await this.mailer.SendWelcomeEmail(user);

      this.eventDispatcher.dispatch(events.user.register, { user });

      return { user };
    } catch (e) {
      this.logger.error(e);
      throw e;
    }
  }

  public async Login(email: string, password: string): Promise<LoginResponse> {
    // TODO:https://stackoverflow.com/questions/53378667/cast-entity-to-dto
    const user = await this.userRepo.findOne({ email }, { select: ['email', 'id'] });
    if (!user) {
      throw new Error('User not registered');
    }
    this.logger.silly('Checking password');
    const valid = await compare(user.password, password);
    if (!valid) throw new Error('invalid password');

    this.logger.silly('Password is valid!');
    this.logger.silly('Generating JWT');
    const accessToken = this.createAccessToken(user);
    const refreshToken = this.createRefreshToken(user);

    return { user, accessToken, refreshToken };
  }

  public async Logout(userId: number): Promise<boolean> {
    await getConnection()
      .getRepository(User)
      .increment({ id: userId }, 'tokenVersion', 1);
    return true;
  }

  private createAccessToken = (user: User) => {
    return sign({ userId: user.id, email: user.email } as AccessTokenPayload, config.accessTokenSecret!, {
      expiresIn: '15m'
    });
  };
  private createRefreshToken = (user: User) => {
    return sign({ userId: user.id, tokenVersion: user.tokenVersion }, config.refreshTokenSecret!, {
      expiresIn: '7d'
    });
  };
}
// private generateToken(user) {
//   const today = new Date();
//   const exp = new Date(today);
//   exp.setDate(today.getDate() + 60);

//   /**
//    * A JWT means JSON Web Token, so basically it's a json that is _hashed_ into a string
//    * The cool thing is that you can add custom properties a.k.a metadata
//    * Here we are adding the userId, role and name
//    * Beware that the metadata is public and can be decoded without _the secret_
//    * but the client cannot craft a JWT to fake a userId
//    * because it doesn't have _the secret_ to sign it
//    * more information here: https://softwareontheroad.com/you-dont-need-passport
//    */
//   this.logger.silly(`Sign JWT for userId: ${user._id}`);
//   return jwt.sign(
//     {
//       _id: user._id, // We are gonna use this in the middleware 'isAuth'
//       role: user.role,
//       name: user.name,
//       exp: exp.getTime() / 1000,
//     },
//     config.jwtSecret,
//   );
// }
