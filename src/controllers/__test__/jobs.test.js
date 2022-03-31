const { getUserUnpaidJobs, pay } = require('../jobs')
const { when } = require('jest-when')

const mockStatusFunction = jest.fn().mockReturnThis()
const mockJsonFunction = jest.fn().mockReturnThis()

const res = {
  status: mockStatusFunction,
  json: mockJsonFunction,
  end: jest.fn().mockReturnThis()
}
const findOneProfile = jest.fn()
const findOneJob = jest.fn()
const findOneContract = jest.fn()
const findAllContracts = jest.fn()
const findAllJobs = jest.fn()
const updateJob = jest.fn()
const updateProfile = jest.fn()
const mockCommit = jest.fn()
const mockRollback = jest.fn()

const mockTransaction = {
  commit: mockCommit,
  rollback: mockRollback
}
const mockSequelize = {
  fn: jest.fn(),
  col: jest.fn(),
  transaction: () => mockTransaction
}

const Profile = {
  findOne: findOneProfile,
  update: updateProfile
}
const Job = {
  findOne: findOneJob,
  findAll: findAllJobs,
  update: updateJob
}
const Contract = {
  findOne: findOneContract,
  findAll: findAllContracts
}
const models = {
  Profile,
  Contract,
  Job
}

const loggedClientId = 2
const mockClient = {
  id: loggedClientId,
  firstName: 'Mock Harry',
  lastName: 'Potter',
  profession: 'Wizard',
  balance: 1150,
  type: 'client'
}
const loggedContractorId = 7
const mockContractor = {
  id: loggedContractorId,
  firstName: 'Alan',
  lastName: 'Turing',
  profession: 'Programmer',
  balance: 22,
  type: 'contractor'
}

const appGet = jest.fn()
let req = {
  app: {
    get: appGet
  },
  profile: mockClient
}
const mockAllClientUnpaidJobs = [
  {
    id: 3,
    description: 'work',
    price: 202,
    paid: null,
    paymentDate: null,
    createdAt: '2022-03-29T14:13:12.389Z',
    updatedAt: '2022-03-29T14:13:12.389Z',
    ContractId: 3,
    Contract: {
      id: 3,
      terms: 'bla bla bla',
      status: 'in_progress',
      createdAt: '2022-03-29T14:13:12.387Z',
      updatedAt: '2022-03-29T14:13:12.387Z',
      ContractorId: 6,
      ClientId: 2
    }
  },
  {
    id: 4,
    description: 'work',
    price: 200,
    paid: null,
    paymentDate: null,
    createdAt: '2022-03-29T14:13:12.389Z',
    updatedAt: '2022-03-29T14:13:12.389Z',
    ContractId: 4,
    Contract: {
      id: 4,
      terms: 'bla bla bla',
      status: 'in_progress',
      createdAt: '2022-03-29T14:13:12.388Z',
      updatedAt: '2022-03-29T14:13:12.388Z',
      ContractorId: 7,
      ClientId: 2
    }
  }
]
const mockAllContractorUnpaidJobs = [
  {
    id: 4,
    description: 'work',
    price: 200,
    paid: null,
    paymentDate: null,
    createdAt: '2022-03-29T14:13:12.389Z',
    updatedAt: '2022-03-29T14:13:12.389Z',
    ContractId: 4,
    Contract: {
      id: 4,
      terms: 'bla bla bla',
      status: 'in_progress',
      createdAt: '2022-03-29T14:13:12.388Z',
      updatedAt: '2022-03-29T14:13:12.388Z',
      ContractorId: 7,
      ClientId: 2
    }
  },
  {
    id: 5,
    description: 'work',
    price: 200,
    paid: null,
    paymentDate: null,
    createdAt: '2022-03-29T14:13:12.389Z',
    updatedAt: '2022-03-29T14:13:12.389Z',
    ContractId: 7,
    Contract: {
      id: 7,
      terms: 'bla bla bla',
      status: 'in_progress',
      createdAt: '2022-03-29T14:13:12.388Z',
      updatedAt: '2022-03-29T14:13:12.388Z',
      ContractorId: 7,
      ClientId: 4
    }
  }
]

test('Function getUserUnpaidJobs should send the list of Unpaid Jobs for a logged client', async () => {
  when(findOneProfile).calledWith({ where: { id: loggedClientId } }).mockResolvedValue(mockClient)
  when(findAllJobs).calledWith(expect.anything()).mockResolvedValue(mockAllClientUnpaidJobs)
  when(appGet).calledWith('models').mockImplementation(() => models)

  await getUserUnpaidJobs(req, res)
  expect(mockJsonFunction).toBeCalledWith(mockAllClientUnpaidJobs)
})

test('Function getUserUnpaidJobs should send the list of Unpaid Jobs for a logged contractor', async () => {
  req = {
    ...req,
    profile: mockContractor
  }
  when(findOneProfile).calledWith(loggedContractorId).mockResolvedValue(mockContractor)
  when(findAllJobs).calledWith(expect.anything()).mockResolvedValue(mockAllContractorUnpaidJobs)
  when(appGet).calledWith('models').mockImplementation(() => models)

  await getUserUnpaidJobs(req, res)
  expect(mockJsonFunction).toBeCalledWith(mockAllContractorUnpaidJobs)
})

const mockJobId = 3
const mockContractorId = 6
const mockJob = {
  id: 3,
  description: 'work',
  price: 202,
  paid: null,
  paymentDate: null,
  createdAt: '2022-03-29T14:13:12.389Z',
  updatedAt: '2022-03-29T14:13:12.389Z',
  ContractId: 3,
  Contract: {
    id: 3,
    terms: 'bla bla bla',
    status: 'in_progress',
    createdAt: '2022-03-29T14:13:12.387Z',
    updatedAt: '2022-03-29T14:13:12.387Z',
    ContractorId: mockContractorId,
    ClientId: 2
  }
}
const mockContractorFromContract = {
  id: mockContractorId,
  firstName: 'Alan',
  lastName: 'Turing',
  profession: 'Programmer',
  balance: 22,
  type: 'contractor'
}

test('Function pay should send status 404 when job to pay was not found', async () => {
  req = {
    ...req,
    params: {
      job_id: mockJobId
    }
  }
  when(findOneProfile).calledWith({ where: { id: loggedClientId } }).mockResolvedValue(mockClient)
  when(findOneJob).calledWith(expect.anything()).mockResolvedValue(null)
  when(appGet).calledWith('models').mockImplementation(() => models)

  await pay(req, res)
  expect(mockStatusFunction).toBeCalledWith(404)
  expect(mockJsonFunction).toBeCalledWith({
    status: 'fail',
    error: 'Job not found'
  })
})

test('Function pay should send status 400 when logged user is not a client', async () => {
  req = {
    ...req,
    params: {
      job_id: mockJobId
    },
    profile: mockContractor
  }
  when(findOneProfile).calledWith({ where: { id: loggedContractorId } }).mockResolvedValue(mockContractor)
  when(findOneJob).calledWith(expect.anything()).mockResolvedValue(mockJob)
  when(findOneProfile).calledWith({ where: { id: mockContractorId } }).mockResolvedValue(mockContractorFromContract)
  when(appGet).calledWith('models').mockImplementation(() => models)

  await pay(req, res)
  expect(mockStatusFunction).toBeCalledWith(400)
  expect(mockJsonFunction).toBeCalledWith({
    status: 'fail',
    error: 'Operation not allowed for this type of user'
  })
})

test('Function pay should send status 400 when job was already paid', async () => {
  req = {
    ...req,
    params: {
      job_id: mockJobId
    },
    profile: mockClient
  }
  when(findOneProfile).calledWith({ where: { id: loggedClientId } }).mockResolvedValue(mockClient)
  when(findOneJob).calledWith(expect.anything()).mockResolvedValue({
    ...mockJob,
    paid: true,
    paymentDate: '2022-03-29T14:13:12.389Z'
  })
  when(findOneProfile).calledWith({ where: { id: mockContractorId } }).mockResolvedValue(mockContractorFromContract)
  when(findOneProfile).calledWith({ where: { id: mockContractorId } }).mockResolvedValue(mockContractorFromContract)
  when(appGet).calledWith('models').mockImplementation(() => models)

  await pay(req, res)
  expect(mockStatusFunction).toBeCalledWith(400)
  expect(mockJsonFunction).toBeCalledWith({
    status: 'fail',
    error: 'Job already paid'
  })
})

test('Function pay should send status 400 when logged client doens\'t hava ballance to pay', async () => {
  req = {
    ...req,
    params: {
      job_id: mockJobId
    },
    profile: mockClient
  }
  when(findOneProfile).calledWith({ where: { id: loggedClientId } }).mockResolvedValue({
    ...mockClient,
    balance: 0
  })
  when(findOneJob).calledWith(expect.anything()).mockResolvedValue(mockJob)
  when(findOneProfile).calledWith({ where: { id: mockContractorId } }).mockResolvedValue(mockContractorFromContract)
  when(appGet).calledWith('models').mockImplementation(() => models)

  await pay(req, res)
  expect(mockStatusFunction).toBeCalledWith(400)
  expect(mockJsonFunction).toBeCalledWith({
    status: 'fail',
    error: 'Insufficient balance to pay'
  })
})

test('Function pay should send status 404 when contract associated with the job not found', async () => {
  req = {
    ...req,
    params: {
      job_id: mockJobId
    },
    profile: mockClient
  }
  when(findOneProfile).calledWith({ where: { id: loggedClientId } }).mockResolvedValue(mockClient)
  when(findOneJob).calledWith(expect.anything()).mockResolvedValue({
    ...mockJob,
    Contract: null
  })
  when(findOneProfile).calledWith({ where: { id: mockContractorId } }).mockResolvedValue(mockContractorFromContract)
  when(appGet).calledWith('models').mockImplementation(() => models)

  await pay(req, res)
  expect(mockStatusFunction).toBeCalledWith(404)
  expect(mockJsonFunction).toBeCalledWith({
    status: 'fail',
    error: 'Contract associated with the job was not found'
  })
})

test('Function pay should send status 404 when Contractor of the Contract associated with the job was not found', async () => {
  req = {
    ...req,
    params: {
      job_id: mockJobId
    },
    profile: mockClient
  }
  when(findOneProfile).calledWith({ where: { id: loggedClientId } }).mockResolvedValue(mockClient)
  when(findOneJob).calledWith(expect.anything()).mockResolvedValue(mockJob)
  when(findOneProfile).calledWith({ where: { id: mockContractorId } }).mockResolvedValue(null)
  when(appGet).calledWith('models').mockImplementation(() => models)

  await pay(req, res)
  expect(mockStatusFunction).toBeCalledWith(404)
  expect(mockJsonFunction).toBeCalledWith({
    status: 'fail',
    error: 'Contractor of the Contract associated with the job was not found'
  })
})

test('Function pay should send status 403 when logged client is not the client in the contract associated with the job', async () => {
  req = {
    ...req,
    params: {
      job_id: mockJobId
    },
    profile: mockClient
  }
  when(findOneProfile).calledWith({ where: { id: loggedClientId } }).mockResolvedValue(mockClient)
  when(findOneJob).calledWith(expect.anything()).mockResolvedValue({
    ...mockJob,
    Contract: {
      ...mockJob.Contract,
      ClientId: mockClient.id + 1
    }
  })
  when(findOneProfile).calledWith({ where: { id: mockContractorId } }).mockResolvedValue(mockContractorFromContract)
  when(appGet).calledWith('models').mockImplementation(() => models)

  await pay(req, res)
  expect(mockStatusFunction).toBeCalledWith(403)
  expect(mockJsonFunction).toBeCalledWith({
    status: 'fail',
    error: 'Logged client is not the client in the contract associated with the job'
  })
})

test('Function pay should send status 500 when Payment data in Job was not correctly updated', async () => {
  req = {
    ...req,
    params: {
      job_id: mockJobId
    },
    profile: mockClient
  }
  when(findOneProfile).calledWith({ where: { id: loggedClientId } }).mockResolvedValue(mockClient)
  when(findOneJob).calledWith(expect.anything()).mockResolvedValue(mockJob)
  when(findOneProfile).calledWith({ where: { id: mockContractorId } }).mockResolvedValue(mockContractorFromContract)
  when(appGet).calledWith('models').mockImplementation(() => models)
  when(appGet).calledWith('sequelize').mockImplementation(() => mockSequelize)
  when(updateJob).calledWith(expect.anything()).defaultRejectedValue(new Error('Payment data in Job was not correctly updated'))
  when(updateProfile).calledWith(expect.anything()).defaultResolvedValue([1])

  await pay(req, res)
  expect(mockStatusFunction).toBeCalledWith(500)
  expect(mockJsonFunction).toBeCalledWith({
    status: 'fail',
    error: 'Payment data in Job was not correctly updated'
  })
  expect(mockRollback).toBeCalledTimes(1)
})

test('Function pay should send status 500 when Balance of client was not correctly updated', async () => {
  req = {
    ...req,
    params: {
      job_id: mockJobId
    },
    profile: mockClient
  }
  when(findOneProfile).calledWith({ where: { id: loggedClientId } }).mockResolvedValue(mockClient)
  when(findOneJob).calledWith(expect.anything()).mockResolvedValue(mockJob)
  when(findOneProfile).calledWith({ where: { id: mockContractorId } }).mockResolvedValue(mockContractorFromContract)
  when(appGet).calledWith('models').mockImplementation(() => models)
  when(appGet).calledWith('sequelize').mockImplementation(() => mockSequelize)
  when(updateJob).calledWith(expect.anything()).defaultResolvedValue([1])
  when(updateProfile).calledWith(expect.anything())
    .defaultRejectedValue(new Error('Balance of client profile was not correctly updated'))

  await pay(req, res)
  expect(mockStatusFunction).toBeCalledWith(500)
  expect(mockJsonFunction).toBeCalledWith({
    status: 'fail',
    error: 'Balance of client profile was not correctly updated'
  })
  expect(mockRollback).toBeCalledTimes(1)
})

test('Function pay should send status 500 when Balance of contractor profile was not correctly updated', async () => {
  req = {
    ...req,
    params: {
      job_id: mockJobId
    },
    profile: mockClient
  }
  when(findOneProfile).calledWith({ where: { id: loggedClientId } }).mockResolvedValue(mockClient)
  when(findOneJob).calledWith(expect.anything()).mockResolvedValue(mockJob)
  when(findOneProfile).calledWith({ where: { id: mockContractorId } }).mockResolvedValue(mockContractorFromContract)
  when(appGet).calledWith('models').mockImplementation(() => models)
  when(appGet).calledWith('sequelize').mockImplementation(() => mockSequelize)
  when(updateJob).calledWith(expect.anything()).defaultResolvedValue([1])
  when(updateProfile).calledWith(expect.anything())
    .mockResolvedValueOnce([1])
    .defaultRejectedValue(new Error('Balance of contractor profile was not correctly updated'))

  await pay(req, res)
  expect(mockStatusFunction).toBeCalledWith(500)
  expect(mockJsonFunction).toBeCalledWith({
    status: 'fail',
    error: 'Balance of contractor profile was not correctly updated'
  })
  expect(mockRollback).toBeCalledTimes(1)
})

test('Function pay should send status 200 operation was OK', async () => {
  req = {
    ...req,
    params: {
      job_id: mockJobId
    },
    profile: mockClient
  }
  when(findOneProfile).calledWith({ where: { id: loggedClientId } }).mockResolvedValue(mockClient)
  when(findOneJob).calledWith(expect.anything()).mockResolvedValue(mockJob)
  when(findOneProfile).calledWith({ where: { id: mockContractorId } }).mockResolvedValue(mockContractorFromContract)
  when(appGet).calledWith('models').mockImplementation(() => models)
  when(appGet).calledWith('sequelize').mockImplementation(() => mockSequelize)
  when(updateJob).calledWith(expect.anything()).defaultResolvedValue([1])
  when(updateProfile).calledWith(expect.anything()).defaultResolvedValue([1])

  await pay(req, res)
  expect(mockStatusFunction).toBeCalledWith(200)
  expect(mockJsonFunction).toBeCalledWith({
    status: 'ok'
  })
  expect(mockCommit).toBeCalledTimes(1)
})
