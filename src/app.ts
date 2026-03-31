import cors from 'cors';
import express, { Request, Response } from 'express';
import cookieParser from 'cookie-parser'; 
import globalErrorHandler from './app/middlewares/globalErrorHandler';
import router from './routes';
import swaggerUi from 'swagger-ui-express';
import notFound from './app/middlewares/notFount';
import path from 'path';
import { Morgan } from './shared/morgen';
import swaggerSpec from './swagger';
// import passport from 'passport';
// import session from 'express-session';

const app = express();

// morgan
app.use(Morgan.successHandler);
app.use(Morgan.errorHandler);

// body parser
app.use(cors({
  origin: '*',
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Use cookie-parser to parse cookies
app.use(cookieParser());

// Setup session and passport
// app.use(session({
//   secret: 'your-session-secret',
//   resave: false,
//   saveUninitialized: true,
// }));
// app.use(passport.initialize());
// app.use(passport.session());

// file retrieve
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// router
app.use('/api/v1', router);

// Swagger UI
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// live response
app.get('/test', (req: Request, res: Response) => {
  res.status(201).json({ message: 'Welcome to Backend Template Server' });
});

// global error handle
app.use(globalErrorHandler);

// handle not found route
app.use(notFound);

export default app;
