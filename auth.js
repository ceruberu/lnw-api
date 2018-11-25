import { ObjectId } from 'mongodb';
import { AuthenticationError } from 'apollo-server-express';
import jwt from 'jsonwebtoken';
import { TOKEN_SECRET } from './credentials.json';

export function generateToken({ user }, res) {
  const expiresIn = '7d';
  const roles = ['user']
  const token = jwt.sign({
    id: user._id,
    roles
  },
    TOKEN_SECRET
  );
  
  // TO-DO add secure:true based on build stage
  res.cookie('token', token, { httpOnly: true });
  res.redirect('http://localhost:3000');
}

export function validateToken (User, clientToken, res) {
  return jwt.verify(clientToken, TOKEN_SECRET, async (err, tokenUser) => {
    if (err) {
      // jwt is no longer valid
      res.clearCookie('token');
      throw new AuthenticationError('Token is no longer valid');
    }
    const user = await User.findOne({_id: ObjectId(tokenUser.id)});
    return user;
  });
}

// export function authMiddleware() {
  
//   return async (req, res, next) => {
//     console.log(req.cookies);
//     // console.log(next);
//     // jwt.verify(token, TOKEN_SECRET, (err, decoded) => {
//     //   if (err) {

//     //   }
//     // })


//     //   try {
//     //     // protect GraphQL endpoint and check if cookie token is valid
//     //     const token = jwt.verify(token, TOKEN_SECRET);
//     //     if 
//     //     if (!tokenResponse.success) {
//     //       ctx.throw(401, 'access_denied')
//     //     } else {
//     //       await next()
//     //     }
//     //   } catch (e) {
//     //     ctx.throw(401, 'access_denied')
//     //   }
//    }
// }