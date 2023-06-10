const express = require("express");
const app = express();
const cors = require("cors");
const port = process.env.PORT || 5003;

//? middleware
app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.send(" Yoga Camp is held on School premises");
});

app.listen(port, () => {
  console.log(`Yoga Camp is running this whole month on ${port}`);
});
