import express from "express"
import dotenv from 'dotenv';
import { Database } from "./services/database";

const app = express()
const port = 3000

dotenv.config();



const database = new Database(
  process.env.HOST!,
  process.env.USER!,
  process.env.PASSWORD!,
  process.env.DATABASE!
)
const connection = database.connect()


app.get('/get/goededoel/:naam', (req, res) => {
  
})

app.post('/post/goededoelen', () => {

})

app.get('/get/drinks', () => {

})

app.post('/post/drinks', () => {

})


app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})
