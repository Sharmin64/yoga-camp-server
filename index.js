const express = require("express");
const app = express();
const cors = require("cors");
require("dotenv").config();
const {MongoClient, ServerApiVersion} = require("mongodb");
const port = process.env.PORT || 5003;

//? middleware
app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.xol1uc7.mongodb.net/?retryWrites=true&w=majority`;
console.log(uri);
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
    await client.connect();

    const usersCollection = client.db("summerDb").collection("users");
    const campCollection = client.db("summerDb").collection("classes");

    //?users related apis
    app.post("/users", async (req, res) => {
      const user = req.body;
      const query = {email: user.email};
      const existingUser = await usersCollection.findOne(query);
      if (existingUser) {
        return res.send({message: "user already exists"});
      }
      const result = await usersCollection.insertOne(user);
      res.send(result);
    });

    //app.get("/classes", async (req, res) => {
    //  const result = await campCollection.find().toArray();
    //  res.send(result);
    //});
    app.get("/classes", async (req, res) => {
      const result = await campCollection
        .find({})
        .sort({enrolled: -1})
        .toArray();
      res.send(result);
    });

    //?delete function
    app.delete("/classes/:id", async (req, res) => {
      const id = req.params.id;
      const query = {_id: new ObjectId(id)};
      const result = await campCollection.deleteOne(query);
      res.send(result);
    });

    // Send a ping to confirm a successful connection
    await client.db("admin").command({ping: 1});
    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!"
    );
  } finally {
    // Ensures that the client will close when you finish/error
    //await client.close();
  }
}
run().catch(console.dir);

app.get("/", (req, res) => {
  res.send(" Yoga Camp is held on School premises");
});

app.listen(port, () => {
  console.log(`Yoga Camp is running this whole month on ${port}`);
});
