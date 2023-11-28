import { Application } from "express";
import homeController from "../routes";
import speechToTextController from "../routes/speech";
import { doResponse } from "./response";

export function loadRoutes(app: Application) {
	app.use("/", homeController);
	app.use("/speech", speechToTextController);

	app.use((req, res) =>
		doResponse(res.status(404), {
			success: false,
		})
	);
}
