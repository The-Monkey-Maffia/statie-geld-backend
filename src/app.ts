const express = require('express')
const app = express()
const port = 3000

const mysql = require("mysql")

const connection = mysql.CreateConnection({
  host: "",
  user: "",
  password: "",
  database: "",
})

connection.connect()

app.get('/', (req: any, res: any) => {
  res.send('Hello World!')
})

app.get("/Product/Get", (req: any, res:any) =>{

})
connection.end()