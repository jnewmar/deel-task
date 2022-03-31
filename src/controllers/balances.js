const { Op } = require('sequelize')

const MAX_BALANCE_PERCENTAGE = 0.25

const getClientTotalToPay = async (req) => {
  const { Contract, Job } = req.app.get('models')
  const sequelize = req.app.get('sequelize')
  const totalPaidJobs = await Job.findOne(
    {
      attributes: [
        'Contract.ClientId',
        [sequelize.fn('sum', sequelize.col('price')), 'total']
      ],
      where: {
        paymentDate: { [Op.is]: null },
        [Op.or]: [
          { paid: { [Op.is]: null } },
          { paid: { [Op.is]: false } }
        ]
      },
      include: [
        {
          model: Contract,
          attributes: ['ClientId'],
          where: { ClientId: req.profile.id }
        }
      ],
      group: ['Contract.ClientId']
    }
  )
  return (totalPaidJobs && totalPaidJobs.total) ? totalPaidJobs.total : 0
}

const validateInput = async (req, sourceProfile, targetProfile) => {
  if (typeof req.body.value !== 'number' || req.body.value <= 0) {
    return {
      code: 400,
      status: 'fail',
      error: 'Invalid value to deposit'
    }
  }

  if (!targetProfile) {
    return {
      code: 404,
      status: 'fail',
      error: 'Informed user not found'
    }
  }

  const valueToDeposit = Math.round(req.body.value / 100)
  if (sourceProfile.type === 'client') {
    const totalToPay = await getClientTotalToPay(req)
    if (sourceProfile && totalToPay > 0 && valueToDeposit > (totalToPay * MAX_BALANCE_PERCENTAGE)) {
      return {
        code: 400,
        status: 'fail',
        error: 'Client can\'t deposit more than 25% his total of jobs to pay'
      }
    }
  }

  if (sourceProfile && valueToDeposit > sourceProfile.balance) {
    return {
      code: 400,
      status: 'fail',
      error: 'Insufficient balance to deposit'
    }
  }
}

/*
. ***POST*** `/balances/deposit/:userId` - Deposits money into the the the balance of a client, a client can't deposit more than 25% his total of jobs to pay. (at the deposit moment)
*/
exports.deposit = async (req, res, next) => {
  const { Profile } = req.app.get('models')
  const sourceProfile = await Profile.findOne({ where: { id: req.profile.id } })
  const targetProfile = await Profile.findOne({ where: { id: req.params.user_id } })
  const valueToDeposit = Math.round(req.body.value / 100)

  const error = await validateInput(req, sourceProfile, targetProfile)
  if (error) {
    res.status(error.code)
      .json({
        status: error.status,
        error: error.error
      })
      .end()
    return
  }
  const sequelize = req.app.get('sequelize')
  const t = await sequelize.transaction()

  try {
    const sourceProfileUpdateResult = await Profile.update(
      {
        balance: sourceProfile.balance - valueToDeposit
      },
      {
        where: {
          id: sourceProfile.id,
          [Op.and]: [
            { balance: sourceProfile.balance },
            { balance: { [Op.gte]: valueToDeposit } }
          ]
        }
      },
      { transaction: t }
    )
    if (!sourceProfileUpdateResult) {
      throw new Error('Balance of source profile was not correctly updated')
    }

    const targetProfileUpdateResult = await Profile.update(
      {
        balance: targetProfile.balance + valueToDeposit
      },
      {
        where: {
          id: targetProfile.id,
          balance: targetProfile.balance
        }
      },
      { transaction: t }
    )
    if (!targetProfileUpdateResult) {
      throw new Error('Balance of target profile was not correctly updated')
    }

    await t.commit()
    res.status(200)
      .json({
        status: 'ok'
      })
      .end()
  } catch (error) {
    await t.rollback()
    res.status(500)
      .json({
        status: 'fail',
        error: error.message
      })
      .end()
  }
}
