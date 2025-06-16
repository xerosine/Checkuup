import dotenv from "dotenv";
import ejs from "ejs";
import express from "express";
import formidable from "express-formidable";
import mongoSanitize from "express-mongo-sanitize";
import Joi from "joi";
import mongoose from "mongoose";
import { fileURLToPath } from "node:url";
import path from "path";
import sanitizeHtml from "sanitize-html";
import { Contact, Newsletter } from "./models.js";

dotenv.config();

const isProduction = process.env.NODE_ENV === "production";
console.log(process.env.NODE_ENV);

// const dbURI = isProduction
//   ? process.env.DB_URI
//   : "mongodb://127.0.0.1:27017/checkuup";
const port = Number(process.env.PORT) || 3000;
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.DB_URI);
    console.log("mongo connected succesfully!");
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit();
  }
};

connectDB();

const stripHtml = (value, helpers) => {
  return sanitizeHtml(value, {
    allowedTags: [],
    allowedAttributes: {},
  });
};

const app = express();

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.static(path.join(__dirname, "assets")));
// app.use(
//   mongoSanitize({
//     allowDots: true,
//     replaceWith: "_",
//   })
// );

app.get("/", (req, res) => {
  res.render("home");
});

app.get("/terms-and-conditions", (req, res) => {
  res.render("termsAndConditions");
});

app
  .route("/contact-us")
  .get((req, res) => {
    res.render("contactUs");
  })
  .post(formidable(), async (req, res) => {
    try {
      console.log(req.fields);
      const { error, value } = Joi.object({
        name: Joi.string().trim().required().custom(stripHtml),
        email: Joi.string().email().required(),
        subject: Joi.string()
          .valid(
            "generalInquiry",
            "corporateWellness",
            "partnerships",
            "media",
            "technicalSupport"
          )
          .required(),
        message: Joi.string().trim().required().custom(stripHtml),
      })
        .required()
        .options({ allowUnknown: false })
        .validate(req.fields);

      if (error)
        return res.status(400).json({
          message: error.message,
        });      

      const contact = new Contact(value);
      await contact.save();
      res.status(200).json({ message: "Form submitted successfully!" });
    } catch (error) {
      console.error(error);
      res
        .status(500)
        .json({ message: "Something went wrong, please try again." });
    }
  });

app.post("/join-the-movement", formidable(), async (req, res) => {
  try {
    console.log(req.fields);
    const { error, value } = Joi.object({
      name: Joi.string().trim().required().custom(stripHtml),
      email: Joi.string().email().required(),
    })
      .required()
      .options({ allowUnknown: false })
      .validate(req.fields);

    if (error)
      return res.status(400).json({
        message: error.message,
      });
      
    const existingEmail = await Newsletter.findOne({email: value.email})
    if (existingEmail) return res.status(400).json({message: "You're already subscribed!"})

    const newsletter = new Newsletter(value);
    await newsletter.save();
    res.status(200).json({ message: "Form submitted successfully!" });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ message: "Something went wrong, please try again." });
  }
});

app.use((req, res) => {
  res.status(404).send("<h3>Error 404, Invalid Resource Location</h3>");
});

app.listen(port, () => {
  console.log("Listening on port", port);
});
