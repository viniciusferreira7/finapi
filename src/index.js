const express = require('express')
const { v4 : uuidv4} = require('uuid')

const app = express()

app.use(express.json())

const customers = []

app.post('/account', (req, res) => {
  const { cpf, name} = req.body

  const customersAlreadyExist = customers.some(customers => customers.cpf === cpf)

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

app.get('/statement/:cpf',(req, res) => {
  const { cpf } = req.params;

  const customer = customers.find(customer => customer.cpf === cpf)

  return res.status(200).json(customer.statement)
})

app.listen(3000)

