const express = require('express');
const router = express.Router({ mergeParams: true });
const catchAsync = require('../utils/catchAsync');
const { isLoggedIn, validateReview, isReviewAuthor } = require('../utils/middleware');
const reviews = require('../controllers/reviews');

router.post('/', isLoggedIn, validateReview, catchAsync(reviews.saveReview));

router.delete('/:r_id', isLoggedIn, isReviewAuthor, catchAsync(reviews.deleteReview));

module.exports = router;
