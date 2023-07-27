const express = require("express");
const app = express();
const cors = require("cors");
const jwt = require("jsonwebtoken");
require("dotenv").config();
const {MongoClient, ServerApiVersion, ObjectId} = require("mongodb");
const port = process.env.PORT || 5003;

//? middleware
app.use(cors());
app.use(express.json());

//const uri = `mongodb://${ process.env.DB_USER }:${ process.env.DB_PASS }@ac-rwfxpuo-shard-00-00.xol1uc7.mongodb.net:27017,ac-rwfxpuo-shard-00-01.xol1uc7.mongodb.net:27017,ac-rwfxpuo-shard-00-02.xol1uc7.mongodb.net:27017/?ssl=true&replicaSet=atlas-334gvx-shard-0&authSource=admin&retryWrites=true&w=majority`;

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.xol1uc7.mongodb.net/?retryWrites=true&w=majority`;

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
    //await client.connect();
    const rolesCollection = client.db("summerDb").collection("users");
    const instructorsCollection = client
      .db("summerDb")
      .collection("instructors");

    const campCollection = client.db("summerDb").collection("classes");
    const selectedCollection = client.db("summerDb").collection("selected");
    const enrolledCollection = client.db("summerDb").collection("purchased");

    //?test
    app.post("/postEnrolled", async (req, res) => {
      const body = req.body;
      console.log("selected body:", body);
      const removeOrder = await selectedCollection.deleteOne({
        _id: new ObjectId(body.enrolledId),
      });
      const result = await enrolledCollection.insertOne(body);
      // console.log("req", req);
      const updateClass = await campCollection.updateOne(
        {
          _id: new ObjectId(body.classId),
        },
        {
          $inc: {seats: -1, enrolled: 1},
        }
      );
      res.send({result, removeOrder, updateClass});
    });
    //?selected
    app.get("/addedClasses/:email", async (req, res) => {
      const email = req.params.email;
      console.log("email", email);
      const result = await campCollection.find({email: email}).toArray();
      //.sort({date: -1})

      res.send(result);
    });

    app.get("/selectedClass/:id", async (req, res) => {
      const selectedId = req.params.id;
      console.log("selectedId", selectedId);
      try {
        const result = await selectedCollection.findOne({classId: selectedId});
        res.send(result);
      } catch (error) {
        // console.error("Error fetching data:", error);
        res.status(500).send("Error fetching data");
      }
    });
    //?enrolled
    app.get("/enrolledClasses/:email", async (req, res) => {
      const email = req.params.email;
      console.log("email", email);
      const result = await enrolledCollection.find({email: email}).toArray();
      //.sort({date: -1})

      res.send(result);
    });

    app.get("/enrolledClass", async (req, res) => {
      //const email = req.params.email;
      //console.log("email", email);
      const result = await enrolledCollection.find().toArray();
      //.sort({date: -1})

      res.send(result);
    });
    //?selected
    app.get("/selectedClass", async (req, res) => {
      //const email = req.params.email;
      //console.log("email", email);
      const result = await selectedCollection.find().toArray();
      //.sort({date: -1})

      res.send(result);
    });

    app.post("/postSelected", async (req, res) => {
      const body = req.body;
      console.log(body);
      const result = await selectedCollection.insertOne(body);

      res.send(result);
    });
    //?classes
    app.post("/postClasses", async (req, res) => {
      const body = req.body;

      const result = await campCollection.insertOne(body);
      res.send(result);
    });
    //?admin role
    //app.patch("/admin/roles/:email", async (req, res) => {
    //  const email = req.params.email;
    //  const filter = {email: email};
    //  const updateDoc = {
    //    $set: {
    //      role: "Admin",
    //    },
    //  };

    //  const result = await rolesCollection.updateOne(filter, updateDoc);

    //  res.send(result);
    //});

    //?admin get
    app.get("/users/admin/:email", async (req, res) => {
      const email = req.params.email;
      const isAdmin = await rolesCollection.findOne({email, role: "admin"});
      if (isAdmin) {
        res.send({admin: true});
      } else {
        res.send({admin: false});
      }
    });

    //?update admin data
    app.patch("/users/admin/:id", async (req, res) => {
      const id = req.params.id;
      const filter = {_id: new ObjectId(id)};
      const updateDoc = {
        $set: {
          role: `admin`,
        },
      };

      const result = await rolesCollection.updateOne(filter, updateDoc);
      res.send(result);
    });

    app.patch("/users/instructor/:id", async (req, res) => {
      const id = req.params.id;
      console.log(id);
      const filter = {_id: new ObjectId(id)};
      //const email = req.params.email;
      //const filter = {email: email};
      const updateDoc = {
        $set: {
          role: `Instructor`,
        },
      };

      const result = await rolesCollection.updateOne(filter, updateDoc);

      res.send(result);
    });
    //? update instructor data
    // app.patch("/users/instructor/:id", async (req, res) => {
    //  const id = req.params.id;
    //  const filter = {_id: new ObjectId(id)};
    //  const updateDoc = {
    //    $set: {
    //      role: `instructor`,
    //    },
    //  };

    //  const result = await rolesCollection.updateOne(filter, updateDoc);
    //  res.send(result);
    //});

    app.get("/role/email/:email", async (req, res) => {
      const email = req.params.email;

      try {
        const result = await rolesCollection.findOne({email});
        res.send(result);
      } catch (error) {
        res.status(500).send("Error fetching data");
      }
    });
    //?feedback get

    app.get("/feedback/:id", async (req, res) => {
      const feedbackId = req.params.id;
      console.log("feedbackId", feedbackId);
      try {
        const result = await campCollection.findOne({classId: feedbackId});
        res.send(result);
      } catch (error) {
        // console.error("Error fetching data:", error);
        res.status(500).send("Error fetching data");
      }
    });
    //?feedback update
    app.patch("/feedback/:id", async (req, res) => {
      const body = req.body;
      //console.log("clicked", body);
      const id = req.params.id;
      const filter = {_id: new ObjectId(id)};
      const options = {upsert: true};
      const updatedStatus = {
        $set: {
          feedback: body.feedback,
        },
      };
      const result = await campCollection.updateOne(
        filter,
        updatedStatus,
        options
      );
      res.send(result);
    });
    //?users related apis

    app.get("/users", async (req, res) => {
      const result = await rolesCollection.find().toArray();
      res.send(result);
    });

    app.get("/instructors", async (req, res) => {
      const result = await instructorsCollection.find().toArray();
      res.send(result);
      // console.log(result);
    });

    app.get("/myClasses/:email", async (req, res) => {
      if (req.query.sort == "asc") {
        const result = await campCollection
          .find({email: req.params.email})
          .sort({price: 1})
          .toArray();
        res.send(result);
      } else {
        const result = await campCollection
          .find({email: req.params.email})
          .sort({price: -1})
          .toArray();
        res.send(result);
      }
    });

    app.post("/email/users", async (req, res) => {
      const user = req.body;
      const query = {email: user.email};
      const existingUser = await rolesCollection.findOne(query);
      const result = await rolesCollection.insertOne(user);
      if (existingUser) {
        return res.send({message: "user already exists"});
      }

      res.send(result);
    });

    //?get classes

    app.get("/myClasses/:email", async (req, res) => {
      const email = req.params.email;
      const result = await rolesCollection.find().toArray();
      res.send(result);
    });

    app.get("/classes", async (req, res) => {
      const email = req.query.email;
      const query = {email: email};
      const result = await campCollection.find().toArray();
      res.send(result);
    });

    ////?delete function
    app.delete("/classes/:id", async (req, res) => {
      const id = req.params.id;
      const query = {_id: new ObjectId(id)};
      const result = await campCollection.deleteOne(query);
      res.send(result);
    });

    // Send a ping to confirm a successful connection
    //await client.db("admin").command({ping: 1});
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
