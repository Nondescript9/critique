const express = require('express');
const router = express.Router();
const catchAsync = require('../utils/catchAsync');
const { getAccessToken, isLoggedIn } = require('../utils/middleware');
const albums = require('../controllers/albums');

router.get('/search', isLoggedIn, getAccessToken, catchAsync(albums.getAlbumsFromAPI));

router.get('/search/:s_id', isLoggedIn, catchAsync(albums.saveAlbumfromAPI));

router.get('/', catchAsync(albums.getAlbumIndex));

router.get('/:id', catchAsync(albums.getAlbum));

router.delete('/:id', isLoggedIn, catchAsync(albums.deleteAlbum));

module.exports = router;
