////?index er code
//const express = require("express");
//const app = express();
//const jwt = require("jsonwebtoken");
////const morgan = require("morgan");
//const cors = require("cors");
//require("dotenv").config();
//const {MongoClient, ServerApiVersion, ObjectId} = require("mongodb");

//const port = process.env.PORT || 5003;
////const stripe = require("stripe")(process.env.PAYMENT_SECRET_KEY);

////const corsOptions = {
////  origin: "*",
////  credentials: true,
////  optionSuccessStatus: 200,
////};
//app.use(cors());
//app.use(express.json());
//// app.use(morgan("dev"));

//const verifyJWT = (req, res, next) => {
//  const authorization = req.headers.authorization;
//  if (!authorization) {
//    return res.status(401).send({error: true, message: "unauthorized access"});
//  }
//  // bearer token
//  const token = authorization.split(" ")[1];

//  jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, decoded) => {
//    if (err) {
//      return res
//        .status(401)
//        .send({error: true, message: "unauthorized access"});
//    }
//    req.decoded = decoded;
//    next();
//  });
//};

////const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.xol1uc7.mongodb.net/?retryWrites=true&w=majority`;

//const uri = `mongodb://${process.env.DB_USER}:${process.env.DB_PASS}@ac-rwfxpuo-shard-00-00.xol1uc7.mongodb.net:27017,ac-rwfxpuo-shard-00-01.xol1uc7.mongodb.net:27017,ac-rwfxpuo-shard-00-02.xol1uc7.mongodb.net:27017/?ssl=true&replicaSet=atlas-334gvx-shard-0&authSource=admin&retryWrites=true&w=majority`;
//// Create a MongoClient with a MongoClientOptions object to set the Stable API version
//const client = new MongoClient(uri, {
//  serverApi: {
//    version: ServerApiVersion.v1,
//    strict: true,
//    deprecationErrors: true,
//  },
//});

//async function run() {
//  try {
//    // Connect the client to the server	(optional starting in v4.7)
//    await client.connect();

//    const classesCollection = client.db("summerDb").collection("classes");
//    const instructorCollection = client
//      .db("summerDb")
//      .collection("instructors");
//    const addedClassCollection = client.db("summerDb").collection("selected");
//    const usersCollection = client.db("summerDb").collection("users");
//    const paymentCollection = client.db("summerDb").collection("purchased");

//    // jwt api

//    app.post("/jwt", (req, res) => {
//      const user = req.body;
//      const token = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, {
//        expiresIn: "7d",
//      });

//      res.send({token});
//    });

//    // verify Admin

//    // const verifyAdmin = async (req, res, next) => {
//    //   const email = req.body.email;
//    //   const query = { email: email };
//    //   const result = await usersCollection.findOne(query);
//    //   if (result?.role !== "admin") {
//    //     return res
//    //       .status(403)
//    //       .send({ error: true, message: "Forbidden access" });
//    //   }
//    //   next();
//    // };

//    // // verify Instructor

//    // const verifyInstructor = async (req, res, next) => {
//    //   const email = req.decoded.email;
//    //   const query = { email: email };
//    //   const result = await usersCollection.findOne(query);
//    //   if (result?.role !== "instructor") {
//    //     return res
//    //       .status(403)
//    //       .send({ error: true, message: "Forbidden access" });
//    //   }
//    //   next();
//    // };

//    // users api

//    app.post("/users", async (req, res) => {
//      const user = req.body;
//      const email = user.email;

//      const existUser = await usersCollection.findOne({email: email});
//      if (existUser) {
//        return res.json("User Exist");
//      } else {
//        const result = await usersCollection.insertOne(user);
//        res.send(result);
//      }
//    });

//    app.get("/users", async (req, res) => {
//      const result = await usersCollection.find().toArray();
//      res.send(result);
//    });

//    // admin api

//    app.patch("/users/admin/:id", async (req, res) => {
//      const id = req.params.id;
//      const filter = {_id: new ObjectId(id)};
//      const userUpdate = {
//        $set: {
//          role: "admin",
//        },
//      };
//      const result = await usersCollection.updateOne(filter, userUpdate);
//      res.send(result);
//    });

//    app.get("/users/admin/:email", async (req, res) => {
//      const email = req.params.email;
//      // if (req.decoded.email !== email) {
//      //   res.send({ admin: false });
//      // }
//      const query = {email: email};
//      const user = await usersCollection.findOne(query);

//      const result = {admin: user?.role === "admin"};
//      res.send(result);
//    });

//    app.patch("/popular-classes/:id", async (req, res) => {
//      const id = req.params.id;
//      const filter = {_id: new ObjectId(id)};
//      const newData = req.body;
//      const updateDoc = {
//        $set: {
//          status: newData.status,
//          feedback: newData.feedback || "No Feedback!",
//        },
//      };
//      const result = await classesCollection.updateOne(filter, updateDoc);
//      res.send(result);
//    });

//    // instructors api

//    app.patch("/users/instructor/:id", async (req, res) => {
//      const id = req.params.id;
//      const filter = {_id: new ObjectId(id)};
//      const userUpdate = {
//        $set: {
//          role: "instructor",
//        },
//      };
//      const result = await usersCollection.updateOne(filter, userUpdate);
//      res.send(result);
//    });

//    app.get("/users/instructor/:email", async (req, res) => {
//      const email = req.params.email;
//      const query = {email: email};
//      const user = await usersCollection.findOne(query);

//      const result = {instructor: user?.role === "instructor"};
//      res.send(result);
//    });

//    app.get("/instructor-classes", async (req, res) => {
//      const email = req.query.email;
//      const query = {instructor_email: email};
//      const result = await classesCollection.find(query).toArray();
//      res.send(result);
//    });

//    // classes api

//    app.get("/popular-classes", async (req, res) => {
//      const result = await classesCollection
//        .find()
//        .sort({number_of_students: -1})
//        .toArray();
//      res.send(result);
//    });

//    app.post("/popular-classes", async (req, res) => {
//      const classes = req.body;
//      const result = await classesCollection.insertOne(classes);
//      res.send(result);
//    });

//    app.put("/popular-classes/:id", async (req, res) => {
//      const id = req.params.id;
//      const filter = {_id: new ObjectId(id)};
//      const options = {upsert: true};
//      const newData = req.body;
//      const updateDoc = {
//        $set: {
//          name: newData.instructorName,
//          email: newData.instructorEmail,
//          image: newData.image,
//          class_name: newData.className,
//          available_seats: newData.availableSeats,
//          number_of_students: newData.numberOfStudents,
//          price: newData.price,
//          status: newData.status,
//        },
//      };
//      const result = await classesCollection.updateOne(
//        filter,
//        updateDoc,
//        options
//      );
//      res.send(result);
//    });

//    // instructor api

//    app.get("/popular-instructors", async (req, res) => {
//      const result = await instructorCollection
//        .find()
//        .sort({number_of_students: -1})
//        .toArray();
//      res.send(result);
//    });

//    // selected class api

//    app.post("/selected-classes-cart", async (req, res) => {
//      const classes = req.body;
//      const result = await addedClassCollection.insertOne(classes);
//      res.send(result);
//    });

//    app.get("/selected-classes-cart", async (req, res) => {
//      // const decodedEmail = req.decoded.email;
//      const email = req.query.email;
//      const query = {email: email};
//      // if (email !== decodedEmail) {
//      //   return res
//      //     .status(403)
//      //     .send({ error: true, message: "forbidden access" });
//      // }
//      const result = await addedClassCollection.find(query).toArray();
//      res.send(result);
//    });

//    app.delete("/selected-classes-cart/:id", async (req, res) => {
//      const id = req.params.id;
//      const query = {_id: new ObjectId(id)};
//      const result = await addedClassCollection.deleteOne(query);
//      res.send(result);
//    });

//    app.get("/enrollDetails", async (req, res) => {
//      const email = req.query.email;
//      const user = await paymentCollection.find({email: email}).toArray();
//      if (user) {
//        const payments = await paymentCollection.find({email: email}).toArray();
//        const classIds = payments.flatMap((payment) => payment.classId);
//        const filteredClassIds = classIds.filter(
//          (classId) => classId !== null && classId !== undefined
//        );
//        const classes = await classesCollection
//          .aggregate([
//            {
//              $match: {
//                _id: {$in: filteredClassIds.map((id) => new ObjectId(id))},
//              },
//            },
//            {
//              $project: {
//                _id: 1,
//                class_name: 1,
//                class_image: 1,
//                instructor_name: 1,
//                instructor_email: 1,
//              },
//            },
//          ])
//          .toArray();
//        res.send(classes);
//      } else {
//        return res.send([]);
//      }
//    });

//    // payment api

//    app.post("/create-payment-intent", async (req, res) => {
//      const {price} = req.body;
//      const amount = parseFloat(price) * 100;
//      if (!price) return;
//      const paymentIntent = await stripe.paymentIntents.create({
//        amount: amount,
//        currency: "usd",
//        payment_method_types: ["card"],
//      });

//      res.send({
//        clientSecret: paymentIntent.client_secret,
//      });
//    });

//    app.post("/payment", async (req, res) => {
//      try {
//        const data = req.body;
//        const classId = data.classId;
//        const result = await paymentCollection.insertOne(data);

//        const filter = {_id: new ObjectId(classId)};
//        const update = [
//          {
//            $set: {
//              available_seats: {$toInt: "$available_seats"},
//              number_of_students: {$toInt: "$number_of_students"},
//            },
//          },
//        ];
//        await classesCollection.updateOne(filter, update);

//        const deletedRes = await addedClassCollection.deleteOne({
//          _id: new ObjectId(data.classId),
//        });

//        res.send({result, deletedRes});
//      } catch (error) {
//        console.error(error);
//        res
//          .status(500)
//          .send({error: "An error occurred while processing the payment."});
//      }
//    });

//    app.get("/payment", async (req, res) => {
//      const email = req.query.email;
//      const result = await paymentCollection
//        .find({email: email})
//        .sort({date: -1})
//        .toArray();
//      res.send(result);
//    });

//    // Send a ping to confirm a successful connection
//    await client.db("admin").command({ping: 1});
//    console.log(
//      "Pinged your deployment. You successfully connected to MongoDB!"
//    );
//  } finally {
//    // Ensures that the client will close when you finish/error
//    // await client.close();
//  }
//}
//run().catch(console.dir);

//app.get("/", (req, res) => {
//  res.send("Yoga Camp Server is running..");
//});

//app.listen(port, () => {
//  console.log(`Yoga Camp is running on port ${port}`);
//});

////?test
////const express = require("express");
////const app = express();
////const cors = require("cors");
////const jwt = require("jsonwebtoken");
////require("dotenv").config();
////const {MongoClient, ServerApiVersion, ObjectId} = require("mongodb");

////const port = process.env.PORT || 5003;

//////? middleware
//////app.use(cors());
////const corsConfig = {
////  origin: "",
////  credentials: true,
////  methods: ["GET", "POST", "PUT", "DELETE"],
////};
////app.use(cors(corsConfig));
////app.options("", cors(corsConfig));
////app.use(express.json());

//////const uri = `mongodb://${ process.env.DB_USER }:${ process.env.DB_PASS }@ac-rwfxpuo-shard-00-00.xol1uc7.mongodb.net:27017,ac-rwfxpuo-shard-00-01.xol1uc7.mongodb.net:27017,ac-rwfxpuo-shard-00-02.xol1uc7.mongodb.net:27017/?ssl=true&replicaSet=atlas-334gvx-shard-0&authSource=admin&retryWrites=true&w=majority`;

//////const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.xol1uc7.mongodb.net/?retryWrites=true&w=majority`;

////const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.xol1uc7.mongodb.net/?retryWrites=true&w=majority`;

////// Create a MongoClient with a MongoClientOptions object to set the Stable API version
////const client = new MongoClient(uri, {
////  serverApi: {
////    strict: true,
////    deprecationErrors: true,
////  },
////});

////async function run() {
////  try {
////    // Connect the client to the server	(optional starting in v4.7)
////    //? ekhane await.client silo

////    const rolesCollection = client.db("summerDb").collection("users");
////    const instructorsCollection = client
////      .db("summerDb")
////      .collection("instructors");

////    const campCollection = client.db("summerDb").collection("classes");
////    const selectedCollection = client.db("summerDb").collection("selected");
////    const enrolledCollection = client.db("summerDb").collection("purchased");

////    //?test
////    app.post("/postEnrolled", async (req, res) => {
////      const body = req.body;
////      console.log("selected body:", body);
////      const removeOrder = await selectedCollection.deleteOne({
////        _id: new ObjectId(body.enrolledId),
////      });
////      const result = await enrolledCollection.insertOne(body);
////      // console.log("req", req);
////      const updateClass = await campCollection.updateOne(
////        {
////          _id: new ObjectId(body.classId),
////        },
////        {
////          $inc: {seats: -1, enrolled: 1},
////        }
////      );
////      res.send({result, removeOrder, updateClass});
////    });
////    //?selected
////    app.get("/addedClasses/:email", async (req, res) => {
////      const email = req.params.email;
////      console.log("email", email);
////      const result = await campCollection.find({email: email}).toArray();
////      //.sort({date: -1})

////      res.send(result);
////    });

////    app.get("/selectedClass/:id", async (req, res) => {
////      const selectedId = req.params.id;
////      console.log("selectedId", selectedId);
////      try {
////        const result = await selectedCollection.findOne({classId: selectedId});
////        res.send(result);
////      } catch (error) {
////        // console.error("Error fetching data:", error);
////        res.status(500).send("Error fetching data");
////      }
////    });
////    //?enrolled
////    app.get("/enrolledClasses/:email", async (req, res) => {
////      const email = req.params.email;
////      console.log("email", email);
////      const result = await enrolledCollection.find({email: email}).toArray();
////      //.sort({date: -1})

////      res.send(result);
////    });

////    app.get("/enrolledClass", async (req, res) => {
////      //const email = req.params.email;
////      //console.log("email", email);
////      const result = await enrolledCollection.find().toArray();
////      //.sort({date: -1})

////      res.send(result);
////    });
////    //?selected
////    app.get("/selectedClass", async (req, res) => {
////      //const email = req.params.email;
////      //console.log("email", email);
////      const result = await selectedCollection.find().toArray();
////      //.sort({date: -1})

////      res.send(result);
////    });

////    app.post("/postSelected", async (req, res) => {
////      const body = req.body;
////      console.log(body);
////      const result = await selectedCollection.insertOne(body);

////      res.send(result);
////    });
////    //?classes
////    app.post("/postClasses", async (req, res) => {
////      const body = req.body;

////      const result = await campCollection.insertOne(body);
////      res.send(result);
////    });
////    //?admin role
////    //app.patch("/admin/roles/:email", async (req, res) => {
////    //  const email = req.params.email;
////    //  const filter = {email: email};
////    //  const updateDoc = {
////    //    $set: {
////    //      role: "Admin",
////    //    },
////    //  };

////    //  const result = await rolesCollection.updateOne(filter, updateDoc);

////    //  res.send(result);
////    //});

////    //?admin get
////    app.get("/users/admin/:email", async (req, res) => {
////      const email = req.params.email;
////      const isAdmin = await rolesCollection.findOne({email, role: "admin"});
////      if (isAdmin) {
////        res.send({admin: true});
////      } else {
////        res.send({admin: false});
////      }
////    });

////    //?update admin data
////    app.patch("/users/admin/:id", async (req, res) => {
////      const id = req.params.id;
////      const filter = {_id: new ObjectId(id)};
////      const updateDoc = {
////        $set: {
////          role: `admin`,
////        },
////      };

////      const result = await rolesCollection.updateOne(filter, updateDoc);
////      res.send(result);
////    });

////    app.patch("/users/instructor/:id", async (req, res) => {
////      const id = req.params.id;
////      console.log(id);
////      const filter = {_id: new ObjectId(id)};
////      //const email = req.params.email;
////      //const filter = {email: email};
////      const updateDoc = {
////        $set: {
////          role: `Instructor`,
////        },
////      };

////      const result = await rolesCollection.updateOne(filter, updateDoc);

////      res.send(result);
////    });
////    //? update instructor data
////    // app.patch("/users/instructor/:id", async (req, res) => {
////    //  const id = req.params.id;
////    //  const filter = {_id: new ObjectId(id)};
////    //  const updateDoc = {
////    //    $set: {
////    //      role: `instructor`,
////    //    },
////    //  };

////    //  const result = await rolesCollection.updateOne(filter, updateDoc);
////    //  res.send(result);
////    //});

//    app.get("/role/email/:email", async (req, res) => {
////      const email = req.params.email;

////      try {
////        const result = await rolesCollection.findOne({email});
////        res.send(result);
////      } catch (error) {
////        res.status(500).send("Error fetching data");
////      }
////    });
////    //?feedback get

////    app.get("/feedback/:id", async (req, res) => {
////      const feedbackId = req.params.id;
////      console.log("feedbackId", feedbackId);
////      try {
////        const result = await campCollection.findOne({classId: feedbackId});
////        res.send(result);
////      } catch (error) {
////        // console.error("Error fetching data:", error);
////        res.status(500).send("Error fetching data");
////      }
////    });
////    //?feedback update
////    app.patch("/feedback/:id", async (req, res) => {
////      const body = req.body;
////      //console.log("clicked", body);
////      const id = req.params.id;
////      const filter = {_id: new ObjectId(id)};
////      const options = {upsert: true};
////      const updatedStatus = {
////        $set: {
////          feedback: body.feedback,
////        },
////      };
////      const result = await campCollection.updateOne(
////        filter,
////        updatedStatus,
////        options
////      );
////      res.send(result);
////    });
////    //?users related apis

////    app.get("/users", async (req, res) => {
////      const result = await rolesCollection.find().toArray();
////      res.send(result);
////    });

////    app.get("/instructors", async (req, res) => {
////      const result = await instructorsCollection.find().toArray();
////      res.send(result);
////      // console.log(result);
////    });

////    app.get("/myClasses/:email", async (req, res) => {
////      if (req.query.sort == "asc") {
////        const result = await campCollection
////          .find({email: req.params.email})
////          .sort({price: 1})
////          .toArray();
////        res.send(result);
////      } else {
////        const result = await campCollection
////          .find({email: req.params.email})
////          .sort({price: -1})
////          .toArray();
////        res.send(result);
////      }
////    });

////    app.post("/email/users", async (req, res) => {
////      const user = req.body;
////      const query = {email: user.email};
////      const existingUser = await rolesCollection.findOne(query);
////      const result = await rolesCollection.insertOne(user);
////      if (existingUser) {
////        return res.send({message: "user already exists"});
////      }

////      res.send(result);
////    });

////    //?get classes

////    app.get("/myClasses/:email", async (req, res) => {
////      const email = req.params.email;
////      const result = await rolesCollection.find().toArray();
////      res.send(result);
////    });

////    app.get("/classes", async (req, res) => {
////      const email = req.query.email;
////      const query = {email: email};
////      const result = await campCollection.find().toArray();
////      res.send(result);
////    });

////    ////?delete function
////    app.delete("/classes/:id", async (req, res) => {
////      const id = req.params.id;
////      const query = {_id: new ObjectId(id)};
////      const result = await campCollection.deleteOne(query);
////      res.send(result);
////    });

////    // Send a ping to confirm a successful connection
////    //await client.db("admin").command({ping: 1});
////    console.log(
////      "Pinged your deployment. You successfully connected to MongoDB!"
////    );
////  } finally {
////    // Ensures that the client will close when you finish/error
////    //await client.close();
////  }
////}
////run().catch(console.dir);

////app.get("/", (req, res) => {
////  res.send(" Yoga Camp is held on School premises");
////});

////app.listen(port, () => {
////  console.log(`Yoga Camp is running this whole month on ${port}`);
////});

//?
//async function run() {
//  try {
//    await client.connect();
//    const classCollection = client.db("summerDb").collection("classes");
//    const instructorClassCollection = client
//      .db("summerDb")
//      .collection("instructorClasses");
//    const userCollection = client.db("summerDb").collection("users");
//    const paymentCollection = client.db("summerDb").collection("payments");
//    const instructorCollection = client
//      .db("danceSchoolDB")
//      .collection("instructors");
//    const cartCollection = client.db("summerDb").collection("carts");
//    // jwt token
//    app.post("/jwt", (req, res) => {
//      const user = req.body;
//      const token = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, {
//        expiresIn: "1h",
//      });

//      res.send({token});
//    });

//    // verify admin
//    // Warning: use verifyJWT before using verifyAdmin
//    const verifyAdmin = async (req, res, next) => {
//      const email = req.decoded.email;
//      const query = {email: email};
//      const user = await userCollection.findOne(query);
//      if (user?.role !== "admin") {
//        return res
//          .status(403)
//          .send({error: true, message: "forbidden message"});
//      }
//      next();
//    };

//    // verify Instructor  ---
//    const verifyInstructor = async (req, res, next) => {
//      const email = req.decoded.email;
//      const query = {email: email};
//      const user = await userCollection.findOne(query);
//      if (user?.role !== "instructor") {
//        return res
//          .status(403)
//          .send({error: true, message: "forbidden message"});
//      }
//      next();
//    };

//    // classes access by it
//    app.get("/classes", async (req, res) => {
//      const result = await classCollection
//        .find()
//        .sort({currentStudent: -1})
//        .toArray();
//      res.send(result);
//    });

//    // get the users
//    // Save user email and role in DB
//    app.put("/users/:email", async (req, res) => {
//      const email = req.params.email;
//      const user = req.body;
//      const query = {email: email};
//      const options = {upsert: true};
//      const updateDoc = {
//        $set: user,
//      };
//      const result = await userCollection.updateOne(query, updateDoc, options);
//      console.log(result);
//      res.send(result);
//    });

//    // get user data
//    app.get("/users", verifyJWT, verifyAdmin, async (req, res) => {
//      const result = await userCollection.find().toArray();
//      res.send(result);
//    });

//    // check admin or not by jwt
//    app.get("/users/admin/:email", verifyJWT, async (req, res) => {
//      const email = req.params.email;

//      if (req.decoded.email !== email) {
//        res.send({admin: false});
//      }
//      const query = {email: email};
//      const user = await userCollection.findOne(query);
//      const result = {admin: user?.role === "admin"};
//      res.send(result);
//    });

//    // make admin
//    app.patch("/users/admin/:id", async (req, res) => {
//      const id = req.params.id;
//      console.log(id);
//      const filter = {_id: new ObjectId(id)};
//      const updateDoc = {
//        $set: {
//          role: "admin",
//        },
//      };

//      const result = await userCollection.updateOne(filter, updateDoc);
//      res.send(result);
//    });

//    // instructors collections --get it
//    app.get("/instructors", async (req, res) => {
//      const role = "instructor";

//      const result = await userCollection.find({role}).toArray();

//      res.send(result);
//    });
//    // carts operation --

//    app.get("/carts", verifyJWT, async (req, res) => {
//      const email = req.query.email;
//      console.log(email);
//      if (!email) {
//        res.send([]);
//      }

//      const decodedEmail = req.decoded.email;
//      if (email !== decodedEmail) {
//        return res.status(403).send({error: true, message: "forbidden access"});
//      }

//      const query = {email: email};
//      const result = await cartCollection.find(query).toArray();

//      const updatedResult = result.map((item) => {
//        return {id: item._id, ...item};
//      });

//      res.send(updatedResult);
//    });

//    // original get

//    // app.get("/carts", verifyJWT, async (req, res) => {
//    //   const email = req.query.email;
//    //   console.log(email);
//    //   if (!email) {
//    //     res.send([]);
//    //   }

//    //   const decodedEmail = req.decoded.email;
//    //   if (email !== decodedEmail) {
//    //     return res
//    //       .status(403)
//    //       .send({ error: true, message: "forbidden access" });
//    //   }

//    //   const query = { email: email };
//    //   const result = await cartCollection.find(query).toArray();
//    //   res.send(result);
//    // });

//    // post a new item to cart
//    app.post("/carts", async (req, res) => {
//      const item = req.body;
//      const userEmail = item.email;

//      // Check if the item already exists in the cart for the user's email
//      const existingItem = await cartCollection.findOne({
//        itemId: item.itemId,
//        email: userEmail,
//      });
//      if (existingItem) {
//        return res
//          .status(400)
//          .json({error: "Item already exists in the cart."});
//      }

//      // Add the item to the cart
//      const result = await cartCollection.insertOne(item);
//      res.send(result);
//    });

//    // card payment ---
//    // create payment intent
//    app.post("/create-payment-intent", verifyJWT, async (req, res) => {
//      const {price} = req.body;
//      const amount = parseInt(price * 100);
//      console.log(price, amount);
//      const paymentIntent = await stripe.paymentIntents.create({
//        amount: amount,
//        currency: "usd",
//        payment_method_types: ["card"],
//      });

//      res.send({
//        clientSecret: paymentIntent.client_secret,
//      });
//    });

//    // --------------------------------Instructor ar kaj baj ---------------------------

//    app.post("/instructorClasses", async (req, res) => {
//      const item = req.body;
//      const result = await classCollection.insertOne(item);
//      // use classCollection
//      res.send(result);
//    });

//    app.get("/instructorClasses", async (req, res) => {
//      const result = await classCollection.find().toArray();
//      res.send(result);
//    });
//    // approved-----------------------------------------
//    app.patch("/instructorClasses/statusApproved/:id", async (req, res) => {
//      const id = req.params.id;
//      console.log(id);
//      const filter = {_id: new ObjectId(id)};
//      const updateDoc = {
//        $set: {
//          status: "approved",
//        },
//      };

//      const result = await classCollection.updateOne(filter, updateDoc);
//      res.send(result);
//    });
//    //  rejected ---- -------------------------
//    app.patch("/instructorClasses/statusRejected/:id", async (req, res) => {
//      const id = req.params.id;
//      console.log(id);
//      const filter = {_id: new ObjectId(id)};
//      const updateDoc = {
//        $set: {
//          status: "rejected",
//        },
//      };

//      const result = await classCollection.updateOne(filter, updateDoc);
//      res.send(result);
//    });

//    // update by its modal

//    app.patch("/instructorClasses/:id", async (req, res) => {
//      const {id} = req.params; // Get the _id parameter from the request URL
//      const {reason} = req.body; // Assuming the client sends the updated reason in the request body

//      const filter = {_id: new ObjectId(id)};
//      const updateDoc = {
//        $set: {reason},
//      };

//      try {
//        const result = await classCollection.updateOne(filter, updateDoc);
//        res.json(result); // Send the result of the update operation as the response
//      } catch (error) {
//        console.error("Error updating class:", error);
//        res.status(500).send("An error occurred while updating the class.");
//      }
//    });

//    // app.patch('/instructorClasses/statusRejected/:id', (req, res) => {
//    //   const { id } = req.params;
//    //   const { reason } = req.body;

//    //   // Assuming you have a MongoDB model for the instructor classes
//    //   InstructorClass.findByIdAndUpdate(
//    //     id,
//    //     { $set: { status: 'rejected', rejectReason: reason } },
//    //     { new: true }
//    //   )
//    //     .then((updatedClass) => {
//    //       res.json({ modifiedCount: 1, updatedClass });
//    //     })
//    //     .catch((error) => {
//    //       res.status(500).json({ error: 'Failed to update class status' });
//    //     });
//    // });

//    app.get("/myclass", async (req, res) => {
//      const email = req.query.email; // Use req.query instead of req.body for GET requests
//      const query = {email: email};
//      const result = await classCollection.find(query).toArray();
//      res.send(result);
//    });

//    // ----------make instructor ------------ from a normal user: only admin can make it------------------
//    // 1* 1stly patch user and make him Instructor
//    // 2- then get the instructor

//    app.get("/users/instructor/:email", verifyJWT, async (req, res) => {
//      const email = req.params.email;

//      if (req.decoded.email !== email) {
//        res.send({instructor: false});
//      }

//      const query = {email: email};
//      const user = await userCollection.findOne(query);
//      const result = {instructor: user?.role === "instructor"};
//      res.send(result);
//    });

//    app.patch("/users/instructor/:id", async (req, res) => {
//      const id = req.params.id;
//      console.log(id);
//      const filter = {_id: new ObjectId(id)};
//      const updateDoc = {
//        $set: {
//          role: "instructor",
//        },
//      };

//      const result = await userCollection.updateOne(filter, updateDoc);
//      res.send(result);
//    });

//    // payment related api
//    app.post("/payments", verifyJWT, async (req, res) => {
//      const payment = req.body;
//      const insertResult = await paymentCollection.insertOne(payment);

//      const query = {
//        _id: {$in: payment.cartItems.map((id) => new ObjectId(id))},
//      };
//      const deleteResult = await cartCollection.deleteOne(query);

//      res.send({insertResult, deleteResult});
//    });

//    app.get("/payments", async (req, res) => {
//      const email = req.query.email; // Use req.query instead of req.body for GET requests
//      const query = {email: email};
//      const result = await paymentCollection.find(query).toArray();
//      res.send(result);
//    });

//    // delete an item
//    app.delete("/carts/:id", async (req, res) => {
//      const id = req.params.id;
//      const query = {_id: new ObjectId(id)};
//      const result = await cartCollection.deleteOne(query);
//      res.send(result);
//    });

//    // Send a ping to confirm a successful connection
//    await client.db("admin").command({ping: 1});
//    console.log(
//      "Pinged your deployment. You successfully connected to MongoDB!"
//    );
//  } finally {
//    // Ensures that the client will close when you finish/error
//    // await client.close();
//  }
//}
//run().catch(console.dir);
