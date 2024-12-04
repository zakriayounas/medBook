import { cloudinary } from "../service/cloudinary.config";

const uploadToCloudinary = (fileUri, fileName) => {
    return new Promise((resolve, reject) => {
        cloudinary.uploader
            .upload(fileUri, {
                invalidate: true,
                resource_type: "auto",
                filename_override: fileName,
                folder: "prescripto_doc",
                use_filename: true,
            })
            .then((result) => {
                resolve({ success: true, result });
            })
            .catch((error) => {
                reject({ success: false, error });
            });
    });
};

export const handleFileUpload = async (file) => {
    try {
        const fileBuffer = await file.arrayBuffer();

        const mimeType = file.type;
        const base64Data = Buffer.from(fileBuffer).toString("base64");

        const fileUri = `data:${mimeType};base64,${base64Data}`;

        const uploadResponse = await uploadToCloudinary(fileUri, file.name);

        if (uploadResponse.success && uploadResponse.result) {
            return {
                public_id: uploadResponse.result.public_id,
                secure_url: uploadResponse.result.secure_url,
                success: true,
            };
        } else {
            return { success: false, error: uploadResponse.error || "Unknown error" };
        }
    } catch (error) {
        console.error("Error in file upload:", error);
        return {
            success: false,
            error: error.message || "An unexpected error occurred",
        };
    }
};

export const handleFileDelete = async (public_id) => {
    return new Promise((resolve, reject) => {
        cloudinary.uploader
            .destroy(public_id)
            .then((result) => {
                resolve({ success: true, result });
            })
            .catch((error) => {
                reject({ success: false, error });
            });
    });
}