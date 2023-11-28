import dotenv from "dotenv";
dotenv.config();

import "./interfaces/express";

import app from "./app";
import { loadRoutes } from "./services/router";

loadRoutes(app);

if (!process.env.PORT) {
	app.log("No port specified.");
	app.log("Have you created a .env file?");
	process.exit(1);
}

app.listen(process.env.PORT, () => {
	app.log(`Listening at http://localhost:${process.env.PORT}`);
});
