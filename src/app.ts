import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors";
import BackgroundTaskQueue from "./services/background-task";

const app = express();

app.log = (message) => console.log(`[App] ${message}`);

app.use((req, res, next) => {
	if (!req.app.locals.task) {
		req.app.locals.task = new BackgroundTaskQueue();
	}
	next();
});
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(
	cors({
		origin: process.env.CORS_ORIGINS?.split(","),
		credentials: true,
		methods: ["GET", "POST", "PUT", "PATCH", "HEAD", "DELETE"],
		allowedHeaders: ["Content-Type", "Accept"],
	})
);

export default app;
