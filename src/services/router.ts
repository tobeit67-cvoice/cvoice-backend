import { Application } from "express";
import homeController from "../routes";

export function loadRoutes(app: Application) {
    app.use("/", homeController);
}