const prisma = require('../utils/prisma');

const createCustomer = async (req, res) => {
    const { name, phone, email } = req.body;

    /**
     * This `create` will create a Customer AND create a new Contact, then automatically relate them with each other
     * @tutorial https://www.prisma.io/docs/concepts/components/prisma-client/relation-queries#create-a-related-record
     */
    const createdCustomer = await prisma.customer.create({
        data: {
            name,
            contact: {
                create: {
                    phone,
                    email,
                },
            },
        },
        // We add an `include` outside of the `data` object to make sure the new contact is returned in the result
        // This is like doing RETURNING in SQL
        include: {
            contact: true,
        },
    });

    res.json({ data: createdCustomer });
};

const updateCustomer = async (req, res) => {
    let { id } = req.params;
    console.log(id)
    id = parseInt(id, 10);
    const { name, contact } = req.body;
    const phone = contact.phone
    const email = contact.email
    const updatedCustomer = await prisma.customer.update({
        where: {
            id: id
        },
        data: {
            name,
            contact: {
                update: {
                    phone,
                    email
                }
            }
        },
        include: {
            contact: true,
        },
    
    })

    res.json({ data: updatedCustomer });
    //return res.status(404).send('temp message');
};

module.exports = {
    createCustomer,
    updateCustomer,
};
