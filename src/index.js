const express = require('express')
const { v4 : uuidv4} = require('uuid')

const app = express()

app.use(express.json())

const customers = []

function verifyIfExitsAccountCPF(req, res, next) {
  const { cpf } = req.headers

  const customer = customers.find(customer => customer.cpf === cpf)

  if (!customer) {
    return res.status(400).send({error: 'Customer not found'})
  }

  res.customer = customer

  return next()
}

app.post('/account', (req, res) => {
  const { cpf, name} = req.body

  const customersAlreadyExist = customers.some(customer => customer.cpf === cpf)

  if (customersAlreadyExist) {
    return res.status(400).json({error: 'Customer already exist!'})
  }
  customers.push({
    cpf,
    name,
    id: uuidv4(),
    statement: []
  })

  return res.status(201).send()
})

app.get('/statement', verifyIfExitsAccountCPF, (req, res) => {
 const { customer } = res

  return res.status(200).json(customer.statement)
})

app.post('/deposit', verifyIfExitsAccountCPF, (req, res) => {
  const { description, amount } = req.body
  const { customer } = res

  const statementOperation = {
    description,
    amount,
    created_at: new Date(),
    type: 'credit'
  }

  customer.statement.push(statementOperation)

  return res.status(201).send()
})

app.listen(3000)

