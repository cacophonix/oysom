import type { MedusaRequest, MedusaResponse } from "@medusajs/framework"
import { put, del } from "@vercel/blob"

interface FileData {
  originalname: string
  buffer: Buffer
  mimetype: string
}

/**
 * Standard Medusa upload endpoint that admin UI uses
 * POST /admin/uploads
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

    // Get the files from the request
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
        message: "Vercel Blob token not configured. Please set BLOB_READ_WRITE_TOKEN in environment variables.",
      })
      return
    }

    // Upload all files to Vercel Blob
    const uploadPromises = files.map(async (file, index) => {
      // Generate unique filename to avoid conflicts
      const timestamp = Date.now()
      const filename = `${timestamp}-${file.originalname}`
      
      const blob = await put(filename, file.buffer, {
        access: "public",
        token: token,
        contentType: file.mimetype,
      })

      // Return in exact format Medusa admin expects
      return {
        id: blob.url, // Use URL as ID
        url: blob.url,
        key: blob.url,
        name: file.originalname,
        size: file.buffer.length,
        mime_type: file.mimetype,
      }
    })

    const uploads = await Promise.all(uploadPromises)

    // Return files array directly (not wrapped in object)
    res.status(200).json({
      files: uploads,
    })
  } catch (error: any) {
    console.error("Vercel Blob upload error:", error)
    res.status(500).json({
      message: error.message || "Failed to upload to Vercel Blob",
      error: error.toString(),
    })
  }
}

/**
 * Delete uploaded file
 * DELETE /admin/uploads
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

    try {
      // Extract pathname from URL if full URL is provided
      const url = new URL(fileKey)
      const pathname = url.pathname.substring(1) // Remove leading slash

      await del(pathname, { token })

      res.status(200).json({
        message: "File deleted successfully",
        key: fileKey,
      })
    } catch (urlError) {
      // If not a URL, try as direct path
      await del(fileKey, { token })
      
      res.status(200).json({
        message: "File deleted successfully",
        key: fileKey,
      })
    }
  } catch (error: any) {
    console.error("Vercel Blob delete error:", error)
    res.status(500).json({
      message: error.message || "Failed to delete from Vercel Blob",
      error: error.toString(),
    })
  }
}

/**
 * Get presigned URL for protected files (not needed for public Vercel Blob, but included for compatibility)
 * GET /admin/uploads/download/:fileKey
 */
export async function GET(
  req: MedusaRequest,
  res: MedusaResponse
): Promise<void> {
  try {
    const fileKey = req.params?.fileKey || req.query?.fileKey

    if (!fileKey) {
      res.status(400).json({
        message: "fileKey is required",
      })
      return
    }

    // For Vercel Blob public URLs, just return the URL
    // No presigned URL needed since files are public
    res.status(200).json({
      download_url: fileKey,
    })
  } catch (error: any) {
    console.error("Error getting download URL:", error)
    res.status(500).json({
      message: error.message || "Failed to get download URL",
    })
  }
}