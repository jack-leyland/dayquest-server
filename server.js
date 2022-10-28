import express  from 'express';
import cors from 'cors';
import http from 'http';
import passport from 'passport';
import "./auth/passport.js"
import mongoose from 'mongoose';
import config from './config/index.js';
import { ApolloServer} from '@apollo/server';
import { expressMiddleware } from '@apollo/server/express4';
import { ApolloServerPluginDrainHttpServer } from '@apollo/server/plugin/drainHttpServer';
import gql from 'graphql-tag';
import {default as loginRouter } from './routes/login.js'
import {default as registerRouter } from './routes/register.js'
import {default as refreshRouter } from './routes/refresh.js'

const typeDefs = gql`
  type Query {
    hello: String
  }
`;

const resolvers = {
    Query: {
      hello: () => 'Hello world!',
    },
  };

// Intercepts all requests to graphQL endpoint and verifies 
// that the access token is good and the device is recognized
const authenticateUser = async (req, res, next) => {
  passport.authenticate(
    'jwt',
    {session:false},
    async (err, user, info) => {
      try {
          if (err) {
          console.error(err)
          res.status(500).send('Server Error')
          return;
          }
          if (!user) {
              res.status(401).json({message: info.message})
              return 
          }
          req.user = user
          return next()

      } catch (error) {
          return next(error);
      }
  }
)(req, res, next);
} 


async function startServer() {
    console.log((config.isProduction ? "Production" : "Developement") + " server starting...")

    mongoose.connect(config.dbUrl, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
      })
    .then(() => {
        console.log("DB connection established.")
    })
    .catch(err => {
        console.log("DB connection failed.")
        !config.isProduction || console.error(err)
    });
    mongoose.connection.on('error', err => {
        !config.isProduction || console.error("DB connection runtime error: " + err);
    });
    mongoose.connection.on('disconnected', err => {
        !config.isProduction || console.log("DB disconnected: " + err);
    });

    const app = express();
    app.use(passport.initialize())
    app.use(cors())
    app.use(express.json())
    app.use(express.urlencoded({ extended: false }))

    //REST auth routes
    app.use('/register', registerRouter)
    app.use('/login', loginRouter)
    app.use('/refresh', refreshRouter)


    const httpServer = http.createServer(app);
    const server = new ApolloServer({
        typeDefs,
        resolvers,
      plugins: [ApolloServerPluginDrainHttpServer({ httpServer })],
    });
    await server.start();

    app.use(
      '/v1',
      authenticateUser,
      expressMiddleware(server, {
        context: async ({ req }) => ({ user: req.user }),
      }),
    );
  
    await new Promise((resolve) => httpServer.listen({ port: config.port }, resolve));
    console.log(`GraphQL endpoint ready at http://localhost:${config.port}/v1`);
  }

startServer()
