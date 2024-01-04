const express = require("express");
const nodemailer = require("nodemailer");
const bodyParser = require("body-parser");
const cors = require("cors");

const corsOptions = {
  origin: "http://localhost:3000",
  methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
  credentials: true,
  optionsSuccessStatus: 204,
};

const app = express();
const port = 3001;

app.use(bodyParser.json());
app.use(cors(corsOptions));  

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: "ciocanu.carolina.dev@gmail.com",
    pass: "Karolina23*",
  },
});

app.post("/send-email", async (req, res) => {
  const { to, subject, text } = req.body;

  try {
    const mailOptions = {
      from: "admin@gmail.com",
      to,
      subject,
      text,
    };

    await transporter.sendMail(mailOptions);

    res.status(200).send("Email sent successfully!");
  } catch (error) {
    console.error("Error sending email:", error);
    res.status(500).send("Internal Server Error");
  }
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
