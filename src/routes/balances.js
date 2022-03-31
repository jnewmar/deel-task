const express = require('express')
const router = express.Router()
const balancesController = require('../controllers/balances')

router.post('/balances/deposit/:user_id', balancesController.deposit)

module.exports = router
