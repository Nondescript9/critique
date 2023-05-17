if (process.env.NODE_ENV !== 'production') {
  require('dotenv').config();
}

// BASE
const express = require('express');
const app = express();
const port = process.env.PORT || 3000;
const path = require('path');
const mongoose = require('mongoose');

// HTTP REQUESTS
const methodOverride = require('method-override');

// MIDDLEWARE LIBRARIES
const morgan = require('morgan');

// TEMPLATING
const ejsMate = require('ejs-mate');

// ERROR HANDLING
const ExpressError = require('./utils/ExpressError');

// SESSION
const session = require('express-session');
const flash = require('connect-flash');
const MongoStore = require('connect-mongo');

// AUTHENTICATION
const passport = require('passport');
const LocalStrategy = require('passport-local');

// SECURITY
const mongoSanitize = require('express-mongo-sanitize');
const helmet = require('helmet');

// MODELS
const User = require('./models/user');

// ROUTERS
const albumRoutes = require('./routes/albums');
const reviewRoutes = require('./routes/reviews');
const userRoutes = require('./routes/users');

// When set to true, Mongoose will ensure that only the fields that are specified in your Schema will be saved in the database
mongoose.set('strictQuery', true);

const cloudMongoDB = process.env.DB_URL || 'mongodb://localhost:27017/critiquedb';

// DATABASE
mongoose
  .connect(cloudMongoDB)
  .then(() => {
    console.log('MongoDB Connection Open!');
  })
  .catch((e) => {
    console.log('MongoDB Connection Error!', e);
  });

// SERVER CONFIG
app.engine('ejs', ejsMate);
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// MIDDLEWARES
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride('_method'));
app.use(morgan('dev'));

const secret = process.env.SECRET || 'notreallyasecret';

app.use(
  session({
    name: 'session',
    secret,
    resave: false,
    saveUninitialized: true,
    cookie: {
      httpOnly: true
      // secure: true
    },
    store: MongoStore.create({
      mongoUrl: cloudMongoDB,
      touchAfter: 3600,
      crypto: {
        secret
      }
    })
  })
);
app.use(flash());
// Middleware which sanitizes user-supplied data to prevent MongoDB Operator Injection
app.use(mongoSanitize());
// Helmet helps secure Express apps by setting HTTP response headers
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        'default-src': [],
        'img-src': ["'self'", 'https://i.scdn.co'],
        'frame-src': ['https://open.spotify.com'],
        'script-src': ["'unsafe-inline'", "'self'", 'https://cdn.jsdelivr.net', 'https://ajax.googleapis.com']
      }
    }
  })
);

app.use(passport.initialize());
// For persistent login sessions
app.use(passport.session());
// Use specific LocalStrategy to authenticate user
passport.use(new LocalStrategy(User.authenticate()));
// Used by Passport to store/unstore users into the session
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

// Store to res.locals so it can be accessed on every template
app.use((req, res, next) => {
  res.locals.currentUser = req.user;
  res.locals.success = req.flash('success');
  res.locals.error = req.flash('error');
  next();
});

// ROUTES
app.use('/', userRoutes);
app.use('/albums', albumRoutes);
app.use('/albums/:id/reviews', reviewRoutes);

app.get('/', (req, res) => {
  res.redirect('/albums');
});

// 404 ERROR HANDLER
app.all('*', (req, res, next) => {
  next(new ExpressError(404, 'Page Not Found'));
});

// DEFAULT ERROR HANDLER
app.use((err, req, res, next) => {
  const { statusCode = 500 } = err;
  if (!err.message) err.message = 'Something went wrong!';
  res.status(statusCode).render('./partials/error', { err });
});

app.listen(port, () => {
  console.log(`Serving on port ${port}!`);
});
