
import express from "express";
import { config } from "dotenv";
import cors from "cors";
import fileUpload from "express-fileupload";
import nodemailer from "nodemailer";

const app = express();

// Load environment variables
config({ path: "./config.env" });

// Middleware
app.use(cors({
  origin: [process.env.FRONTEND_URL],
  credentials: true,
}));
app.use(express.json()); // Middleware to parse JSON
app.use(fileUpload({
  useTempFiles: true,
  tempFileDir: "/tmp/",
}));

// ✅ Configure Nodemailer Transporter
const transporter = nodemailer.createTransport({
  service: "gmail", // Change based on your email provider
  auth: {
    user: process.env.EMAIL_USER, // Your email
    pass: process.env.EMAIL_PASS, // Your email password or app password
  },
});

// POST route to handle enquiries
app.post("/send-enquiry", async (req, res) => {
  console.log("Received request body:", req.body); // Debugging

  const { name, email, message, itemName, itemCompany, itemCategory, itemDescription, itemImage } = req.body;

  if (!name || !email || !message) {
    return res.status(400).json({ error: "All fields are required." });
  }

  const mailOptions = {
    from: process.env.EMAIL_USER,
    replyTo: email,
    to: process.env.RECIPIENT_EMAIL,
    subject: `Enquiry about ${itemName}`,
    html: `
      <p><strong>You have received an enquiry from:</strong></p>
      <p><strong>Name:</strong> ${name}</p>
      <p><strong>Email:</strong> ${email}</p>
      <p><strong>Message:</strong> ${message}</p>
      <h3>Item Details</h3>
      <p><strong>Item Name:</strong> ${itemName}</p>
      <p><strong>Company:</strong> ${itemCompany}</p>
      <p><strong>Category:</strong> ${itemCategory}</p>
      <p><strong>Description:</strong> ${itemDescription}</p>
    `,
    
  };

  try {
    await transporter.sendMail(mailOptions);
    res.status(200).json({ message: "Enquiry sent successfully!" });
  } catch (error) {
    console.error("Email sending error:", error);
    res.status(500).json({ error: "Error sending email", details: error.message });
  }
});


export default app;
