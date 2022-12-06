import express  from 'express';
import cors from 'cors';
import passport from 'passport';
import "./src/auth/strategies/index.js"
import mongoose from 'mongoose';
import config from './src/config/index.js';
import authRouter from "./src/routes/auth.js"
import initializeDatabase from './src/db/initializeDatabase.js';

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

    mongoose.connect(config.authDBUrl, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
      })
    .then(() => {
        console.log("DB connection established.")
    })
    .catch(err => {
        console.log("DB connection failed.")
        !config.isProduction && console.error(err)
    });
    mongoose.connection.on('error', err => {
        !config.isProduction && console.error("DB connection runtime error: " + err);
    });
    mongoose.connection.on('disconnected', err => {
        !config.isProduction && console.log("DB disconnected: " + err);
    });

    const app = express();
    app.use(passport.initialize())
    app.use(cors())
    app.use(express.json())
    app.use(express.urlencoded({ extended: false }))

    //temp dev logger
    if (!config.isProduction) {
      app.use('/', 
      (req, res, next) => {
        let current_datetime = new Date();
        let formatted_date =
          current_datetime.getFullYear() +
          "-" +
          (current_datetime.getMonth() + 1) +
          "-" +
          current_datetime.getDate() +
          " " +
          current_datetime.getHours() +
          ":" +
          current_datetime.getMinutes() +
          ":" +
          current_datetime.getSeconds();
        let method = req.method;
        let url = req.url;
        let status = res.statusCode;
        let log = `[${formatted_date}] ${method}:${url} ${status}`;
        console.log(log);
        console.log(req.body)
        next();
      })
    }

    app.use('/auth', authRouter);

    initializeDatabase();

    app.listen(config.port, () => {
      console.log(`${config.isProduction ? "Production" : "Development"} server listening on port ${config.port}`);
    })

  }

startServer()
