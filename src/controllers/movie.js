const { Prisma, PrismaClient } = require('@prisma/client');
const { movie } = require('../utils/prisma');

const prisma = new PrismaClient();

const getAllMovies = async (req, res) => {
    const response = await prisma.movie.findMany();
    return res.json(response);
};

const createMovie = async (req, res) => {
    const { title, runtimeMins, screenings } = req.body;
    if (checkForExistingMovie())
        res.status(400).send('Movie already exists in database');
    let response;
    if (screenings === undefined) {
        response = await createMovieWithoutScreening(title, runtimeMins);
    } else {
        response = await createMovieWithScreening(
            title,
            runtimeMins,
            screenings
        );
    }
    return res.json(response);
};

const createMovieWithoutScreening = async (title, runtimeMins) => {
    return await prisma.movie.create({
        data: {
            title,
            runtimeMins,
        },
    });
};

const createMovieWithScreening = async (title, runtimeMins, screenings) => {
    return await prisma.movie.create({
        data: {
            title,
            runtimeMins,
            screenings,
        },
    });
};

const checkForExistingMovie = async (title) => {
    return await prisma.movie.findUnique({
        where: {
            title: title,
        },
    });
};

module.exports = { getAllMovies, createMovie };
