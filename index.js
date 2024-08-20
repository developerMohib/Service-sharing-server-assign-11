const express = require("express");
const app = express();
const cors = require("cors");
require("dotenv").config();
const nodemailer = require("nodemailer");
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

const sendEmail = (visitorName,visitorEmail, emailSubject) => {
  
  // transporter configuration
  const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 465,
    secure: true, // Use `true` for port 465, `false` for all other ports
    auth: {
      user: process.env.MANAGER_EMAIL,
      pass: process.env.MANAGER_PASS,
    },
  });

  // verify connection configuration
  transporter.verify(function (error, success) {
    if (error) {
      console.log(error);
    } else {
      console.log("Server is ready to take our messages", success);
    }
  });

  // Auto-response email to the user
  const userMailOptions = {
    from: process.env.MANAGER_EMAIL,
    to: visitorEmail,
    subject: 'Thank you for contacting us',
    text: `Hi ${visitorName},\n\nThank you for reaching out! We will get back to you soon.\n\nBest regards,\nOnline Service`,
  };

  // Email to yourself with the user's message
  const adminMailOptions = {
    from: process.env.MANAGER_EMAIL,
    to: process.env.MANAGER_EMAIL, // Your email address
    subject: `New Contact Form Submission from ${visitorName}`,
    text: `Name: ${visitorName}\nEmail: ${visitorEmail}\nMessage: ${emailSubject}`,
  };

  // Auto-response email to the user
  transporter.sendMail(userMailOptions, function (error, info) {
    if (error) {
      console.log(error);
    } else {
      console.log("Email sent: " + info.response);
    }
  });

  // Email to yourself with the user's message
  transporter.sendMail(adminMailOptions, function (error, info) {
    if (error) {
      console.log(error);
    } else {
      console.log("Email sent: " + info.response);
    }
  });
};

// MongoDB Connection
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.ylmjbhk.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    // await client.connect();
    const database = client.db("educationServices");
    const eduServCollection = database.collection("onlineCourse");
    const bookedCollection = database.collection("bookedCourse");

    // Educational all service get
    app.get("/eduServices", async (req, res) => {
      const page = parseInt(req.query.page);
      const size = parseInt(req.query.size);
      // console.log(page, size)
      const cursor = await eduServCollection
        .find()
        .skip(page * size)
        .limit(size)
        .toArray();
      res.send(cursor);
    });
    // Book all service get
    app.get("/bookedServices", async (req, res) => {
      const cursor = bookedCollection.find();
      const result = await cursor.toArray();
      res.send(result);
    });

    // find a data by id query
    app.get("/eduServices/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await eduServCollection.findOne(query);
      res.send(result);
    });

    // find data by email
    app.get("/bookedServices/:email", async (req, res) => {
      const email = req.params.email;
      const cursor = { currentUserEmail: email };
      const result = await bookedCollection.find(cursor).toArray();
      res.send(result);
    });

    // Pagination
    app.get("/serviceCount", async (req, res) => {
      const countData = await bookedCollection.estimatedDocumentCount();
      res.send({ countData });
    });

    // update data from manage route
    app.put("/eduServices/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const updateServiceData = req.body;
      // console.log(updateServiceData)
      const option = { upsert: true };
      const updateDoc = {
        $set: {
          serviceName: updateServiceData.upName,
          serviceArea: updateServiceData.upArea,
          serviceImage: updateServiceData.upPhoto,
          description: updateServiceData.upDescrip,
          servicePrice: updateServiceData.upPrice,
        },
      };
      const result = await eduServCollection.updateOne(
        query,
        updateDoc,
        option
      );
      res.send(result);
    });

    // data updata only status
    app.patch("/bookedServices/:id", async (req, res) => {
      const id = req.params.id;
      // console.log(id);
      const query = { _id: new ObjectId(id) };
      const status = req.body;
      const updateDoc = {
        $set: status,
      };
      const result = await bookedCollection.updateOne(query, updateDoc);
      res.send(result);
    });

    // data post from provider
    app.post("/eduServices", async (req, res) => {
      const addData = req.body;
      const result = await eduServCollection.insertOne(addData);
      res.send(result);
    });

    // Booked Data from client
    app.post("/bookedServices", async (req, res) => {
      const bookData = req.body;
      const result = await bookedCollection.insertOne(bookData);
      res.send(result);
    });

    app.post("/contact", async (req, res) => {
      const visitorData = req.body;
      const name = visitorData?.name ;
      const email = visitorData?.email;
      const subject = visitorData?.subject;
      // to visitor
      sendEmail(name,email, subject);
    });

    // delete data from manage router
    app.delete("/eduServices/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await eduServCollection.deleteOne(query);
      res.send(result);
    });

    // delete data from manage router
    app.delete("/bookedServices/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await bookedCollection.deleteOne(query);
      res.send(result);
    });

    // Send a ping to confirm a successful connection
    // await client.db("admin").command({ ping: 1 });
    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!"
    );
  } finally {
    // Ensures that the client will close when you finish/error
  }
}
run().catch(console.dir);

app.get("/", (req, res) => {
  res.send("Service sharing server is cooming broh");
});
app.listen(port, () => {
  console.log(`Service sharing server port is ${port}`);
});
