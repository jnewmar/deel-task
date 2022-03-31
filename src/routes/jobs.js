const express = require('express')
const router = express.Router()
const jobsController = require('../controllers/jobs')

router.get('/unpaid', jobsController.getUserUnpaidJobs)
router.post('/:job_id/pay', jobsController.pay)

module.exports = router
