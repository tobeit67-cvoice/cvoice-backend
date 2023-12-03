import fs from "fs";
import multer from "multer";

const destinationFolder = "data/uploads/";
const processedFileFolder = "data/processed/";

const createIfNotExist = (path: string) => {
	if (!fs.existsSync(path)) {
		fs.mkdirSync(path, {
			recursive: true,
		});
	}
};

const storage = multer.diskStorage({
	destination: (req, file, cb) => {
		createIfNotExist(destinationFolder);
		createIfNotExist(processedFileFolder);
		cb(null, destinationFolder);
	},
	filename: (req, file, cb) => {
		cb(null, `${Date.now()}-${file.originalname.replace(/ /g, "_")}`);
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
