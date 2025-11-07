import { Logger } from "@medusajs/framework/types"
import { put, del } from "@vercel/blob"
import { Readable } from "stream"

type InjectedDependencies = {
  logger: Logger
}

type Options = {
  token?: string
}

interface FileData {
  originalname: string
  buffer: Buffer
  mimetype: string
  [key: string]: any
}

interface UploadStreamDescriptorType {
  fileKey: string
  url?: string
  [key: string]: unknown
}

interface GetUploadStreamResult {
  writeStream: Readable
  promise: Promise<UploadStreamDescriptorType>
  url: string
  fileKey: string
  [key: string]: unknown
}

interface DeleteFileType {
  fileKey: string
  [key: string]: unknown
}

interface FileServiceGetUploadStreamResult {
  writeStream: Readable
  promise: Promise<any>
  url: string
  fileKey: string
  [key: string]: unknown
}

class VercelBlobFileService {
  protected logger_: Logger
  protected token_: string

  constructor(
    { logger }: InjectedDependencies,
    options: Options
  ) {
    this.logger_ = logger
    this.token_ = options.token || process.env.BLOB_READ_WRITE_TOKEN || ""

    if (!this.token_) {
      throw new Error(
        "Vercel Blob token is required. Please set BLOB_READ_WRITE_TOKEN environment variable."
      )
    }
  }

  async upload(file: FileData): Promise<UploadStreamDescriptorType> {
    try {
      const blob = await put(file.originalname, file.buffer, {
        access: "public",
        token: this.token_,
        contentType: file.mimetype,
      })

      this.logger_.info(`File uploaded to Vercel Blob: ${blob.url}`)

      return {
        fileKey: blob.url,
        url: blob.url,
      }
    } catch (error) {
      this.logger_.error(`Error uploading file to Vercel Blob: ${error}`)
      throw error
    }
  }

  async uploadProtected(file: FileData): Promise<UploadStreamDescriptorType> {
    return await this.upload(file)
  }

  async delete(file: DeleteFileType): Promise<void> {
    try {
      // Extract the pathname from the full URL
      const url = new URL(file.fileKey)
      const pathname = url.pathname.substring(1) // Remove leading slash
      
      await del(pathname, { token: this.token_ })
      
      this.logger_.info(`File deleted from Vercel Blob: ${pathname}`)
    } catch (error) {
      this.logger_.error(`Error deleting file from Vercel Blob: ${error}`)
      throw error
    }
  }

  async getUploadStreamDescriptor(
    fileData: { name: string; ext?: string; [key: string]: unknown }
  ): Promise<FileServiceGetUploadStreamResult> {
    const fileName = `${fileData.name}${fileData.ext || ""}`
    const fileKey = `${Date.now()}-${fileName}`

    const chunks: Buffer[] = []
    const writeStream = new Readable({
      read() {},
    })

    const promise = new Promise<UploadStreamDescriptorType>(
      async (resolve, reject) => {
        writeStream.on("data", (chunk) => {
          chunks.push(Buffer.from(chunk))
        })

        writeStream.on("end", async () => {
          try {
            const buffer = Buffer.concat(chunks)
            const blob = await put(fileKey, buffer, {
              access: "public",
              token: this.token_,
            })

            resolve({
              fileKey: blob.url,
              url: blob.url,
            })
          } catch (error) {
            reject(error)
          }
        })

        writeStream.on("error", reject)
      }
    )

    return {
      writeStream,
      promise,
      url: `https://vercel.blob.store/${fileKey}`,
      fileKey,
    }
  }

  async getDownloadStream(
    fileData: { fileKey: string; [key: string]: unknown }
  ): Promise<NodeJS.ReadableStream> {
    const response = await fetch(fileData.fileKey)
    if (!response.ok || !response.body) {
      throw new Error(`Failed to download file: ${response.statusText}`)
    }
    return Readable.from(response.body as any)
  }

  async getPresignedDownloadUrl(
    fileData: { fileKey: string; [key: string]: unknown }
  ): Promise<string> {
    // Vercel Blob URLs are already public, so we just return the URL
    return fileData.fileKey
  }
}

export default VercelBlobFileService