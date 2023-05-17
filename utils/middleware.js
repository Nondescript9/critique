const axios = require('axios');
const qs = require('qs');
const ExpressError = require('../utils/ExpressError');
const { reviewSchema } = require('../models/joi');
const Review = require('../models/review');

// Middleware that retrieves token from Spotify API
module.exports.getAccessToken = async (req, res, next) => {
  const isTokenExpired = req.session.cookie.maxAge <= 0 ? true : false;
  if (isTokenExpired) {
    const client_id = process.env.SPOTIFY_CLIENT_ID;
    const client_secret = process.env.SPOTIFY_CLIENT_SECRET;
    const headers_config = {
      headers: {
        Authorization: 'Basic ' + new Buffer.from(client_id + ':' + client_secret).toString('base64')
      }
    };
    const token_url = 'https://accounts.spotify.com/api/token';
    const auth_form = qs.stringify({ grant_type: 'client_credentials' });
    const token = await axios.post(token_url, auth_form, headers_config);
    req.session.token = token.data.access_token;
    req.session.cookie.maxAge = 3600000;
    console.log('Token Refreshed: ' + req.session.cookie.maxAge);
    return next();
  } else {
    console.log('Token Active: ' + req.session.cookie.maxAge);
    next();
  }
};

// Middleware that checks if the user is logged in
module.exports.isLoggedIn = (req, res, next) => {
  if (!req.isAuthenticated()) {
    req.session.returnTo = req.originalUrl;
    req.flash('error', 'You must be logged in');
    return res.redirect('/login');
  }
  next();
};

// Middleware that stores pre-login url
module.exports.storeReturnTo = (req, res, next) => {
  if (req.session.returnTo) {
    res.locals.returnTo = req.session.returnTo;
  }
  next();
};

// Middleware that handles form validation through Joi
module.exports.validateReview = (req, res, next) => {
  const { error } = reviewSchema.validate(req.body);
  if (error) {
    const msg = error.details.map((el) => el.message).join(',');
    throw new ExpressError(400, msg);
  } else {
    next();
  }
};

// Middleware that checks if user is the author of a review
module.exports.isReviewAuthor = async (req, res, next) => {
  const { id, r_id } = req.params;
  const review = await Review.findById(r_id);
  if (review.author.equals(req.user._id) || req.user.username === 'admin') {
    return next();
  } else {
    req.flash('error', 'You have no permission to do so');
    res.redirect(`/albums/${id}`);
  }
};
