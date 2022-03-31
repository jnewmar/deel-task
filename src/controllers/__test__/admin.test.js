const { getBestClients, getBestContractors } = require('../admin')
const { when } = require('jest-when')

const findOneProfile = jest.fn()
const findOneJob = jest.fn()
const findOneContract = jest.fn()
const findAllContracts = jest.fn()
const countProfile = jest.fn()

const Profile = {
  findOne: findOneProfile,
  count: countProfile
}
const Job = {
  findOne: findOneJob
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

const mockQuery = jest.fn()

const mockStatusFunction = jest.fn().mockReturnThis()
const mockJsonFunction = jest.fn().mockReturnThis()
const res = {
  status: mockStatusFunction,
  json: mockJsonFunction,
  end: jest.fn().mockReturnThis()
}
const loggedUserId = 1
const mockProfile = {
  id: loggedUserId,
  firstName: 'Mock Harry',
  lastName: 'Potter',
  profession: 'Wizard',
  balance: 1150,
  type: 'client'
}
const appGet = jest.fn()
let req = {
  app: {
    get: appGet
  },
  profile: mockProfile
}
const mockTopClients = [
  {
    id: 4,
    firstName: 'Ash',
    lastName: 'Kethcum',
    totalPaid: 2220
  },
  {
    id: 1,
    firstName: 'Harry',
    lastName: 'Potter',
    totalPaid: 642
  },
  {
    id: 2,
    firstName: 'Mr',
    lastName: 'Robot',
    totalPaid: 442
  },
  {
    id: 3,
    firstName: 'John',
    lastName: 'Snow',
    totalPaid: 200
  },
  {
    id: 9,
    firstName: 'Harry',
    lastName: 'Potter',
    totalPaid: 0
  },
  {
    id: 10,
    firstName: 'Mr',
    lastName: 'Robot',
    totalPaid: 0
  },
  {
    id: 11,
    firstName: 'John',
    lastName: 'Snow',
    totalPaid: 0
  },
  {
    id: 12,
    firstName: 'Ash',
    lastName: 'Kethcum',
    totalPaid: 0
  }
]

const mockTopContractors = [
  {
    id: 7,
    firstName: 'Alan',
    lastName: 'Turing',
    totalPaid: 2220
  },
  {
    id: 6,
    firstName: 'Linus',
    lastName: 'Torvalds',
    totalPaid: 663
  },
  {
    id: 5,
    firstName: 'John',
    lastName: 'Lenon',
    totalPaid: 421
  },
  {
    id: 8,
    firstName: 'Aragorn',
    lastName: 'II Elessar Telcontarvalds',
    totalPaid: 200
  },
  {
    id: 13,
    firstName: 'John',
    lastName: 'Lenon',
    totalPaid: 0
  },
  {
    id: 14,
    firstName: 'Linus',
    lastName: 'Torvalds',
    totalPaid: 0
  },
  {
    id: 15,
    firstName: 'Alan',
    lastName: 'Turing',
    totalPaid: 0
  },
  {
    id: 16,
    firstName: 'Aragorn',
    lastName: 'II Elessar Telcontarvalds',
    totalPaid: 0
  }
]
test('Function getBestClients should send status 400 when start date is invalid', async () => {
  req = {
    ...req,
    query: {
      start: 'invalid date',
      end: '2020-09-17'
    }
  }
  await getBestClients(req, res)
  expect(mockStatusFunction).toBeCalledWith(400)
  expect(mockJsonFunction).toBeCalledWith({
    status: 'fail',
    error: 'Invalid start date'
  })
})

test('Function getBestClients should send status 400 when end date is invalid', async () => {
  req = {
    ...req,
    query: {
      start: '2020-09-17',
      end: 'invalid date'
    }
  }
  await getBestClients(req, res)
  expect(mockStatusFunction).toBeCalledWith(400)
  expect(mockJsonFunction).toBeCalledWith({
    status: 'fail',
    error: 'Invalid end date'
  })
})

test('Function getBestClients should send status 400 when end date is before start date', async () => {
  req = {
    ...req,
    query: {
      start: '2020-09-18',
      end: '2020-09-17'
    }
  }
  await getBestClients(req, res)
  expect(mockStatusFunction).toBeCalledWith(400)
  expect(mockJsonFunction).toBeCalledWith({
    status: 'fail',
    error: 'End date should be after start date'
  })
})

test('when Function getBestClients is called query method should be called with the Best Clients query', async () => {
  req = {
    ...req,
    query: {
      start: '2020-09-14',
      end: '2020-09-17',
      limit: 10
    }
  }
  when(appGet).calledWith('models').mockImplementation(() => models)
  when(appGet).calledWith('sequelize').mockImplementation(() => ({
    query: mockQuery,
    QueryTypes: { SELECT: 'SELECT' }
  }))
  when(mockQuery).mockResolvedValue(mockTopClients)
  when(countProfile).mockResolvedValue(mockTopClients.length)
  await getBestClients(req, res)
  expect(mockStatusFunction).toBeCalledWith(200)
  expect(mockJsonFunction).toBeCalledWith({
    total: mockTopClients.length,
    topUsers: mockTopClients
  })
})

test('Function getBestContractors should send status 400 when start date is invalid', async () => {
  req = {
    ...req,
    query: {
      start: 'invalid date',
      end: '2020-09-17'
    }
  }
  await getBestContractors(req, res)
  expect(mockStatusFunction).toBeCalledWith(400)
  expect(mockJsonFunction).toBeCalledWith({
    status: 'fail',
    error: 'Invalid start date'
  })
})

test('Function getBestContractors should send status 400 when end date is invalid', async () => {
  req = {
    ...req,
    query: {
      start: '2020-09-17',
      end: 'invalid date'
    }
  }
  await getBestContractors(req, res)
  expect(mockStatusFunction).toBeCalledWith(400)
  expect(mockJsonFunction).toBeCalledWith({
    status: 'fail',
    error: 'Invalid end date'
  })
})

test('Function getBestContractors should send status 400 when end date is before start date', async () => {
  req = {
    ...req,
    query: {
      start: '2020-09-18',
      end: '2020-09-17'
    }
  }
  await getBestContractors(req, res)
  expect(mockStatusFunction).toBeCalledWith(400)
  expect(mockJsonFunction).toBeCalledWith({
    status: 'fail',
    error: 'End date should be after start date'
  })
})

test('when Function getBestContractors is called query method should be called with the Best Clients query', async () => {
  req = {
    ...req,
    query: {
      start: '2020-09-14',
      end: '2020-09-17',
      limit: 10
    }
  }
  when(appGet).calledWith('models').mockImplementation(() => models)
  when(appGet).calledWith('sequelize').mockImplementation(() => ({
    query: mockQuery,
    QueryTypes: { SELECT: 'SELECT' }
  }))
  when(mockQuery).mockResolvedValue(mockTopContractors)
  when(countProfile).mockResolvedValue(mockTopContractors.length)
  await getBestContractors(req, res)
  expect(mockStatusFunction).toBeCalledWith(200)
  expect(mockJsonFunction).toBeCalledWith({
    total: mockTopContractors.length,
    topUsers: mockTopContractors
  })
})
