const express = require("express");
const app = express();
const jwt = require("jsonwebtoken");
const cors = require("cors");
const {MongoClient, ServerApiVersion, ObjectId} = require("mongodb");
require("dotenv").config();
const port = process.env.PORT || 5000;
const stripe = require("stripe")(process.env.PAYMENT_SECRET_KEY);

// middleware

app.use(cors());
app.use(express.json());

// Verify JWT TOken ----

const verifyJWT = (req, res, next) => {
  const authorization = req.headers.authorization;
  if (!authorization) {
    return res.status(401).send({error: true, message: "unauthorized access"});
  }
  // bearer token
  const token = authorization.split(" ")[1];

  jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, decoded) => {
    if (err) {
      return res
        .status(401)
        .send({error: true, message: "unauthorized access"});
    }
    req.decoded = decoded;
    next();
  });
};

const {default: Stripe} = require("stripe");

//const uri = `mongodb+srv://${ process.env.DB_USER }:${ process.env.DB_PASS }@cluster0.xol1uc7.mongodb.net/?retryWrites=true&w=majority`;
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

    const classesCollection = client.db("summerDb").collection("classes");
    const instructorCollection = client
      .db("summerDb")
      .collection("instructors");
    const addedClassCollection = client.db("summerDb").collection("selected");
    const usersCollection = client.db("summerDb").collection("users");
    const paymentCollection = client.db("summerDb").collection("purchased");

    // jwt api

    app.post("/jwt", (req, res) => {
      const user = req.body;
      const token = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, {
        expiresIn: "7d",
      });

      res.send({token});
    });

    // verify Admin

    // const verifyAdmin = async (req, res, next) => {
    //   const email = req.body.email;
    //   const query = { email: email };
    //   const result = await usersCollection.findOne(query);
    //   if (result?.role !== "admin") {
    //     return res
    //       .status(403)
    //       .send({ error: true, message: "Forbidden access" });
    //   }
    //   next();
    // };

    // verify Instructor

    //const verifyInstructor = async (req, res, next) => {
    //  const email = req.decoded.email;
    //  const query = {email: email};
    //  const result = await usersCollection.findOne(query);
    //  if (result?.role !== "instructor") {
    //    return res.status(403).send({error: true, message: "Forbidden access"});
    //  }
    //  next();
    //};

    // users api

    app.post("/users", async (req, res) => {
      const user = req.body;
      const email = user.email;

      const existUser = await usersCollection.findOne({email: email});
      if (existUser) {
        return res.json("User Exist");
      } else {
        const result = await usersCollection.insertOne(user);
        res.send(result);
      }
    });

    app.get("/users", async (req, res) => {
      const result = await usersCollection.find().toArray();
      res.send(result);
    });

    // admin api
    app.get("/role/email/:email", async (req, res) => {
      const email = req.params.email;

      try {
        const result = await usersCollection.findOne({email});
        res.send(result);
      } catch (error) {
        res.status(500).send("Error fetching data");
      }
    });

    app.patch("/users/admin/:id", async (req, res) => {
      const id = req.params.id;
      const filter = {_id: new ObjectId(id)};
      const userUpdate = {
        $set: {
          role: "admin",
        },
      };
      const result = await usersCollection.updateOne(filter, userUpdate);
      res.send(result);
    });

    app.get("/users/admin/:email", async (req, res) => {
      const email = req.params.email;
      //if (req.decoded.email !== email) {
      //  res.send({admin: false});
      //}
      const query = {email: email};
      const user = await usersCollection.findOne(query);
      const result = {admin: user?.role === "admin"};
      res.send(result);
    });

    app.patch("/popular-classes/:id", async (req, res) => {
      const id = req.params.id;
      const filter = {_id: new ObjectId(id)};
      const newData = req.body;
      const updateDoc = {
        $set: {
          status: newData.status,
          feedback: newData.feedback || "No Feedback!",
        },
      };
      const result = await classesCollection.updateOne(filter, updateDoc);
      res.send(result);
    });

    // instructors api

    app.patch("/users/instructor/:id", async (req, res) => {
      const id = req.params.id;
      const filter = {_id: new ObjectId(id)};
      const userUpdate = {
        $set: {
          role: "instructor",
        },
      };
      const result = await usersCollection.updateOne(filter, userUpdate);
      res.send(result);
    });

    app.get("/users/instructor/:email", async (req, res) => {
      const email = req.params.email;
      const query = {email: email};
      const user = await usersCollection.findOne(query);

      const result = {instructor: user?.role === "instructor"};
      res.send(result);
    });

    app.get("/instructor-classes", async (req, res) => {
      const email = req.query.email;
      const query = {email: email};
      const result = await classesCollection.find(query).toArray();
      res.send(result);
    });

    // classes api

    app.get("/popular-classes", async (req, res) => {
      const result = await classesCollection
        .find()
        .sort({enrolled: -1})
        .toArray();
      res.send(result);
    });

    app.post("/popular-classes", async (req, res) => {
      const classes = req.body;
      const result = await classesCollection.insertOne(classes);
      res.send(result);
    });

    app.put("/popular-classes/:id", async (req, res) => {
      const id = req.params.id;
      const filter = {_id: new ObjectId(id)};
      const options = {upsert: true};
      const newData = req.body;
      const updateDoc = {
        $set: {
          instructorName: newData.instructorName,
          email: newData.email,
          classImage: newData.classImage,
          className: newData.className,
          availableSeats: newData.availableSeats,
          enrolled: newData.enrolled,
          price: newData.price,
          status: newData.status,
        },
      };
      const result = await classesCollection.updateOne(
        filter,
        updateDoc,
        options
      );
      res.send(result);
    });

    // instructor api

    app.get("/popular-instructors", async (req, res) => {
      const result = await instructorCollection
        .find()
        .sort({enrolled: -1})
        .toArray();
      res.send(result);
    });

    // selected class api

    app.post("/selected-classes-cart", async (req, res) => {
      const classes = req.body;
      const result = await addedClassCollection.insertOne(classes);
      res.send(result);
    });

    app.get("/selected-classes-cart", async (req, res) => {
      // const decodedEmail = req.decoded.email;
      const email = req.query.email;
      const query = {email: email};
      // if (email !== decodedEmail) {
      //   return res
      //     .status(403)
      //     .send({ error: true, message: "forbidden access" });
      // }
      const result = await addedClassCollection.find(query).toArray();
      res.send(result);
    });

    app.delete("/selected-classes-cart/:id", async (req, res) => {
      const id = req.params.id;
      const query = {_id: new ObjectId(id)};
      const result = await addedClassCollection.deleteOne(query);
      res.send(result);
    });

    app.get("/enrollDetails", async (req, res) => {
      const email = req.query.email;
      const user = await paymentCollection.find({email: email}).toArray();
      if (user) {
        const payments = await paymentCollection.find({email: email}).toArray();
        const classIds = payments.flatMap((payment) => payment.classId);
        const filteredClassIds = classIds.filter(
          (classId) => classId !== null && classId !== undefined
        );
        const classes = await classesCollection
          .aggregate([
            {
              $match: {
                _id: {$in: filteredClassIds.map((id) => new ObjectId(id))},
              },
            },
            {
              $project: {
                _id: 1,
                className: 1,
                classImage: 1,
                instructorName: 1,
                email: 1,
              },
            },
          ])
          .toArray();
        res.send(classes);
      } else {
        return res.send([]);
      }
    });

    // payment api

    app.post("/create-payment-intent", async (req, res) => {
      const {price} = req.body;
      const amount = parseFloat(price) * 100;
      if (!price) return;
      const paymentIntent = await stripe.paymentIntents.create({
        amount: amount,
        currency: "usd",
        payment_method_types: ["card"],
      });

      res.send({
        clientSecret: paymentIntent.client_secret,
      });
    });

    app.post("/payment", async (req, res) => {
      try {
        const data = req.body;
        const classId = data.classId;
        const result = await paymentCollection.insertOne(data);

        const filter = {_id: new ObjectId(classId)};
        const update = [
          {
            $set: {
              availableSeats: {$toInt: `$availableSeats`},
              enrolled: {$toInt: `$enrolled`},
            },
          },
        ];
        await classesCollection.updateOne(filter, update);

        const deletedRes = await addedClassCollection.deleteOne({
          _id: new ObjectId(data.classId),
        });

        res.send({result, deletedRes});
      } catch (error) {
        console.error(error);
        res
          .status(500)
          .send({error: "An error occurred while processing the payment."});
      }
    });

    app.get("/payment", async (req, res) => {
      const email = req.query.email;
      const result = await paymentCollection
        .find({email: email})
        .sort({date: -1})
        .toArray();
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
  res.send("Yoga Camp School Server is running..");
});

app.listen(port, () => {
  console.log(`Yoga Camp School is running on port ${port}`);
});
