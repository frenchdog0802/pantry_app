import multer from "multer";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import { successResponse, errorResponse } from "../utils/apiResponse.js";
import cloudinary from "../config/cloudinary.js";

// Cloudinary storage
const storage = new CloudinaryStorage({
    cloudinary,
    params: {
        folder: "my_uploads",
        allowed_formats: ["jpg", "png", "jpeg", "webp"],
        // You can auto-rename:
        public_id: (req, file) => Date.now(),
    },
});

const upload = multer({ storage });

// Controller
const uploadImage = [
    upload.single("image"), // field name MUST be "image"
    (req, res) => {
        try {
            if (!req.file) {
                return res
                    .status(400)
                    .json(errorResponse({ message: "No file uploaded" }));
            }

            return res.json(
                successResponse({
                    image_url: req.file.path,     // Cloudinary URL
                    public_id: req.file.filename, // needed for delete
                })
            );
        } catch (err) {
            return res
                .status(500)
                .json(errorResponse({ message: err.message }));
        }
    },
];

const deleteImage = async (req, res) => {
    try {
        const { public_id } = req.params;
        if (!public_id) {
            return res
                .status(400)
                .json(errorResponse({ message: "No public_id provided" }));
        }
        const result = await cloudinary.uploader.destroy(public_id);
        if (result.result !== "ok") {
            return res
                .status(500)
                .json(errorResponse({ message: "Failed to delete image" }));
        }
        return res.json(successResponse({ message: "Image deleted successfully" }));
    } catch (err) {
        return res
            .status(500)
            .json(errorResponse({ message: err.message }));
    }
};

export default {
    uploadImage, deleteImage
};
