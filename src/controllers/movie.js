const { Prisma, PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

const getAllMovies = async (req, res) => {
    const response = await prisma.movie.findMany();
    return res.json(response);
};

const createMovie = async (req, res) => {
    const { title, runtimeMins, screenings } = req.body;
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
    return (response = await prisma.movie.create({
        data: {
            title,
            runtimeMins,
        },
    }));
};

const createMovieWithScreening = async (title, runtimeMins, screenings) => {
    return (response = await prisma.movie.create({
        data: {
            title,
            runtimeMins,
            screenings,
        },
    }));
};

module.exports = { getAllMovies, createMovie };
