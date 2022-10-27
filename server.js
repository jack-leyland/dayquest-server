import express  from 'express';
import cors from 'cors';
import http from 'http';
import passport from 'passport';
import mongoose from 'mongoose';
import config from './config/index.js';
import { ApolloServer} from '@apollo/server';
import { expressMiddleware } from '@apollo/server/express4';
import { ApolloServerPluginDrainHttpServer } from '@apollo/server/plugin/drainHttpServer';
import gql from 'graphql-tag';

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



async function startServer() {
    console.log((config.isProduction ? "Production" : "Developement") + " server starting...")

    //Does this need to happen here?
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
    const httpServer = http.createServer(app);
    const server = new ApolloServer({
        typeDefs,
        resolvers,
      plugins: [ApolloServerPluginDrainHttpServer({ httpServer })],
    });
    await server.start();

    app.use(
      '/v1',
      cors(),
      express.json(),
      express.urlencoded({ extended: true }),
    //authentication middleware that prompts for login from client if token is bad
      expressMiddleware(server, {
        context: async ({ req }) => ({ token: req.headers.token }),
      }),
    );
  
    await new Promise((resolve) => httpServer.listen({ port: config.port }, resolve));
    console.log(` GraphQL endpoint ready at http://localhost:${config.port}/v1`);
  }

startServer()

// app.listen(config.port, () => {
//     console.log(`Server listening on port ${config.port}`)
//   })
