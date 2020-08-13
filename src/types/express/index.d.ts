import { User } from '../../model/User';
import { AccessTokenPayload } from 'src/services/auth';
declare global {
  namespace Express {
    export interface Request {
      currentUser: User;
      accessTokenPayload?: AccessTokenPayload;
    }
  }

  namespace Models {
    export type UserModel = User;
  }
}
