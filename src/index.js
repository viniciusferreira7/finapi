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

  req.customer = customer

  return next()
}

function getBalance(statement) {
 const balance = statement.reduce((acc, operation) => {
    if (operation.type === 'credit') {
      return acc + operation.amount
    } else {
      return acc - operation.amount
    }
  }, 0)

  return balance
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
 const { customer } = req

  return res.status(200).json(customer.statement)
})

app.post('/deposit', verifyIfExitsAccountCPF, (req, res) => {
  const { description, amount } = req.body
  const { customer } = req

  const statementOperation = {
    description,
    amount,
    created_at: new Date(),
    type: 'credit'
  }

  customer.statement.push(statementOperation)

  return res.status(201).send()
})

app.post('/withdraw', verifyIfExitsAccountCPF, (req, res) => {
  const { amount } = req.body
  const { customer } = req

  const balance = getBalance(customer.statement)

  if(balance < amount) {
    return res.status(400).json({error: 'Insufficient founds'})
  }

  const stateOperation = {
    amount,
    created_at: new Date(),
    type: 'debit'
  }

  customer.statement.push(stateOperation)

  return res.status(201).send()
})

app.get('/statement/date', verifyIfExitsAccountCPF, (req, res) => {
  const { customer } = req
  const { date } = req.query

  const dateFormat = new Date(date + " 00:00");

  const statement = customer.statement.filter((statement) => {
    return statement.created_at.toDateString() === new Date(dateFormat).toDateString()
  })
   return res.json(statement)
})

app.put("/account", verifyIfExitsAccountCPF, (req, res) => {
  const { name } = req.body
  const { customer } = req

  customer.name = name

  return res.status(201).send()
})

app.get('/account', verifyIfExitsAccountCPF, (req, res) => {
  const { customer } = req

  return res.status(200).json(customer)
})

app.listen(3000)  

