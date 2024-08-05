require("dotenv").config();

const express = require("express");
const app = express();
const axios = require("axios");
var bodyParser = require("body-parser");

const PORT = process.env.PORT || 3000;

app.use(bodyParser.urlencoded());
app.use(bodyParser.json());
app.use(express.json());

// const checkallowedhost = (req, res, next) => {
//   const allowedHost = ["localhost", "127.0.0.1"];
//   const host = req.get("host").split(":")[0];
//   if (allowedHost.includes(host)) {
//     next();
//   } else {
//     res.status(403).json({ error: "Not allowed" });
//   }
// };

// app.use(checkallowedhost);

app.get("/CRMendPoint", async (req, res) => {
  try {
    // const response = await axios.get('http://127.0.0.1:3000/test');
    // res.status(200).json(response.data);
    // console.log(response);
    res.status(200).json({ message: "Test get endpoint" });
  } catch (error) {
    res.status(500).json({ error: "An error occurred while fetching data" });
  }
});

app.post("/CRMendPoint", async (req, res) => {
  try {
    if (!req.body) res.status(400).json({ error: "No request body" });
    const key = {
      key: "value",
    };
    var data = { ...req.body, ...key };
    const response = await axios.post(`${req.protocol}://${req.get('host')}/test`, data);
    res.status(200).json(response.data);
  } catch (error) {
    res.status(500).json({ error: "An error occurred while fetching data" });
  }
});

app.post("/test", (req, res) => {
  try {
      res.status(200).json({ message: "Test post endpoint" });
  } catch (error) {
    res.status(500).json({ error: "An error occurred while fetching data" });
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
