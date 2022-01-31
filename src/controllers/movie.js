const { Prisma, PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

const getAllMovies =  async (req, res) => {
    const movies = await prisma.movie.findMany()
    return res.json(movies)
  }

module.exports = {getAllMovies}