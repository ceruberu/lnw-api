import { AuthenticationError } from 'apollo-server-express';
import { validateToken } from '../helpers/authHelper';

export default {
  Query: {
    me: async (_, args, { mongo, req, res }) => {
      if (!req.cookies.token) throw new AuthenticationError('Not Logged In');
      try {
        const user = await validateToken(mongo.User, req.cookies.token, res);
        return user;
      } catch (err) {
        throw err
      }
    }
  },
  User: {
    _id: ({_id}) => _id,
    nickname: ({nickname}) => nickname
  }
};