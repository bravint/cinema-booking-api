const { prisma } = require('../utils');

const createTicket = async (req, res) => {
    const { customerId, screeningId } = req.body;

    const response = await prisma.ticket.create({
        data: {
            customerId,
            screeningId,
        },
        include: {
            customer: true,
            screening: {
                include: {
                    movie: true,
                    screen: true,
                },
            },
        },
    });
    
    return res.json(response);
};

module.exports = { createTicket };
