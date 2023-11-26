import express from "express";
import cookieParser from "cookie-parser";
import fileUpload from "express-fileupload";
import cors from "cors";

const app = express();

app.log = (message) => console.log(`[App] ${message}`);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(fileUpload());
app.use(
    cors({
        origin: process.env.CORS_ORIGINS?.split(","),
        credentials: true,
        methods: ["GET","POST","PUT","PATCH","HEAD","DELETE"],
        allowedHeaders: ["Content-Type", "Accept"]
    })
);

export default app;
