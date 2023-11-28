import { Response } from "express";

export function doResponse<T>(
	res: Response,
	{
		status = 200,
		message,
		data,
	}: { status?: number; message?: string; data?: T }
) {
	return res.status(status).json({
		success: status === 200 ? true : false,
		message,
		data,
	});
}
