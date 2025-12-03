import { v2 as cloudinary } from "cloudinary"

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME!,
  api_key: process.env.CLOUDINARY_API_KEY!,
  api_secret: process.env.CLOUDINARY_API_SECRET!
})

export const uploadImage = (fileBuffer: Buffer, folder: string): Promise<string> => {
  // console.log("Cloudinary config:", {
  //   cloud_name: process.env.CLOUDINARY_CLOUD_NAME!,
  //   api_key: process.env.CLOUDINARY_API_KEY!,
  //   api_secret: process.env.CLOUDINARY_API_SECRET!
  // });

  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      { folder },
      (error, result) => {
        if (error) return reject(error)
        if (!result) return reject("Upload failed with no result")

        resolve(result.secure_url)
      } 
    )

    uploadStream.end(fileBuffer)
  })
}
 