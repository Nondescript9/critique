const axios = require('axios');
const Album = require('../models/album');

module.exports.getAlbumsFromAPI = async (req, res) => {
  const { q } = req.query;
  const { token } = req.session;
  if (q) {
    const reqConfig = {
      headers: { Authorization: 'Bearer ' + token }
    };
    const response = await axios.get(`https://api.spotify.com/v1/search?q=${q}&type=album&limit=11`, reqConfig);
    const { items } = response.data.albums;
    return res.render('albums/search', { items });
  } else {
    req.flash('error', 'Nothing found if nothing searched');
    res.redirect('/albums');
  }
};

module.exports.saveAlbumfromAPI = async (req, res) => {
  const { s_id } = req.params;
  const { token } = req.session;
  const reqConfig = {
    headers: { Authorization: 'Bearer ' + token }
  };
  const response = await axios.get(`https://api.spotify.com/v1/albums/${s_id}`, reqConfig);
  const { name, total_tracks, release_date, artists, images, external_urls, id, album_type, label } = response.data;
  const album = new Album({
    name: name,
    artist: artists[0].name,
    cover: images[1].url,
    type: album_type,
    tracks: total_tracks,
    date: release_date,
    label: label,
    url: external_urls.spotify,
    spotify_id: id,
    author: req.user._id
  });
  await album.save();
  req.flash('success', 'Successfully saved album');
  res.redirect(`/albums/${album._id}`);
};

module.exports.getAlbumIndex = async (req, res) => {
  const albums = await Album.find({});
  res.render('albums/home', { albums });
};

module.exports.getAlbum = async (req, res) => {
  const { id } = req.params;
  const album = await Album.findById(id)
    .populate({ path: 'reviews', populate: { path: 'author' } })
    .populate('author');
  if (!album) {
    req.flash('error', 'Album not found');
    return res.redirect('/albums');
  }
  res.render('albums/view', { album });
};

module.exports.deleteAlbum = async (req, res) => {
  const { id } = req.params;
  const album = await Album.findByIdAndDelete(id);
  if (!album.author.equals(req.user._id)) {
    req.flash('error', 'You have no permission to do so');
    return res.redirect(`/albums/${id}`);
  }
  req.flash('success', 'Successfully deleted album');
  res.redirect('/albums');
};
