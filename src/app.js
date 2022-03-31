const express = require('express')
const bodyParser = require('body-parser')
const { sequelize } = require('./model')
const { getProfile } = require('./middleware/getProfile')
const app = express()
app.use(bodyParser.json())
app.set('sequelize', sequelize)
app.set('models', sequelize.models)
const swaggerUi = require('swagger-ui-express')

const swaggerDoc = require('./swagger.json')
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDoc))

app.use(getProfile)
const contractsRoutes = require('./routes/contracts')
app.use('/contracts', contractsRoutes)

const jobsRoutes = require('./routes/jobs')
app.use('/jobs', jobsRoutes)

const balancesRoutes = require('./routes/balances')
app.use(balancesRoutes)

const adminRoutes = require('./routes/admin')
app.use('/admin', adminRoutes)

module.exports = app
