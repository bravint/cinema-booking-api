const express = require('express');
const { createCustomer, updateCustomer } = require('../controllers/customer');

const router = express.Router();

router.put('/:id', updateCustomer);

// In index.js, we told express that the /customer route should use this router file
// The below /register route extends that, so the end result will be a URL
// that looks like http://localhost:4000/customer/register
router.post('/register', createCustomer);

module.exports = router;
