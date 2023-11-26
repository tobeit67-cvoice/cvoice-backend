import { Response } from "express";

export function doResponse(
    res: Response,
    {
        success = true,
        message,
        data,
    }: { success?: boolean; message?: string; data?: any }
) {
    return res.json({
        success,
        message,
        data,
    });
}
