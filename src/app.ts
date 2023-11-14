import express from "express"
import dotenv from 'dotenv';
import { Database } from "./services/database";
import bodyParser from 'body-parser';
import { QueryError, RowDataPacket } from "mysql2";
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
const APIKEY = process.env.API_KEY!;
const connection = database.connect()

// GET: http://localhost:3000/get/goededoel/test
app.get('/get/goededoel/:naam?', (req: express.Request, res: express.Response) => {
  if (!req.params.naam) {
    // Get all from charity
    connection.query('SELECT *  FROM charity', (error: QueryError, results: [{aantal_votes: number, id: number, info: string, link: string, name: string}]) => {
      if (error) {
        res.status(500).json({ error: 'Error in Select query execution' })
        return
      }
      
      res.json({ data: results.sort((a, b) => b.aantal_votes - a.aantal_votes) })
    })
  } else {
    const name = req.params.naam;
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

app.post("/post/goededoel/", (req: express.Request, res: express.Response) => {
  if(req.body.API_KEY != APIKEY){
    res.status(403).json({error: "You need to have the right api key"})
    return;
  }
  const Goededoel_Name = req.body.Name
  const Link = req.body.Link
  const Info = req.body.Info
  connection.query("SELECT * FROM charity WHERE name = ?", [Goededoel_Name], (error, results: RowDataPacket[]) => {
    if (error) {
      res.status(500).json({ error: 'Error in Select query execution' });
      return;
    }
    if (results.length <= 0) {
      connection.query("INSERT INTO charity (`name`, `link`, `info`) VALUES (?, ?, ?)", [Goededoel_Name, Link, Info], (error, results: RowDataPacket[]) => {
        if (error) {
          console.log(error)
          res.status(500).json({ error: 'Error in query execution by creating the charity' });
          return;
        } else {
          res.json({ data: results }); // Send the results as JSON
        }
      })
    } else {
      connection.query("UPDATE charity SET name = ?, link = ?, info = ?", [Goededoel_Name, Link, Info], (error, results: RowDataPacket[]) => {
        if (error) {
          console.log(error)
          res.status(500).json({ error: 'Error in query execution by updating the charity' });
          return;
        } else {
          res.json({ data: results }); // Send the results as JSON
        }
      })
    }
  })

})


app.post("/post/goededoel/del/", (req: express.Request, res: express.Response) => {
  if(req.body.API_KEY != APIKEY){
    res.status(403).json({error: "You need to have the right api key"})
    return;
  }
  const Goededoel_Name = req.body.Name
  connection.query("DELETE FROM charity WHERE name = ?", [Goededoel_Name], (error, results: RowDataPacket[]) => {
    if (error) {
      console.log(error)
      res.status(500).json({ error: 'Error in Select query execution' });
      return;
    } else {
      res.json({ data: results }); // Send the results as JSON
    }
  })
})

// POST: http://localhost:3000/post/vote/
app.post('/post/vote/', (req: express.Request, res: express.Response) => {
  const hardware_id = req.body.hardware_id
  const Vote_name = req.body.Vote_name
  if (!hardware_id) {
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
          res.json({ data: results, uuid: uinqiueID }); // Send the results as JSON
        })
      }
    })
  } else {
    connection.query("SELECT * FROM users where hardware_id = ?", [hardware_id], (error, results: RowDataPacket[]) => {
      if (error) {
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
              res.json({ data: results, uuid: uinqiueID }); // Send the results as JSON
            })
          }
        })
      } else {
        res.status(403).json({ error: 'you have already voted' });
      }
    })
  }

})

// GET: http://localhost:3000/get/drinks/1334679
app.get('/get/drinks/:barcode_id', (req: express.Request, res: express.Response) => {

  const barcode_id = req.params.barcode_id;
  // Retrieves barcode from db
  connection.query('SELECT * FROM products WHERE barcode_id = ?', [barcode_id], (error, results) => {
    if (error) {
      console.log(error)
      res.status(500).json({ error: 'Error in Select query execution' });
      return;
    }
    res.json({ data: results }); // Send the results as JSON
  })
})

// POST: http://localhost:3000/post/drinks/bar/
app.post('/post/drinks/bar', (req: express.Request, res: express.Response) => {
  if(req.body.API_KEY != APIKEY){
    res.status(403).json({error: "You need to have the right api key"})
    return;
  }
  const barcode_id = parseInt(req.body.barcode_id)
  connection.query("SELECT * FROM products WHERE barcode_id = ?", [barcode_id], (error, results: RowDataPacket[]) => {
    if (error) {
      console.log(error)
      res.status(500).json({ error: 'Error in Select query execution' });
      return;
    }
    if (results.length <= 0 ) {
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
  if(req.body.API_KEY != APIKEY){
    res.status(403).json({error: "You need to have the right api key"})
    return;
  }
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
  connection.query("SELECT * FROM users", (error, results) => {
    if (error) {
      console.log(error)
      res.status(500).json({ error: "Error in Select query execution" })
      return;
    } else {
      res.json({ data: results })
    }
  })
})
app.delete("/delete/users", (req, res) => {
  if(req.body.API_KEY != APIKEY){
    res.status(403).json({error: "You need to have the right api key"})
    return;
  }
  const Hardware_Id = req.body.Hardware_Id
  if (Hardware_Id) {
    connection.query("DELETE FROM users WHERE hardware_id = ?", [Hardware_Id], (error, results) => {
      if (error) {
        console.log(error)
        res.status(500).json({ error: "Error in Delete query execution" })
        return;
      } else {
        res.json({ data: results })
      }
    })
  } else {
    connection.query("DELETE FROM users", (error, results) => {
      if (error) {
        console.log(error)
        res.status(500).json({ error: "Error in Delete query execution" })
        return;
      } else {
        res.json({ data: results })
      }
    })
  }
})


// ----------- MONEY RAISED ----------- \\

// UPDATE
app.post("/post/money_raised/update/", (req, res) => {
  if(req.body.API_KEY != APIKEY){
    res.status(403).json({error: "You need to have the right api key"})
    return;
  }
  const Id = req.body.Id;
  const amount = req.body.amount;
  const comment = req.body.comment

  connection.query("UPDATE money_raised SET amount = ?, comment = ?  WHERE id = ? ", [amount, comment, Id], (error, results) => {
    if (error) {
      console.log(error)
      res.status(500).json({ error: 'Error in query execution by creating the user' });
      return;
    } else {
      res.json({ data: results }); // Send the results as JSON
    }
  })
})

// INSERT
app.post("/post/money_raised/insert/", (req, res) => {
  if(req.body.API_KEY != APIKEY){
    res.status(403).json({error: "You need to have the right api key"})
    return;
  }
  const amount = req.body.amount;
  const comment = req.body.comment

  connection.query("INSERT INTO money_raised (`amount`, `comment`) VALUES ('?', '?')", [amount, comment], (error, results) => {
    if (error) {
      console.log(error)
      res.status(500).json({ error: 'Error in query execution by creating the user' });
      return;
    } else {
      res.json({ data: results }); // Send the results as JSON
    }
  })
})

// SELECT
app.get("/get/money_raised/select/", (req, res) => {

  connection.query("SELECT * FROM money_raised", (error, results) => {
    if (error) {
      console.log(error)
      res.status(500).json({ error: 'Error in query execution by creating the user' });
      return;
    } else {
      res.json({ data: results }); // Send the results as JSON
    }
  })
})

// DELETE
app.post("/post/money_raised/delete/", (req, res) => {
  if(req.body.API_KEY != APIKEY){
    res.status(403).json({error: "You need to have the right api key"})
    return;
  }
  const Id = req.body.Id;

  connection.query("DELETE FROM money_raised WHERE id = ?", [Id], (error, results) => {
    if (error) {
      console.log(error)
      res.status(500).json({ error: 'Error in query execution by creating the user' });
      return;
    } else {
      res.json({ data: results }); // Send the results as JSON
    }
  })
})

app.delete("/delete/money_donated", (req, res) => {
  if(req.body.API_KEY != APIKEY){
    res.status(403).json({error: "You need to have the right api key"})
    return;
  }
  const Id = req.body.Id;
  connection.query("DELETE FROM money_donated where id = ?", [Id], (error, results) =>{
    if (error) {
      console.log(error)
      res.status(500).json({ error: 'Error in query execution by creating the user' });
      return;
    } else {
      res.json({ data: results }); // Send the results as JSON
    }
  })
})

app.get("/get/money_donated", (req, res) => {

  connection.query("SELECT * FROM money_donated", (error, results) => {
    if (error) {
      console.log(error)
      res.status(500).json({ error: 'Error in query execution by creating the user' });
      return;
    } else {
      res.json({ data: results }); // Send the results as JSON
    }
  })
})

app.post("/post/money_donated", (req, res) => {
  if(req.body.API_KEY != APIKEY){
    res.status(403).json({error: "You need to have the right api key"})
    return;
  }
  const Id = req.body.Id;
  const amount = req.body.amount;
  const charity_id = req.body.charity_id

  if (Id) {
    connection.query("UPDATE money_donated SET amount = ?, charity_id = ?  WHERE id = ? ", [amount, charity_id, Id], (error, results) => {
      if (error) {
        console.log(error)
        res.status(500).json({ error: 'Error in query execution by creating the user' });
        return;
      } else {
        res.json({ data: results }); // Send the results as JSON
      }
    })
  } else {
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
