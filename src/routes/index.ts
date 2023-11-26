import { Router } from "express";
import { doResponse } from "../services/response";

const router = Router();

router.get("/", (req, res) => {
    doResponse(res, {
        message: "Hello World"
    });
});

export default router;