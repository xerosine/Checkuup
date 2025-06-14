import dotenv from "dotenv";
import ejs from "ejs";
import express from "express";
import formidable from "express-formidable";
import mongoSanitize from "express-mongo-sanitize";
import joi from "joi";
import mongoose from "mongoose";
import { fileURLToPath } from "node:url";
import path from "path";

dotenv.config();

const isProduction = process.env.NODE_ENV === "production";
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

const app = express();

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.static(path.join(__dirname, "assets")));
// app.use(formidable({}));

app.get("/", (req, res) => {
  res.render("home");
});

app.get("/terms-and-conditions", (req, res) => {
  res.render("termsAndConditions");
});

app.use((req, res) => {
    res.status(404).send("<h3>Error 404, Invalid Resource Location</h3>");
});

app.listen(port, () => {
  console.log("Listening on port", port);
});
