import multer from "multer";
import fs from "fs";

const destinationFolder = "data/uploads/";

const storage = multer.diskStorage({
	destination: (req, file, cb) => {
		if (!fs.existsSync(destinationFolder)) {
			fs.mkdirSync(destinationFolder, {
				recursive: true,
			});
		}
		cb(null, destinationFolder);
	},
	filename: (req, file, cb) => {
		cb(null, `${Date.now()}-${file.originalname}`);
	},
});

const upload = multer({
	storage,
	fileFilter: (req, file, cb) => {
		// We might provide support for other audio formats in the future.
		// Since wav files is the easiest to work with, we'll stick with that for now.

		if (file.mimetype.startsWith("audio/wav")) {
			cb(null, true);
		}

		// if (file.mimetype.startsWith("audio/")) {
		// 	cb(null, true);
		// }
		cb(null, false);
	},
});

export { upload };
