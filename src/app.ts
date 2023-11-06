import express from "express"
import dotenv from 'dotenv';
import { Database } from "./services/database";
import bodyParser from 'body-parser';
import { RowDataPacket } from "mysql2";



const app = express()
const port = 3000
// Parse application/json
app.use(bodyParser.json());

// Parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: true }));
dotenv.config();

const database = new Database(
  process.env.HOST!,
  process.env.GEBRUIKER!,
  process.env.PASSWORD!,
  process.env.DATABASE!
)
const connection = database.connect()


app.get('/get/goededoel/:naam?', (req: express.Request, res: express.Response) => {
  if (!req.params.naam) {
    connection.query('SELECT *  FROM charity', (error, results) => {
      if (error) {
        res.status(500).json({ error: 'Error in query execution'})
        return
      }
      res.json({ data: results})
    })
  } else {
    const name = req.params.naam;
    console.log(name)
    connection.query('SELECT * FROM charity WHERE name = ?', [name], (error, results) => {
      if (error) {
        res.status(500).json({ error: 'Error in query execution' });
        return;
      }
      res.json({ data: results }); // Send the results as JSON
    })
  }
})

app.post('/post/vote/', (req: express.Request, res: express.Response) => {
  const hardware_id = parseInt(req.body.hardware_id)
  const Vote_name = req.body.Vote_name
  console.log(hardware_id)
  connection.query("SELECT * FROM users where hardware_id = ?", [hardware_id], (error, results: RowDataPacket[])=>{
    console.log(results)
    if(results.length <= 0){
      connection.query("INSERT INTO users (`hardware_id`) VALUES ('?')", [hardware_id], (error, results)=>{
        if(error){
          console.log(error)
          res.status(500).json({ error: 'Error in query execution by creating the user' });
          return;
        } else{
          connection.query("UPDATE charity SET aantal_votes = aantal_votes + 1 WHERE name = ? ", [Vote_name], (error, results)=> {
            if(error){
              res.status(500).json({ error: 'Error in query execution' });
              return;
            } 
            res.json({ data: results }); // Send the results as JSON
          })
        }
      })
    } else{
      res.status(500).json({ error: 'you have already voted' });
    }
  })
})

app.get('/get/drinks/:barcode_id', (req: express.Request, res: express.Response) => {

  const barcode_id = req.params.barcode_id;
  console.log(barcode_id)
  connection.query('SELECT * FROM products WHERE barcode_id = ?', [barcode_id], (error, results) => {
    console.log(error)
    if (error) {
      res.status(500).json({ error: 'Error in query execution' });
      return;
    }
    res.json({ data: results }); // Send the results as JSON
  })
})

app.post('/post/drinks', () => {

})


app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})
