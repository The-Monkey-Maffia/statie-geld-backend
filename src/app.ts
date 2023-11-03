import * as mysql from "mysql" 
import express from "express"
import dotenv from 'dotenv';
import { Database } from "./services/database";

const app = express()
const port = 3000

dotenv.config();



const database = new Database(
  process.env.HOST!,
  process.env.USERNAME!,
  process.env.PASSWORD!,
  process.env.DATABASE!
)
const connection = database.connect()


app.get('/get/goededoel/:naam', (req, res) => {
  
})

app.post('/post/goededoelen', () => {
})

app.get('/get/drinks', () => {

connection.connect((err) => {
    if (err) {
        console.error('Error connecting to the database:', err.message);
        return;
    }
    console.log('Connected to the database');
});
})

app.post('/post/drinks', () => {

})


app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})
