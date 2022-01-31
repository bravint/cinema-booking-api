
const express = require("express");

const router = express.Router();

const {getAllMovies, getMovie, createMovie} = require ('../controllers/movie.js')

router.get('/', getAllMovies)

router.get('/:movie', getMovie)

router.post('/', createMovie)

module.exports = router;