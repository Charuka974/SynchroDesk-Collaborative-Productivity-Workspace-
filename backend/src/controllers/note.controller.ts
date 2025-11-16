// ✔ createNote()
// ✔ updateNote()
// ✔ deleteNote()
// ✔ getNotesByWorkspace()
// ✔ getNoteById()


// 4.2 NoteVersionController (premium)

// ✔ saveVersion()
// ✔ getVersions()
// ✔ restoreVersion()


import { Response } from "express"
import { AUthRequest } from "../middleware/auth"
import { uploadImage } from "../utils/cloudinary"

export const createPost = async (req: AUthRequest, res: Response) => {
  try {
    const { title, content, tags } = req.body
    let imageURL = ""

    if (req.file) {
      imageURL = await uploadImage(req.file.buffer, "posts")
    }

    return res.status(201).json({
      message: "Image uploaded successfully",
      imageURL
    })
  } catch (error: any) {
    console.error("Create post error:", error)
    return res.status(500).json({ error: error.message })
  }
}

