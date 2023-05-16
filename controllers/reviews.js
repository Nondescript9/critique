const Album = require('../models/album');
const Review = require('../models/review');

module.exports.saveReview = async (req, res) => {
  const { id } = req.params;
  const album = await Album.findById(id);
  const review = new Review(req.body.review);
  review.author = req.user._id;
  review.date = new Date();
  album.reviews.push(review);
  await review.save();
  await album.save();
  req.flash('success', 'Successfully added review');
  res.redirect(`/albums/${album._id}`);
};

module.exports.deleteReview = async (req, res) => {
  const { id, r_id } = req.params;
  await Album.findByIdAndUpdate(id, { $pull: { reviews: r_id } });
  await Review.findByIdAndDelete(r_id);
  req.flash('success', 'Successfully deleted review');
  res.redirect(`/albums/${id}`);
};
