exports.getUserContract = async (req, res, next) => {
  const { Contract } = req.app.get('models')
  const contract = await Contract.findOne({ include: ['Jobs'], where: { id: req.params.id } })
  if (!contract) return res.status(404).end()
  if (![contract.ClientId, contract.ContractorId].includes(req.profile.id)) return res.status(403).end()
  res.json(contract)
}

exports.getUserContracts = async (req, res, next) => {
  const where = {
    status: 'in_progress'
  }
  const profileTypeField = (req.profile.type === 'contractor') ? 'ContractorId' : 'ClientId'
  where[profileTypeField] = req.profile.id
  const { Contract } = req.app.get('models')
  const contracts = await Contract.findAll({ include: ['Jobs'], where })
  res.json(contracts)
}
