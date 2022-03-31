const express = require('express')
const router = express.Router()
const contractsController = require('../controllers/contracts')

router.get('/:id', contractsController.getUserContract)
router.get('/', contractsController.getUserContracts)

module.exports = router
