import express from "express"
import dotenv from 'dotenv';
import { Database } from "./services/database";
import bodyParser from 'body-parser';
import { RowDataPacket } from "mysql2";
import cors from 'cors';
import { v4 as uuidv4 } from 'uuid';


const app = express()
app.use(cors())
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
        res.status(500).json({ error: 'Error in Select query execution' })
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
        res.status(500).json({ error: 'Error in Select query execution' });
        return;
      }
      res.json({ data: results }); // Send the results as JSON
    })
  }
})

app.post("/post/goededoel/", (req: express.Request, res:express.Response) => {
  const Goededoel_Name = req.body.Name
  const Link = req.body.Link
  const Info = req.body.Info
  connection.query("SELECT * FROM charity WHERE name = ?", [Goededoel_Name], (error, results: RowDataPacket[])=>{
    if(error){
      console.log(error)
      res.status(500).json({ error: 'Error in Select query execution' });
      return;
    }
    if(results.length <= 0){
      connection.query("INSERT INTO charity (`name`, `link`, `info`) VALUES (?, ?, ?)", [Goededoel_Name, Link, Info],  (error, results: RowDataPacket[]) =>{
        if (error) {
          console.log(error)
          res.status(500).json({ error: 'Error in query execution by creating the charity' });
          return;
        } else {
          res.json({ data: results}); // Send the results as JSON
        }
      })
    } else{
      connection.query("UPDATE charity SET name = ?, link = ?, info = ?", [Goededoel_Name, Link, Info],  (error, results: RowDataPacket[]) => {
        if (error) {
          console.log(error)
          res.status(500).json({ error: 'Error in query execution by updating the charity' });
          return;
        } else {
          res.json({ data: results}); // Send the results as JSON
        }
      })
    }
  })

})


app.post("/post/goededoel/del/", (req: express.Request, res:express.Response) => {
  const Goededoel_Name = req.body.Name
  connection.query("DELETE FROM charity WHERE name = ?", [Goededoel_Name], (error, results: RowDataPacket[])=>{
    if(error){
      console.log(error)
      res.status(500).json({ error: 'Error in Select query execution' });
      return;
    } else {
      res.json({ data: results}); // Send the results as JSON
    }
  })
})

// POST: http://localhost:3000/post/vote/
app.post('/post/vote/', (req: express.Request, res: express.Response) => {
  const hardware_id = req.body.hardware_id
  const Vote_name = req.body.Vote_name
  console.log(hardware_id)
  if(!hardware_id){
    const uinqiueID: string = uuidv4();
    connection.query("INSERT INTO users (`hardware_id`) VALUES (?)", [uinqiueID], (error, results) => {
      if (error) {
        console.log(error)
        res.status(500).json({ error: 'Error in query execution by creating the user' });
        return;
      } else {
        // Update vote on specific charity
        connection.query("UPDATE charity SET aantal_votes = aantal_votes + 1 WHERE name = ? ", [Vote_name], (error, results) => {
          if (error) {
            res.status(500).json({ error: 'Error in query execution by updating the charity' });
            return;
          }
          res.json({ data: results , uuid: uinqiueID}); // Send the results as JSON
        })
      }
    })
  } else{
    connection.query("SELECT * FROM users where hardware_id = ?", [hardware_id], (error, results: RowDataPacket[]) => {
      if(error){
        console.log(error)
        res.status(500).json({ error: 'Error in Select query execution' });
        return;
      }
      if (results.length <= 0) {
        // Insert the hardware id in DB
        const uinqiueID: string = uuidv4();
        connection.query("INSERT INTO users (`hardware_id`) VALUES (?)", [uinqiueID], (error, results) => {
          if (error) {
            console.log(error)
            res.status(500).json({ error: 'Error in query execution by creating the user' });
            return;
          } else {
            // Update vote on specific charity
            connection.query("UPDATE charity SET aantal_votes = aantal_votes + 1 WHERE name = ? ", [Vote_name], (error, results) => {
              if (error) {
                res.status(500).json({ error: 'Error in query execution by updating the charity' });
                return;
              }
              res.json({ data: results, uuid: uinqiueID}); // Send the results as JSON
            })
          }
        })
      } else {
        res.status(403).json({ error: 'you have already voted'});
      }
    })
  }

})

// GET: http://localhost:3000/get/drinks/1334679
app.get('/get/drinks/:barcode_id', (req: express.Request, res: express.Response) => {

  const barcode_id = req.params.barcode_id;
  console.log(barcode_id)
  // Retrieves barcode from db
  connection.query('SELECT * FROM products WHERE barcode_id = ?', [barcode_id], (error, results) => {
    console.log(error)
    if (error) {
      res.status(500).json({ error: 'Error in Select query execution' });
      return;
    }
    res.json({ data: results }); // Send the results as JSON
  })
})

// POST: http://localhost:3000/post/drinks/bar/
app.post('/post/drinks/bar', (req: express.Request, res: express.Response) => {
  const barcode_id = parseInt(req.body.barcode_id)
  connection.query("SELECT * FROM products WHERE barcode_id = ?", [barcode_id], (error, results: RowDataPacket[]) => {
    if(error){
      console.log(error)
      res.status(500).json({ error: 'Error in Select query execution' });
      return;
    }
    console.log(results)
    if (results.length <= 0) {
      connection.query("INSERT INTO products (`barcode_id`) VALUES ('?')", [barcode_id], (error, results) => {
        if (error) {
          console.log(error)
          res.status(500).json({ error: 'Error in query execution by creating the product' });
          return;
        } else {
          res.json({ data: results }); // Send the results as JSON
        }
      })
    } else {
      res.status(409).json({ error: 'Product with the provided barcode ID already exists' });
    }
  })
})

// POST: http://localhost:3000/post/drinks/info/
app.post('/post/drinks/info', (req: express.Request, res: express.Response) => {
  const barcode_id = parseInt(req.body.barcode_id)
  const name = req.body.name
  const type = req.body.type
  const inhoud = req.body.inhoud

    connection.query("UPDATE products SET name = ?, type = ?, inhoud = ? WHERE barcode_id = ? ", [name, type, inhoud, barcode_id], (error, results) => {
        if (error) {
          console.log(error)
          res.status(500).json({ error: 'Error in query execution by creating the user' });
          return;
        } else {
          res.json({ data: results }); // Send the results as JSON
        }
      })
})

app.get("/get/users", (req, res) => {
  connection.query("SELECT * FROM users", (error, results)=>{
    if(error){
      console.log(error)
      res.status(500).json({error: "Error in Select query execution"})
      return;
    } else{
      res.json({data: results})
    }
  })
})
app.delete("/delete/users", (req, res) => {
  const Hardware_Id = req.body.Hardware_Id
  if(Hardware_Id){
    connection.query("DELETE FROM users WHERE hardware_id = ?", [Hardware_Id], (error, results) =>{
      if(error){
        console.log(error)
        res.status(500).json({error: "Error in Delete query execution"})
        return;
      } else{
        res.json({data: results})
      }
    })
  } else{
    connection.query("DELETE FROM users", (error, results)=>{
      if(error){
        console.log(error)
        res.status(500).json({error: "Error in Delete query execution"})
        return;
      } else{
        res.json({data: results})
      }
    })
  }
})
app.post("/post/money_donated", (req, res) => {
  const Id = req.body.Id;
  const amount = req.body.amount;
  const charity_id = req.body.charity_id

  if(Id){
    connection.query("UPDATE money_donated SET amount = ?, charity_id = ?  WHERE id = ? ", [amount, charity_id, Id], (error, results) => {
      if (error) {
        console.log(error)
        res.status(500).json({ error: 'Error in query execution by creating the user' });
        return;
      } else {
        res.json({ data: results }); // Send the results as JSON
      }
    })
  } else{
    connection.query("INSERT INTO money_donated (`amount`, `charity_id`) VALUES ('?', '?')", [amount, charity_id], (error, results) => {
      if (error) {
        console.log(error)
        res.status(500).json({ error: 'Error in query execution by creating the product' });
        return;
      } else {
        res.json({ data: results }); // Send the results as JSON
      }
    })
  }
})

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})
