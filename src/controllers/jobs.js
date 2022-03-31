const { Op } = require('sequelize')

const retrieveUserUnpaidJobs = async (req) => {
  const contractFilter = {
    status: 'in_progress'
  }
  const profileTypeField = (req.profile.type === 'contractor') ? 'ContractorId' : 'ClientId'
  contractFilter[profileTypeField] = req.profile.id
  const { Contract, Job } = req.app.get('models')
  const unPaidJobs = await Job.findAll(
    {
      where:
      {
        paymentDate: { [Op.is]: null },
        [Op.or]: [
          { paid: { [Op.is]: null } },
          { paid: { [Op.is]: false } }
        ]
      },
      include: [
        {
          model: Contract,
          where: contractFilter
        }
      ]
    })
  return unPaidJobs
}

const getUserUnpaidJobs = async (req, res, next) => {
  const unPaidJobs = await retrieveUserUnpaidJobs(req)
  res.json(unPaidJobs)
}

const validateInput = (job, clientProfile, contractorProfile) => {
  if (!job) {
    return {
      code: 404,
      status: 'fail',
      error: 'Job not found'
    }
  }

  if (clientProfile && clientProfile.type === 'contractor') {
    return {
      code: 400,
      status: 'fail',
      error: 'Operation not allowed for this type of user'
    }
  }

  if (!job.Contract) {
    return {
      code: 404,
      status: 'fail',
      error: 'Contract associated with the job was not found'
    }
  }

  if (!contractorProfile) {
    return {
      code: 404,
      status: 'fail',
      error: 'Contractor of the Contract associated with the job was not found'
    }
  }

  if (job.Contract && job.Contract.ClientId !== clientProfile.id) {
    return {
      code: 403,
      status: 'fail',
      error: 'Logged client is not the client in the contract associated with the job'
    }
  }

  if (job && job.paid === true) {
    return {
      code: 400,
      status: 'fail',
      error: 'Job already paid'
    }
  }

  if (job && job.price > clientProfile.balance) {
    return {
      code: 400,
      status: 'fail',
      error: 'Insufficient balance to pay'
    }
  }
}

const pay = async (req, res, next) => {
  const { Job, Profile } = req.app.get('models')
  const clientProfile = await Profile.findOne({ where: { id: req.profile.id } })

  const job = await Job.findOne({
    include: ['Contract'],
    where: { id: req.params.job_id }
  })
  const contractorProfile = (job && job.Contract && job.Contract.ContractorId) ? await Profile.findOne({ where: { id: job.Contract.ContractorId } }) : null

  const error = validateInput(job, clientProfile, contractorProfile)
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
    const jobUpdateResult = await Job.update(
      {
        paid: true,
        paymentDate: new Date()
      },
      { where: { id: req.params.job_id } },
      { transaction: t }
    )

    if (!jobUpdateResult) {
      throw new Error('Payment data in Job was not correctly updated')
    }

    const clientUpdateResult = await Profile.update(
      {
        balance: clientProfile.balance - job.price
      },
      {
        where: {
          id: clientProfile.id,
          [Op.and]: [
            { balance: clientProfile.balance },
            { balance: { [Op.gte]: job.price } }
          ]
        }
      },
      { transaction: t }
    )

    if (!clientUpdateResult) {
      throw new Error('Balance of client profile was not correctly updated')
    }

    const contractorUpdateResult = await Profile.update(
      {
        balance: contractorProfile.balance + job.price
      },
      {
        where: {
          id: contractorProfile.id,
          balance: contractorProfile.balance
        }
      },
      { transaction: t }
    )

    if (!contractorUpdateResult) {
      throw new Error('Balance of contractor profile was not correctly updated')
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

module.exports = {
  getUserUnpaidJobs,
  pay
}
