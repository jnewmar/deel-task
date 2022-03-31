const { deposit } = require('../balances')
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
const loggedContractorId = 6
const mockContractor = {
  id: loggedContractorId,
  firstName: 'Linus',
  lastName: 'Torvalds',
  profession: 'Programmer',
  balance: 1214,
  type: 'contractor'
}
const targetId = 7
const mockTarget = {
  id: targetId,
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
  }
}

test('Function deposit should send status 400 when the value to deposit is negative', async () => {
  req = {
    ...req,
    body: {
      value: -100
    },
    params: {
      user_id: targetId
    },
    profile: mockClient
  }
  when(findOneProfile).calledWith({ where: { id: loggedClientId } }).mockResolvedValue(mockClient)
  when(findOneJob).calledWith(expect.anything()).mockResolvedValue({ total: 200 })
  when(appGet).calledWith('models').mockImplementation(() => models)
  when(appGet).calledWith('sequelize').mockImplementation(() => mockSequelize)
  when(findOneProfile).calledWith({ where: { id: targetId } }).mockResolvedValue(mockTarget)

  await deposit(req, res)
  expect(mockStatusFunction).toBeCalledWith(400)
  expect(mockJsonFunction).toBeCalledWith({
    status: 'fail',
    error: 'Invalid value to deposit'
  })
})

test('Function deposit should send status 400 when the value to deposit is invalid', async () => {
  req = {
    ...req,
    body: {
      value: 'invalid value'
    },
    params: {
      user_id: targetId
    },
    profile: mockClient
  }
  when(findOneProfile).calledWith({ where: { id: loggedClientId } }).mockResolvedValue(mockClient)
  when(findOneJob).calledWith(expect.anything()).mockResolvedValue({ total: 200 })
  when(appGet).calledWith('models').mockImplementation(() => models)
  when(appGet).calledWith('sequelize').mockImplementation(() => mockSequelize)
  when(findOneProfile).calledWith({ where: { id: targetId } }).mockResolvedValue(mockTarget)

  await deposit(req, res)
  expect(mockStatusFunction).toBeCalledWith(400)
  expect(mockJsonFunction).toBeCalledWith({
    status: 'fail',
    error: 'Invalid value to deposit'
  })
})

test('Function deposit should send status 404 when Informed user was not found', async () => {
  req = {
    ...req,
    body: {
      value: 10000
    },
    params: {
      user_id: targetId
    },
    profile: mockClient
  }
  when(findOneProfile).calledWith({ where: { id: loggedClientId } }).mockResolvedValue(mockClient)
  when(findOneJob).calledWith(expect.anything()).mockResolvedValue({ total: 200 })
  when(appGet).calledWith('models').mockImplementation(() => models)
  when(appGet).calledWith('sequelize').mockImplementation(() => mockSequelize)
  when(findOneProfile).calledWith({ where: { id: targetId } }).mockResolvedValue(null)

  await deposit(req, res)
  expect(mockStatusFunction).toBeCalledWith(404)
  expect(mockJsonFunction).toBeCalledWith({
    status: 'fail',
    error: 'Informed user not found'
  })
})

test('Function deposit should send status 400 when client try to deposit more than 25% his total of jobs to pay', async () => {
  req = {
    ...req,
    body: {
      value: 2600
    },
    params: {
      user_id: targetId
    },
    profile: mockClient
  }

  when(findOneProfile).calledWith({ where: { id: loggedClientId } }).mockResolvedValue(mockClient)
  when(findOneJob).calledWith(expect.anything()).mockResolvedValue({ total: 100 })
  when(appGet).calledWith('models').mockImplementation(() => models)
  when(appGet).calledWith('sequelize').mockImplementation(() => mockSequelize)
  when(findOneProfile).calledWith({ where: { id: targetId } }).mockResolvedValue(mockTarget)

  await deposit(req, res)
  expect(mockStatusFunction).toBeCalledWith(400)
  expect(mockJsonFunction).toBeCalledWith({
    status: 'fail',
    error: 'Client can\'t deposit more than 25% his total of jobs to pay'
  })
})

test('Function deposit should send status 400 when contractor doen\'t have sufficient balance to deposit', async () => {
  req = {
    ...req,
    body: {
      value: 10000
    },
    params: {
      user_id: targetId
    },
    profile: mockContractor
  }

  when(findOneProfile).calledWith({ where: { id: loggedContractorId } }).mockResolvedValue({
    ...mockContractor,
    balance: 0
  })
  when(findOneJob).calledWith(expect.anything()).mockResolvedValue({ total: 100 })
  when(appGet).calledWith('models').mockImplementation(() => models)
  when(appGet).calledWith('sequelize').mockImplementation(() => mockSequelize)
  when(findOneProfile).calledWith({ where: { id: targetId } }).mockResolvedValue(mockTarget)

  await deposit(req, res)
  expect(mockStatusFunction).toBeCalledWith(400)
  expect(mockJsonFunction).toBeCalledWith({
    status: 'fail',
    error: 'Insufficient balance to deposit'
  })
})

test('Function deposit should send status 500 when Balance of source profile was not correctly updated', async () => {
  req = {
    ...req,
    body: {
      value: 1000
    },
    params: {
      user_id: targetId
    },
    profile: mockClient
  }

  when(findOneProfile).calledWith({ where: { id: loggedContractorId } }).mockResolvedValue({
    ...mockContractor,
    balance: 5000
  })
  when(findOneJob).calledWith(expect.anything()).mockResolvedValue({ total: 100 })
  when(appGet).calledWith('models').mockImplementation(() => models)
  when(appGet).calledWith('sequelize').mockImplementation(() => mockSequelize)
  when(findOneProfile).calledWith({ where: { id: targetId } }).mockResolvedValue(mockTarget)
  when(updateProfile).calledWith(expect.anything())
    .mockRejectedValueOnce(new Error('Balance of source profile was not correctly updated'))
    .mockResolvedValueOnce([1])

  await deposit(req, res)
  expect(mockStatusFunction).toBeCalledWith(500)
  expect(mockJsonFunction).toBeCalledWith({
    status: 'fail',
    error: 'Balance of source profile was not correctly updated'
  })
  expect(mockRollback).toBeCalledTimes(1)
})

test('Function deposit should send status 500 when Balance of target profile was not correctly updated', async () => {
  req = {
    ...req,
    body: {
      value: 1000
    },
    params: {
      user_id: targetId
    },
    profile: mockClient
  }

  when(findOneProfile).calledWith({ where: { id: loggedContractorId } }).mockResolvedValue({
    ...mockContractor,
    balance: 5000
  })
  when(findOneJob).calledWith(expect.anything()).mockResolvedValue({ total: 100 })
  when(appGet).calledWith('models').mockImplementation(() => models)
  when(appGet).calledWith('sequelize').mockImplementation(() => mockSequelize)
  when(findOneProfile).calledWith({ where: { id: targetId } }).mockResolvedValue(mockTarget)

  when(updateProfile).calledWith(expect.anything())
    .mockResolvedValueOnce([1])
    .defaultRejectedValue(new Error('Balance of target profile was not correctly updated'))

  await deposit(req, res)
  expect(mockStatusFunction).toBeCalledWith(500)
  expect(mockJsonFunction).toBeCalledWith({
    status: 'fail',
    error: 'Balance of target profile was not correctly updated'
  })
  expect(mockRollback).toBeCalledTimes(1)
})

test('Function deposit should send status 200 operation was OK', async () => {
  req = {
    ...req,
    body: {
      value: 1000
    },
    params: {
      user_id: targetId
    },
    profile: mockClient
  }

  when(findOneProfile).calledWith({ where: { id: loggedContractorId } }).mockResolvedValue({
    ...mockContractor,
    balance: 5000
  })
  when(findOneJob).calledWith(expect.anything()).mockResolvedValue({ total: 100 })
  when(appGet).calledWith('models').mockImplementation(() => models)
  when(appGet).calledWith('sequelize').mockImplementation(() => mockSequelize)
  when(findOneProfile).calledWith({ where: { id: targetId } }).mockResolvedValue(mockTarget)
  when(updateProfile).calledWith(expect.anything()).defaultResolvedValue([1])

  await deposit(req, res)
  expect(mockStatusFunction).toBeCalledWith(200)
  expect(mockJsonFunction).toBeCalledWith({
    status: 'ok'
  })
  expect(mockCommit).toBeCalledTimes(1)
})
