import dotenv from "dotenv";
dotenv.config();

import "./interfaces/express";

import app from "./app";
import { loadRoutes } from "./services/router";

loadRoutes(app);

app.listen(process.env.PORT, () => {
    app.log(`Listening at http://localhost:${process.env.PORT}`);
});