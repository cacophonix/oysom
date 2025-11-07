import type { MedusaRequest, MedusaResponse } from "@medusajs/framework"
import { put, del } from "@vercel/blob"

interface FileData {
  originalname: string
  buffer: Buffer
  mimetype: string
}

/**
 * Upload file to Vercel Blob storage
 * POST /admin/uploads/blob
 */
export async function POST(
  req: MedusaRequest,
  res: MedusaResponse
): Promise<void> {
  try {
    const contentType = req.headers["content-type"] || ""
    
    if (!contentType.includes("multipart/form-data")) {
      res.status(400).json({
        message: "Content-Type must be multipart/form-data",
      })
      return
    }

    // Get the file from the request
    const files = (req as any).files as FileData[]
    
    if (!files || files.length === 0) {
      res.status(400).json({
        message: "No files provided",
      })
      return
    }

    const token = process.env.BLOB_READ_WRITE_TOKEN

    if (!token) {
      res.status(500).json({
        message: "Vercel Blob token not configured",
      })
      return
    }

    // Upload all files to Vercel Blob
    const uploadPromises = files.map(async (file) => {
      const blob = await put(file.originalname, file.buffer, {
        access: "public",
        token: token,
        contentType: file.mimetype,
      })

      return {
        url: blob.url,
        key: blob.url, // Use URL as key for deletion
      }
    })

    const uploads = await Promise.all(uploadPromises)

    res.status(200).json({
      uploads,
    })
  } catch (error: any) {
    console.error("Vercel Blob upload error:", error)
    res.status(500).json({
      message: error.message || "Failed to upload to Vercel Blob",
    })
  }
}

/**
 * Delete file from Vercel Blob storage
 * DELETE /admin/uploads/blob
 */
export async function DELETE(
  req: MedusaRequest,
  res: MedusaResponse
): Promise<void> {
  try {
    const { fileKey } = req.body as { fileKey: string }

    if (!fileKey) {
      res.status(400).json({
        message: "fileKey is required",
      })
      return
    }

    const token = process.env.BLOB_READ_WRITE_TOKEN

    if (!token) {
      res.status(500).json({
        message: "Vercel Blob token not configured",
      })
      return
    }

    // Extract pathname from URL if full URL is provided
    const url = new URL(fileKey)
    const pathname = url.pathname.substring(1) // Remove leading slash

    await del(pathname, { token })

    res.status(200).json({
      message: "File deleted successfully",
    })
  } catch (error: any) {
    console.error("Vercel Blob delete error:", error)
    res.status(500).json({
      message: error.message || "Failed to delete from Vercel Blob",
    })
  }
}