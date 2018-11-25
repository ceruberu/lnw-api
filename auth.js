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

export function validateToken (token) {
  console.log("TOKEN::",  token);
  // const decoded = 
  return "HEY"

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