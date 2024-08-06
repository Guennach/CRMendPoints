require('dotenv').config(); // Load environment variables from .env file

const express = require("express");
const app = express();
const cors = require("cors");
var   bodyParser = require("body-parser");
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(bodyParser.urlencoded());
app.use(bodyParser.json());
app.use(express.json());

app.post("/test", (req, res) => {
  try {
    res.status(200).json({ message: "Test post endpoint" });
  } catch (error) {
    res.status(500).json({ error: "An error occurred while fetching data" });
  }
});

app.post("/CRMendPoint", async (req, res) => {
  try {
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

    if (!firstName || !lastName || !email || !state ||  !phone) {
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

    fetch(crmEndpoint, {
      method: "GET",
    }).then((response) => {
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const contentType = response.headers.get("content-type");
      if (contentType && contentType.indexOf("application/json") !== -1) {
        res.status(200).json(response.data);
      } else {
        return response.text().then((data) => {
          // Parse the response text
          const caseIDMatch = data.match(/CaseID:\s*(\d+)/);
          const officerNameMatch = data.match(/SetOfficerName:\s*([\w\s]+)/);
          const parsedData = {
            message: "Lead imported successfully",
            caseID: caseIDMatch ? caseIDMatch[1] : null,
            officerName: officerNameMatch ? officerNameMatch[1] : null,
          };
          res.status(200).json(parsedData);
        });
      }
    });
  } catch (error) {
    res.status(500).json({ error: "An error occurred while fetching data" });
  }
});


app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
