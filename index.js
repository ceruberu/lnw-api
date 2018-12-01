import express from 'express';
import { ApolloServer } from 'apollo-server-express';
import http from 'http';
import { MongoClient } from 'mongodb';
import passport from 'passport';
import { Strategy as FacebookStrategy } from 'passport-facebook';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';
import bodyParser from 'body-parser'; 
import serveStatic from 'serve-static';
import cors from 'cors';
import path from 'path';
import { makeExecutableSchema } from 'graphql-tools';
import { fileLoader, mergeTypes, mergeResolvers } from 'merge-graphql-schemas';
import buildDataLoaders from './dataloaders';


import { generateToken } from './helpers/authHelper';
import { checkFacebookID } from './helpers/userHelper';
import mongoURL from './mongo.js';

import { FACEBOOK_APP_ID, FACEBOOK_APP_SECRET } from './credentials.json';

const PORT = 4000;

const types = fileLoader(path.join(__dirname, './schema'));
const typeDefs = mergeTypes(types);

const resolversArray = fileLoader(path.join(__dirname, './resolvers'));
const resolvers = mergeResolvers(resolversArray);


const schema = makeExecutableSchema({
  typeDefs,
  resolvers
});



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


const client = new MongoClient(mongoURL, { useNewUrlParser: true });

(async function () {
  try {
    await client.connect();

    const db = client.db('lnw');
    const mongo = {
      User: db.collection('users'),
      Post: db.collection('posts'),
      Comment: db.collection('comments'),
      Vote: db.collection('votes')
    };

    const server = new ApolloServer({ 
      schema,
      context: ({req, res}) => {
        return {
          req,
          res,
          mongo,
          loaders: buildDataLoaders(mongo)
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
      const user = await checkFacebookID(mongo.User, profile.id);

      if (!user) {
        try {
          const newUserResponse = await mongo.User.insertOne({
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

    const httpServer = http.createServer(app);
    server.installSubscriptionHandlers(httpServer);

    httpServer.listen(PORT, () => {
      console.log(`🚀 Server ready at http://localhost:${PORT}${server.graphqlPath}`)
      console.log(`🚀 Subscriptions ready at ws://localhost:${PORT}${server.subscriptionsPath}`)

    })
  } catch (err) {
    console.log(err);
  }
})();