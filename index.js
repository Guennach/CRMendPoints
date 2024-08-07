require("dotenv").config(); // Load environment variables from .env file

const express = require("express");
const app = express();
const cors = require("cors");
const axios = require("axios");
const qs = require("qs"); // Require the qs module

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
      const crmEndpoint = `${process.env.URL}?${queryParams}`;

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




const sendVerificationSms = (phone) =>{
  const serviceName = process.env.SERVICE_NAME;
  const url = `https://verify.twilio.com/v2/Services/${serviceName}/Verifications`;
  const data = qs.stringify({
    'To': phone,
    'Channel': 'sms'
  });
  const auth = {
    username: process.env.USER,
    password: process.env.PASS
  };
  console.log('Sending verification SMS to:', phone);
  console.log('Service name:', serviceName);
  console.log('URL:', url);
  console.log('Data:', data);
  console.log('Auth:', auth);
  axios.post(url, data, {
    auth: auth,
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded'
    }
  })
  .then(response => {
    console.log(response.data);
  })
  .catch(error => {
    if (error.response) {
      console.error('Response data:', error.response.data);
      console.error('Response status:', error.response.status);
      console.error('Response headers:', error.response.headers);
    } else if (error.request) {
      console.error('Request data:', error.request);
    } else {
      console.error('Error message:', error.message);
    }
    console.error('An error occurred during the request.');
  });
}

const CheckVerficationOTP = (code, phone) =>{
  const serviceName = process.env.SERVICE_NAME;
  const url = `https://verify.twilio.com/v2/Services/${serviceName}/VerificationCheck`;
  const data = qs.stringify({
    'To': phone,
    'Code': code
  });
  const auth = {
    username: process.env.USER,
    password: process.env.PASS
  };
 
  axios.post(url, data, {
    auth: auth,
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded'
    }
  })
  .then(response => {
    console.log(response.data);
    console.log('Verification successful:', code);
    console.log('Collected data:', collected_data);

  })
  .catch(error => {
    if (error.response) {
      console.error('Response data:', error.response.data);
      console.error('Response status:', error.response.status);
      console.error('Response headers:', error.response.headers);
    } else if (error.request) {
      console.error('Request data:', error.request);
    } else {
      console.error('Error message:', error.message);
    }
    console.error('An error occurred during the request.');
  }); 
}



app.post("/sendVerificationSms", (req, res) => {
  try {
    const { phone } = req.body;
    sendVerificationSms(phone);
    res.status(200).json({ message: "Verification SMS sent successfully" });
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ error: "An error occurred while sending SMS" });
  }
});

app.post("/CheckVerficationOTP", (req, res) => {
  try {
    const { code, phone } = req.body;
    if (!code) {
      return res.status(400).json({ error: "Missing required fields" });
    }
    CheckVerficationOTP(code, phone);
    res.status(200).json({ message: "Verification OTP checked successfully" });
  } catch (error) {
    res.status(500).json({ error: "An error occurred while checking OTP" });
  }
});








app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
