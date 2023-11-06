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

// GET: http://localhost:3000/get/goededoel/test
app.get('/get/goededoel/:naam?', (req: express.Request, res: express.Response) => {
  if (!req.params.naam) {
    // Get all from charity
    connection.query('SELECT *  FROM charity', (error, results) => {
      if (error) {
        res.status(500).json({ error: 'Error in query execution' })
        return
      }
      res.json({ data: results })
    })
  } else {
    const name = req.params.naam;
    console.log(name)
    // Get selected charity by name from db
    connection.query('SELECT * FROM charity WHERE name = ?', [name], (error, results) => {
      if (error) {
        res.status(500).json({ error: 'Error in query execution' });
        return;
      }
      res.json({ data: results }); // Send the results as JSON
    })
  }
})


// POST: http://localhost:3000/post/vote/
app.post('/post/vote/', (req: express.Request, res: express.Response) => {
  const hardware_id = parseInt(req.body.hardware_id)
  const Vote_name = req.body.Vote_name
  console.log(hardware_id)
  // Checks if hardware id already exists in DB
  connection.query("SELECT * FROM users where hardware_id = ?", [hardware_id], (error, results: RowDataPacket[]) => {
    console.log(results)
    if (results.length <= 0) {
      // Insert the hardware id in DB
      connection.query("INSERT INTO users (`hardware_id`) VALUES ('?')", [hardware_id], (error, results) => {
        if (error) {
          console.log(error)
          res.status(500).json({ error: 'Error in query execution by creating the user' });
          return;
        } else {
          // Update vote on specific charity
          connection.query("UPDATE charity SET aantal_votes = aantal_votes + 1 WHERE name = ? ", [Vote_name], (error, results) => {
            if (error) {
              res.status(500).json({ error: 'Error in query execution' });
              return;
            }
            res.json({ data: results }); // Send the results as JSON
          })
        }
      })
    } else {
      res.status(500).json({ error: 'you have already voted' });
    }
  })
})

// GET: http://localhost:3000/get/drinks/1334679
app.get('/get/drinks/:barcode_id', (req: express.Request, res: express.Response) => {

  const barcode_id = req.params.barcode_id;
  console.log(barcode_id)
  // Retrieves barcode from db
  connection.query('SELECT * FROM products WHERE barcode_id = ?', [barcode_id], (error, results) => {
    console.log(error)
    if (error) {
      res.status(500).json({ error: 'Error in query execution' });
      return;
    }
    res.json({ data: results }); // Send the results as JSON
  })
})

// POST: http://localhost:3000/post/drinks/bar/
app.post('/post/drinks/bar', (req: express.Request, res: express.Response) => {
  const barcode_id = parseInt(req.body.barcode_id)
  connection.query("SELECT * FROM products WHERE barcode_id = ?", [barcode_id], (error, results: RowDataPacket[]) => {
    console.log(results)
    if (results.length <= 0) {
      connection.query("INSERT INTO products (`barcode_id`) VALUES ('?')", [barcode_id], (error, results) => {
        if (error) {
          console.log(error)
          res.status(500).json({ error: 'Error in query execution by creating the user' });
          return;
        } else {
          res.json({ data: results }); // Send the results as JSON
        }
      })
    } else {
      res.status(500).json({ error: 'you have already voted' });
    }
  })
})


app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})
