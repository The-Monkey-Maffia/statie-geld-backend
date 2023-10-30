import express from "express"
const app = express()
const port = 3000


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
