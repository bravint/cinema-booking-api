const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

const getAllMovies = async (req, res) => {
    let response;

    if (Object.values(req.query).length > 0 && req.query.by === 'runtime') {
        response = await filterByRuntime(req.query);
    } else {
        response = await getAll();
    }

    return res.json(response);
};

const filterByRuntime = async (query) => {
    // EXAMPLE REQUEST
    // http://localhost:4000/movie?by=runtime&gt=716&lt=819

    let minValue;
    let maxValue;

    query.gt === undefined ? (minValue = 1) : (minValue = parseInt(query.gt, 10));
    query.lt === undefined ? (maxValue = 100000) : (maxValue = parseInt(query.lt, 10));

    return await prisma.movie.findMany({
        where: {
            runtimeMins: {
                gt: minValue,
                lt: maxValue,
            },
        },
        include: { screenings: true },
    });
};

const getAll = async () => {
    return await prisma.movie.findMany({
        include: { screenings: true },
    });
};

const getMovie = async (req, res) => {
    const { movie } = req.params;

    let response;

    if (isNaN(movie)) {
        response = await findMovieByTitle(movie);
    } else {
        response = await findMovieById(parseInt(movie, 10));
    }

    if (response) {
        return res.json(response);
    } else {
        return res.status(404).send(`no match for ${movie} found`);
    }
};

const createMovie = async (req, res) => {
    const { title, runtimeMins, screenings } = req.body;

    const checkForExistingMovie = await findMovieByTitle(title);
    if (checkForExistingMovie.length > 0)
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
    // EXAMPLE REQUEST
    // {
    //     "title":"Jumanji",
    //     "runtimeMins": 102,
    //     "screenings":
    //         [
    //             {
    //             "startsAt":"2022-02-19T14:21:00+00:00",
    //             "screenId":1
    //             },
    //             {
    //             "startsAt":"2022-03-19T14:21:00+00:00",
    //             "screenId":1
    //             }
    //         ]
    // }

    return await prisma.movie.create({
        data: {
            title,
            runtimeMins,
            screenings: {
                createMany: {
                    data: screenings,
                },
            },
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

const updateMovie = async (req, res) => {
    let { id } = req.params;
    id = parseInt(id, 10);

    const { title, runtimeMins, screenings } = req.body;

    await deleteExisitingScreenings(id);

    const updatedMovie = await prisma.movie.update({
        where: {
            id: id,
        },
        data: {
            title,
            runtimeMins,
            screenings: {
                createMany: {
                    data: screenings,
                },
            },
        },
        include: { screenings: true },
    });

    res.json(updatedMovie);
};

const deleteExisitingScreenings = async (movieId) => {
    await prisma.screening.deleteMany({
        where: {
            movieId: movieId,
        },
    });
};

const createScreen = async (req, res) => {
    const { number, screenings } = req.body;

    let response;

    if (screenings === undefined) {
        response = await createScreenWithoutScreening(number);
    } else {
        response = await createScreenWithScreening(number, screenings);
    }

    return res.json(response);
};

const createScreenWithoutScreening = async (number) => {
    return await prisma.screen.create({
        data: {
            number,
        },
    });
};

const createScreenWithScreening = async (number, screenings) => {
    return await prisma.screen.create({
        data: {
            number,
            screenings: {
                createMany: {
                    data: screenings,
                },
            },
        },
    });
};

module.exports = {
    getAllMovies,
    getMovie,
    createMovie,
    updateMovie,
    createScreen,
};
