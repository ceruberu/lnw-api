import express from 'express';
import { ApolloServer, gql } from 'apollo-server-express';
import { MongoClient } from 'mongodb';
import { checkEmail, checkNickname, hashPassword, registerWithEmail} from './helpers/userHelper';
import mongoURL from './mongo.js';
import casual from 'casual';


const mocks = {
  User: () => ({
    id: casual.uuid,
    username: casual.username,

  })
}

// This is a (sample) collection of books we'll be able to query
// the GraphQL server for.  A more complete example might fetch
// from an existing data source like a REST API or database.
const books = [
  {
    title: 'Harry Potter and the Chamber of Secrets',
    author: 'J.K. Rowling',
  },
  {
    title: 'Jurassic Park',
    author: 'Michael Crichton',
  },
];

// Type definitions define the "shape" of your data and specify
// which ways the data can be fetched from the GraphQL server.
const typeDefs = gql`
  # Comments in GraphQL are defined with the hash (#) symbol.
  type User {
    id: ID!,
    email: String!
    nickname: String!
    isVerified: Boolean!
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
    me: () => "Resolved",
  },
  Mutation: {
    registerUser: async (_, { input }, { db }) => {
      const UserCollection = db.collection('users');

      try {
        // Check whether the requested email and nickname is available
        const emailExist = await checkEmail(UserCollection, input.email);
        const nicknameExist = await checkNickname(UserCollection, input.nickname);
        
        if (!emailExist && !nicknameExist) {
          // Passes email and nickname check, now hash password and get ready for registration
        }
      } catch (err) {
        console.log(err.stacks);
      }

    }
  }
};

const app = express();

const client = new MongoClient(mongoURL, { useNewUrlParser: true });

(async function () {
  try {
    await client.connect();

    const db = client.db('lnw');
    const server = new ApolloServer({ 
      typeDefs, 
      resolvers,
      context: {
        db
      }
    });
    
    server.applyMiddleware({ app });

    app.listen({ port: 4000 }, () => {
      console.log(`Server ready at localhost:4000`)
    })
  } catch (err) {
    console.log(err);
  }
})();