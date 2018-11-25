import express from 'express';
import { ApolloServer, gql } from 'apollo-server-express';
import { MongoClient } from 'mongodb';
import passport from 'passport';
import { Strategy as FacebookStrategy } from 'passport-facebook';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';
import bodyParser from 'body-parser'; 
import serveStatic from 'serve-static';
import cors from 'cors';
import casual from 'casual';

import { authMiddleware, generateToken, validateToken } from './auth';
import { checkEmail, checkNickname, checkFacebookID, hashPassword, registerWithEmail} from './helpers/userHelper';
import mongoURL from './mongo.js';

import { TOKEN_SECRET ,FACEBOOK_APP_ID, FACEBOOK_APP_SECRET } from './credentials.json';

passport.serializeUser(function(user, done) {
  done(null, user.id);
});

passport.deserializeUser(function(id, done) {
  User.findById(id, function(err, user) {
    done(err, user);
  });
});

const app = express();
const authRouter = express.Router();

authRouter.get('/facebook', passport.authenticate('facebook'));

authRouter.get('/facebook/callback',
  passport.authenticate('facebook', { 
    session: false,
    failureRedirect: '/login' 
  }),
  generateToken
);

app.use(cors({
  origin: ['http://localhost:3000', 'http://localhost', 'http://localhost:4000', 'htpp://localhost:4000/graphql'],
  credentials: true
}));
app.use(serveStatic('public'));
app.use(morgan('common'));
app.use(cookieParser());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
  extended: true
}));
app.use('/auth', authRouter);
// app.use(authMiddleware());


const mocks = {
  User: () => ({
    id: casual.uuid,
    username: casual.username,

  })
}

// Type definitions define the "shape" of your data and specify
// which ways the data can be fetched from the GraphQL server.
const typeDefs = gql`
  # Comments in GraphQL are defined with the hash (#) symbol.
  type User {
    facebookID: String
    createdAt: String!
    displayName: String!
  }

  type AuthToken {
    authToken: String!
  }

  # The "Query" type is the root of all GraphQL queries.
  # (A "Mutation" type will be covered later on.)
  type Query {
    me: User
  }

  type Mutation {
    registerUser(input:RegisterUserInput): AuthToken
  }

  input RegisterUserInput {
    email: String!,
    nickname: String!,
    password: String!
  }
`;

// Resolvers define the technique for fetching the types in the
// schema.  We'll retrieve books from the "books" array above.
const resolvers = {
  Query: {
    me: (_, args, { db, req, res }) => {
      const User = db.collection('users');
      return validateToken(User, req.cookies.token, res)
    },
  },
  Mutation: {
    registerUser: async (_, { input }, { db }) => {
      const User = db.collection('users');

      try {
        // Check whether the requested email and nickname is available
        const emailExist = await checkEmail(User, input.email);

        if (!emailExist) {
          // Passes email and nickname check, now hash password and get ready for registration
        }
      } catch (err) {
        console.log(err.stacks);
      }

    }
  }
};



const client = new MongoClient(mongoURL, { useNewUrlParser: true });

(async function () {
  try {
    await client.connect();

    const db = client.db('lnw');
    const server = new ApolloServer({ 
      typeDefs, 
      resolvers, 
      context: ({req, res}) => {
        return {
          req, res, db
        }
      }
    });
    

    // apollo server overrisdes cors express module, disable it when applying middleware
    server.applyMiddleware({ 
      app,
      cors: false
    });

    passport.use(new FacebookStrategy({
      clientID: FACEBOOK_APP_ID,
      clientSecret: FACEBOOK_APP_SECRET,
      callbackURL: "http://localhost:4000/auth/facebook/callback"
    },
    async (accessToken, refreshToken, profile, done) => {
      const User = db.collection('users');
      const user = await checkFacebookID(User, profile.id);

      if (!user) {
        try {
          const newUserResponse = await User.insertOne({
            displayName: profile.displayName,
            facebookID: profile.id,
            createdAt: Date.now()
          });
          const newUser = newUserResponse.ops[0];
          return done(null, { user: newUser });
        } catch (err) {
          return done(err);
        }
      }

      return done(null, user);
    }
    )); 

    app.use(passport.initialize());

    app.listen({ port: 4000 }, () => {
      console.log(`Server ready at localhost:4000 ${server.graphqlPath}`)
    })
  } catch (err) {
    console.log(err);
  }
})();