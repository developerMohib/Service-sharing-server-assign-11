const express = require('express');
const app = express() ;
const cors = require('cors');
require ('dotenv').config();
const port = process.env.PORT || 5000 ;
//OmR9aMx5RfAaSBnU
//serviceSharing
app.use(cors());
app.use(express.json())

// MongoDB Connection

const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.ylmjbhk.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    // await client.connect();
    const database = client.db("educationServices");
    const eduServCollection = database.collection("onlineCourse");
    const bookedCollection = database.collection("bookedCourse");

    // Educational all service get
    app.get('/eduServices', async(req, res) => {
        const cursor = eduServCollection.find( ) ;
        const result = await cursor.toArray( ) ;
        res.send(result)
    })
    // Book all service get
    app.get('/bookedServices', async(req, res) => {
        const cursor = bookedCollection.find( ) ;
        const result = await cursor.toArray( ) ;
        res.send(result)
    })

    // find a data by id query 
    app.get('/eduServices/:id',async(req, res) => {
        const id = req.params.id ;
        const query = { _id: new ObjectId(id) };
        const result = await eduServCollection.findOne(query);
        res.send(result)
    })

    // find data by email 
    app.get('/bookedServices/:email', async(req,res) => {
      const email = req.params.email;
      console.log(email)
      const cursor = { currentUserEmail: email };
      const result = await bookedCollection.find(cursor).toArray() ;
      res.send(result)
    })

    // data post from provider 
    app.post('/eduServices',async(req,res) => {
      const addData = req.body ;
      console.log(addData);
      const result = await eduServCollection.insertOne(addData) ;
      res.send(result)
    })
    // Booked Data from client
    app.post('/bookedServices',async(req,res) => {
      const bookData = req.body ;
      const result = await bookedCollection.insertOne(bookData) ;
      res.send(result)
    })

    // Send a ping to confirm a successful connection
    // await client.db("admin").command({ ping: 1 });
    console.log ("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error
  }
}
run().catch(console.dir);


app.get('/',(req,res)=>{
    res.send('Service sharing server is cooming broh')
})
app.listen(port, ()=>{
    console.log(`Service sharing server port is ${port}`)
})