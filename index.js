require("dotenv").config(); // Load environment variables from .env file

const express = require("express");
const app = express();
const cors = require("cors");
const axios = require("axios");

var bodyParser = require("body-parser");

const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(express.json());

const checkallowedhost = (req, res, next) => {
  const allowedHost = [
    "localhost",
    "127.0.0.1",
    "freshstartagents.com",
    "irshelpers.com",
    "itistaxtime.com",
    "cr-mend-points.vercel.app",
  ];

  const host = req.get("host").split(":")[0];

  if (allowedHost.includes(host)) {
    next();
  } else {
    res.status(403).json({ error: "Not allowed" });
  }
};

app.use(checkallowedhost);

app.post("/test", (req, res) => {
  try {
    res
      .status(200)
      .json({ message: `Test endpoint 200 SUCCESS ${process.env.TEST_ENV}` });
  } catch (error) {
    res.status(500).json({ error: "An error occurred while fetching data" });
  }
});

app.post("/CRMendPoint", async (req, res) => {
  try {
    checkallowedhost(req, res, () => {
      if (!req.body) {
        return res.status(400).json({ error: "No request body" });
      }

      const {
        FNAME: firstName,
        LNAME: lastName,
        EMAIL: email,
        STATE: state,
        UDF119: userIP,
        UDF130: UDF130,
        UDF88: UDF88,
        UDF142: UDF142,
        UDF153: UDF153,
        UDF89: UDF89,
        HOME_PHONE: phone,
      } = req.body;

      if (!firstName || !lastName || !email || !state || !phone) {
        return res.status(400).json({ error: "Missing required fields" });
      }

      const leadData = {
        FNAME: firstName,
        LNAME: lastName,
        EMAIL: email,
        HOME_PHONE: phone,
        STATE: state,
        LEAD_PROVIDER_ID: "Weblead",
        DISTRIBUTIONID: 21,
        UDF130: UDF130,
        UDF88: UDF88,
        UDF142: UDF142,
        UDF153: UDF153,
        UDF89: UDF89,
        UDF119: userIP,
        NOTES: JSON.stringify({
          HelpWith: "Unfiled Tax Returns Liability",
        }),
        apiKey: process.env.API_KEY,
      };

      const queryParams = new URLSearchParams(leadData).toString();
      const crmEndpoint = `https://ideal.irslogics.com/postLead.aspx?${queryParams}`;

      axios
        .get(crmEndpoint)
        .then((response) => {
          const contentType = response.headers["content-type"];
          if (contentType && contentType.indexOf("application/json") !== -1) {
            res.status(200).json(response.data);
          } else {
            const data = response.data;
            // Parse the response text
            const caseIDMatch = data.match(/CaseID:\s*(\d+)/);
            const officerNameMatch = data.match(/SetOfficerName:\s*([\w\s]+)/);
            const parsedData = {
              message: "Lead imported successfully",
              caseID: caseIDMatch ? caseIDMatch[1] : null,
              officerName: officerNameMatch ? officerNameMatch[1] : null,
            };
            res.status(200).json(parsedData);
          }
        })
        .catch((error) => {
          console.error("Fetch error:", error);
          res
            .status(500)
            .json({ error: "An error occurred while fetching data" });
        });
    });
  } catch (error) {
    console.error("Server error:", error);
    res
      .status(500)
      .json({
        error: "An error occurred while processing the request",
        details: error.message,
      });
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
