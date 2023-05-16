const mongoose = require('mongoose');
const { Schema } = mongoose;
const Review = require('./review');

const AlbumSchema = new Schema({
  name: String,
  artist: String,
  cover: String,
  type: String,
  tracks: Number,
  date: String,
  label: String,
  url: String,
  spotify_id: String,
  author: {
    type: Schema.Types.ObjectId,
    ref: 'User'
  },
  reviews: [
    {
      type: Schema.Types.ObjectId,
      ref: 'Review'
    }
  ]
});

// Query middleware that runs after an album has been deleted
AlbumSchema.post('findOneAndDelete', async (doc) => {
  if (doc) {
    // Removes all Reviews with an _id that match with those in doc.reviews array
    await Review.deleteMany({
      _id: {
        $in: doc.reviews
      }
    });
  }
});

module.exports = mongoose.model('Album', AlbumSchema);
