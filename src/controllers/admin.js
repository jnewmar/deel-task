const moment = require('moment')
const DEFAULT_LIMIT = 2

const validateInput = (req) => {
  moment(req.query.start, 'YYYY-MM-DD').isValid()
  if (!moment(req.query.start, 'YYYY-MM-DD').isValid()) {
    return {
      status: 'fail',
      error: 'Invalid start date'
    }
  }
  if (!moment(req.query.end, 'YYYY-MM-DD').isValid()) {
    return {
      status: 'fail',
      error: 'Invalid end date'
    }
  }
  if (moment(req.query.end).isBefore(req.query.start)) {
    return {
      status: 'fail',
      error: 'End date should be after start date'
    }
  }
}

const getTopUserOfType = async (req, type) => {
  const start = moment(req.query.start).format('YYYY-MM-DD HH:mm:ss')
  const end = moment(req.query.end).add(1, 'd').format('YYYY-MM-DD HH:mm:ss')
  const limit = req.query.limit ?? DEFAULT_LIMIT
  const offset = req.query.offset ?? 0

  const userTypeField = (type === 'client') ? 'ClientId' : 'ContractorId'

  const subQuery = `SELECT Contracts.${userTypeField} AS userId, SUM(Jobs.price) AS totalPaid FROM
  Contracts LEFT JOIN Jobs ON Jobs.ContractId = Contracts.id WHERE Jobs.paymentDate IS NOT NULL AND Jobs.paymentDate >= '${start}' AND Jobs.paymentDate <= '${end}' GROUP BY userId`

  const topUsersQuery = `SELECT Profiles.id, Profiles.firstName, Profiles.lastName, sub.totalPaid AS totalPaid  FROM Profiles LEFT JOIN (${subQuery}) AS sub ON Profiles.id = sub.userId 
  WHERE Profiles.type = '${type}' GROUP BY Profiles.id ORDER BY totalPaid DESC, firstName ASC, lastName ASC  LIMIT ${offset},${limit}`

  const sequelize = req.app.get('sequelize')
  const topUsersResult = await sequelize.query(topUsersQuery, { type: sequelize.QueryTypes.SELECT })
  const { Profile } = req.app.get('models')
  const totalUsers = await Profile.count({ where: { type } })

  const topUsers = {
    total: totalUsers,
    topUsers: topUsersResult.map(
      item => ({
        ...item,
        totalPaid: item.totalPaid ?? 0
      })
    )
  }
  return topUsers
}

exports.getBestClients = async (req, res, next) => {
  const error = validateInput(req)
  if (error) {
    res.status(400)
      .json(error)
      .end()
    return
  }
  const topClients = await getTopUserOfType(req, 'client')
  res.status(200)
    .json(topClients)
    .end()
}

exports.getBestContractors = async (req, res, next) => {
  const error = validateInput(req)
  if (error) {
    res.status(400)
      .json(error)
      .end()
    return
  }
  const topUsers = await getTopUserOfType(req, 'contractor')
  res.status(200)
    .json(topUsers)
}
