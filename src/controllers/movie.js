const { idToInteger, prisma } = require('../utils');

const getAllMovies = async (req, res) => {
    let response;

    if (Object.values(req.query).length > 0 && req.query.by === 'runtime') response = await filterByRuntime(req.query);

    response = await getAll();

    if (response.length === 0) return res.status(200).json(`No movies found`);

    return res.json(response);
};

const filterByRuntime = async (query) => {
    let gt;
    let lt;

    (!query.gt) ? (minValue = 1) : (gt = parseInt(query.gt, 10));
    (!query.lt) ? (maxValue = 1000) : (lt = parseInt(query.lt, 10));

    return await prisma.movie.findMany({
        where: {
            runtimeMins: {
                gt,
                lt,
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

    if (!response.length) return res.status(404).send(`No match for ${movie} found`);

    return res.json(response);

};

const createMovie = async (req, res) => {
    let { title, runtimeMins, screenings } = req.body;

    runtimeMins = Number(runtimeMins)

    const checkForExistingMovie = await findMovieByTitle(title);
    if (checkForExistingMovie.length > 0) return res.status(400).json(`${title} already exists in database`);

    let response;

    if (screenings) response = await createMovieWithScreening(title, runtimeMins, screenings);

    response = await createMovieWithoutScreening(title, runtimeMins);
        
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
            screenings: {
                createMany: {
                    data: screenings,
                },
            },
        },
        include: { screenings: true },
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
            id,
        },
    });
};


const updateMovie = async (req, res) => {
    const id = idToInteger(req.params);
    let { title, runtimeMins } = req.body;

    let updateToScreenings = req.body.screenings;
    let screenings = [];

    for (let i = 0; i < updateToScreenings.length; i++) {
        if (updateToScreenings.id) {
            const updatedScreening = await updateScreenings(updateToScreenings[i], res);
            screenings.push(updatedScreening);
            continue
        } 
        const updatedScreening = await createScreenings(updateToScreenings[i], id);
        screenings.push(updatedScreening);
    }

    const response = await updatedMovie(title, runtimeMins, id);

    if (response === `error`) return res.status(404).json(`No movie at id ${id}`);
 
    return res.json({ ...response, screenings });
    
};

const updatedMovie = async (title, runtimeMins, id) => {
    try {
        return await prisma.movie.update({
            where: {
                id,
            },
            data: {
                title,
                runtimeMins,
            },
        });
    } catch {
        return `error`;
    }
};

const updateScreenings = async (screening) => {
    const { startsAt, screenId, id } = screening;
    try {
        return await prisma.screening.update({
            data: {
                startsAt,
                screenId,
            },
            where: {
                id,
            },
        });
    } catch {
        return `error`;
    }
};

const createScreenings = async (screening, id) => {
    const { startsAt, screenId } = screening;
    try {
        return await prisma.screening.create({
            data: {
                startsAt,
                screen: {
                    connect: {
                        id: screenId,
                    },
                },
                movie: {
                    connect: {
                        id,
                    },
                },
            },
        });
    } catch {
        return `error`;
    }
};

const createScreen = async (req, res) => {
    const { number, screenings } = req.body;

    let response;

    if (screenings) response = await createScreenWithScreening(number, screenings);

    response = await createScreenWithoutScreening(number);

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
        include: {
            screenings: true,
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
