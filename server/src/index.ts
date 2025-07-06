import express from "express";
import dotenv from "dotenv";
import bodyParser from "body-parser";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import cookieParser from "cookie-parser";

// ROUTES IMPORTS
import userRoutes from "./routes/userRoutes";

// CONFIGURATIONS
dotenv.config();
const app = express();
app.use(express.json());
app.use(helmet());
app.use(helmet.crossOriginResourcePolicy({ policy: "cross-origin" }));
app.use(morgan("common"));
app.use(bodyParser.json());
app.use(
  cors({
    // origin: [] here I have to work a lot later
    origin: process.env.CORS_ORIGIN,
    credentials: true,
  })
);
app.use(
  express.json({
    limit: "16kb",
  })
);
app.use(express.json({ limit: "16kb" }));
app.use(express.urlencoded({ extended: true, limit: "200mb" }));
app.use(express.static("public"));
app.use(cookieParser());

// ROUTES
app.get("/", (req, res) => {
  res.send("This is home route.");
});
app.use("/", userRoutes);

// SERVER
const port = Number(process.env.PORT) || 3000;
app.listen(port, () => {
  console.log(`Server running on port: ${port}`);
});
