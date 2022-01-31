const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

const getAllMovies = async (req, res) => {
    const response = await prisma.movie.findMany();
    return res.json(response);
};

const getMovie = async (req, res) => {
    const { movie } = req.params;
    let response;
    if (isNaN(movie)) {
        response = await findMovieByTitle(movie)
    } else {
        response = await findMovieById(parseInt(movie, 10))
    }
    console.log(`post number check`, response);
    if (response) {
        return res.json(response)
    } else {
        return res.status(404).send(`no match for ${movie} found`);
    }
};

const createMovie = async (req, res) => {
    const { title, runtimeMins, screenings } = req.body;
    if (await checkForExistingMovie(title))
        return res.status(400).send('Movie already exists in database');
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
    return await prisma.movie.findFirst({
        where: {
            title: title,
        },
    });
};

const findMovieByTitle = async (title) => {
    return await prisma.movie.findMany({
        where: {
            title: {
                contains: title,
                mode: 'insensitive',
            },
        },
    });
};

const findMovieById = async (id) => {
    return await prisma.movie.findUnique({
        where: {
            id: id,
        },
    });
};

module.exports = { getAllMovies, getMovie, createMovie };
