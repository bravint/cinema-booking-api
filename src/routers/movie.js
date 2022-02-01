const express = require('express');

const router = express.Router();

const {
    getAllMovies,
    getMovie,
    createMovie,
    updateMovie,
    createScreen,
} = require('../controllers/movie.js');

router.get('/', getAllMovies);

router.get('/:movie', getMovie);

router.post('/', createMovie);

router.put('/:id', updateMovie);

router.post('/screen', createScreen);

module.exports = router;
