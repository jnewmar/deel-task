const { getUserContract, getUserContracts } = require('../contracts')
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

const Profile = {
  findOne: findOneProfile
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
const mockContractId = 1
const mockContract = {
  id: mockContractId,
  terms: 'bla bla bla',
  status: 'terminated',
  ClientId: 1,
  ContractorId: 5
}
const otherMockContract = {
  id: 2,
  terms: 'bla bla bla',
  status: 'terminated',
  ClientId: 2,
  ContractorId: 5
}

test('Function getUserContract should send status 404 when contract is not found', async () => {
  req = {
    ...req,
    params: {
      id: mockContractId
    }
  }
  when(findOneProfile).calledWith({ where: { id: loggedUserId } }).mockResolvedValue(mockProfile)
  when(findOneContract).defaultResolvedValue(null)
  when(appGet).calledWith('models').mockImplementation(() => models)

  await getUserContract(req, res)
  expect(appGet).toBeCalledTimes(1)
  expect(findOneContract).toBeCalledTimes(1)
  expect(mockStatusFunction).toBeCalledTimes(1)
  expect(mockStatusFunction).toBeCalledWith(404)
})

test('Function getUserContract should send status 403 when logged user is not in the contract', async () => {
  req = {
    ...req,
    params: {
      id: mockContractId
    }
  }
  when(findOneProfile).calledWith({ where: { id: loggedUserId } }).mockResolvedValue(mockProfile)
  when(findOneContract).defaultResolvedValue(otherMockContract)
  when(appGet).calledWith('models').mockImplementation(() => models)

  await getUserContract(req, res)
  expect(appGet).toBeCalledTimes(1)
  expect(findOneContract).toBeCalledTimes(1)
  expect(mockStatusFunction).toBeCalledTimes(1)
  expect(mockStatusFunction).toBeCalledWith(403)
})

test('Function getUserContract should send the the contract when the contract exists and the logged user is in the contract', async () => {
  req = {
    ...req,
    params: {
      id: mockContractId
    }
  }
  when(findOneProfile).calledWith({ where: { id: loggedUserId } }).mockResolvedValue(mockProfile)
  when(findOneContract).defaultResolvedValue(mockContract)
  when(appGet).calledWith('models').mockImplementation(() => models)

  await getUserContract(req, res)

  expect(appGet).toBeCalledTimes(1)
  expect(findOneContract).toBeCalledTimes(1)
  expect(mockJsonFunction).toBeCalledTimes(1)
  expect(mockJsonFunction).toBeCalledWith(mockContract)
})

test('Function getUserContracts should send the the list contract when the contract of the logged client', async () => {
  const mockAllContract = [
    mockContract,
    {
      ...mockContract,
      id: 3
    }
  ]
  when(findOneProfile).calledWith({ where: { id: loggedUserId } }).mockResolvedValue(mockProfile)
  when(findAllContracts).defaultResolvedValue(mockAllContract)
  when(appGet).calledWith('models').mockImplementation(() => models)

  when(mockJsonFunction).expectCalledWith(mockAllContract)
  await getUserContracts(req, res)
  expect(appGet).toBeCalledTimes(1)
  expect(findAllContracts).toBeCalledTimes(1)
  expect(mockJsonFunction).toBeCalledTimes(1)
  expect(mockJsonFunction).toBeCalledWith(mockAllContract)
})

test('Function getUserContracts should send the the list contract when the contract of the logged contractor', async () => {
  const mockAllContract = [
    mockContract,
    {
      ...mockContract,
      id: 3
    }
  ]
  when(findOneProfile).calledWith({ where: { id: loggedUserId } }).mockResolvedValue({
    ...mockProfile,
    type: 'contractor'
  })
  when(findAllContracts).defaultResolvedValue(mockAllContract)
  when(appGet).calledWith('models').mockImplementation(() => models)

  await getUserContracts(req, res)
  expect(appGet).toBeCalledTimes(1)
  expect(findAllContracts).toBeCalledTimes(1)
  expect(mockJsonFunction).toBeCalledTimes(1)
  expect(mockJsonFunction).toBeCalledWith(mockAllContract)
})
