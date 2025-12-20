export async function uploadImage(file: File) {
    const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
    const uploadPreset = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET;
    const apiKey = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_API_KEY;

    if (!cloudName || !uploadPreset || !apiKey) {
        throw new Error("Cloudinary configuration missing. Please check your .env file.");
    }

    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", uploadPreset);
    formData.append("api_key", apiKey);

    const res = await fetch(
        `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
        {
            method: "POST",
            body: formData,
        }
    );

    if (!res.ok) {
        const errorData = await res.json();
        console.error("Cloudinary upload error:", errorData);
        throw new Error(errorData.error?.message || "Cloudinary upload failed");
    }

    return await res.json();
}