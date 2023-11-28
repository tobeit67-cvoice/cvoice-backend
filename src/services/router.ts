import { Application } from "express";
import homeController from "../routes";
import speechToTextController from "../routes/speech-to-text";

export function loadRoutes(app: Application) {
	app.use("/", homeController);
	app.use("/speech", speechToTextController);
}
