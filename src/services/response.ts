import { Response } from "express";

export function doResponse<T>(
	res: Response,
	{
		success = true,
		message,
		data,
	}: { success?: boolean; message?: string; data?: T }
) {
	return res.json({
		success,
		message,
		data,
	});
}
