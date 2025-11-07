# Vercel Blob Upload API - Usage Guide

## Overview

Custom API endpoint for uploading images directly to Vercel Blob storage, bypassing Medusa's file module system.

## API Endpoint

**POST** `/admin/uploads/blob`

Upload files to Vercel Blob storage. Returns public URLs.

### Authentication

Requires Medusa admin authentication token.

### Request

**Headers:**
```
Content-Type: multipart/form-data
Authorization: Bearer {admin_token}
```

**Body:**
- `files`: One or more files to upload

### Response

**Success (200):**
```json
{
  "uploads": [
    {
      "url": "https://xxxxx.public.blob.vercel-storage.com/image.jpg",
      "key": "https://xxxxx.public.blob.vercel-storage.com/image.jpg"
    }
  ]
}
```

**Error (400/500):**
```json
{
  "message": "Error description"
}
```

## Usage Examples

### cURL

```bash
curl -X POST http://localhost:9000/admin/uploads/blob \
  -H "Authorization: Bearer {your_admin_token}" \
  -F "files=@/path/to/image.jpg"
```

### JavaScript/Fetch

```javascript
const uploadToVercelBlob = async (file) => {
  const formData = new FormData()
  formData.append('files', file)

  const response = await fetch('http://localhost:9000/admin/uploads/blob', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${adminToken}`,
    },
    body: formData,
  })

  const data = await response.json()
  return data.uploads[0].url
}
```

### React Component

```typescript
import { useState } from 'react'

export function ImageUploader() {
  const [uploading, setUploading] = useState(false)
  const [imageUrl, setImageUrl] = useState('')

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setUploading(true)
    
    const formData = new FormData()
    formData.append('files', file)

    try {
      const response = await fetch('/admin/uploads/blob', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${getAdminToken()}`,
        },
        body: formData,
      })

      const data = await response.json()
      setImageUrl(data.uploads[0].url)
    } catch (error) {
      console.error('Upload failed:', error)
    } finally {
      setUploading(false)
    }
  }

  return (
    <div>
      <input type="file" onChange={handleUpload} disabled={uploading} />
      {uploading && <p>Uploading...</p>}
      {imageUrl && <img src={imageUrl} alt="Uploaded" />}
    </div>
  )
}
```

## Integration with Medusa Admin

To use this in the Medusa admin panel, you'll need to customize the product image upload component.

### Option 1: Admin UI Route Extension

Create a custom upload widget in your admin:

**File:** `oysom/src/admin/routes/custom/page.tsx`

```typescript
import { Container, Button } from "@medusajs/ui"

export default function CustomUpload() {
  const handleFileUpload = async (e) => {
    const formData = new FormData()
    formData.append('files', e.target.files[0])

    const res = await fetch('/admin/uploads/blob', {
      method: 'POST',
      body: formData,
    })

    const { uploads } = await res.json()
    console.log('Uploaded:', uploads[0].url)
    // Update your product with this URL
  }

  return (
    <Container>
      <input type="file" onChange={handleFileUpload} />
    </Container>
  )
}
```

### Option 2: Direct API Usage

When creating/updating products via API, use the Vercel Blob URLs:

```javascript
// 1. Upload image to Vercel Blob
const formData = new FormData()
formData.append('files', imageFile)

const uploadRes = await fetch('/admin/uploads/blob', {
  method: 'POST',
  headers: { 'Authorization': `Bearer ${token}` },
  body: formData,
})

const { uploads } = await uploadRes.json()
const imageUrl = uploads[0].url

// 2. Create product with the Vercel Blob URL
await fetch('/admin/products', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`,
  },
  body: JSON.stringify({
    title: 'My Product',
    thumbnail: imageUrl,  // Use Vercel Blob URL
    images: [{ url: imageUrl }],
  }),
})
```

## Delete File API

**DELETE** `/admin/uploads/blob`

Delete a file from Vercel Blob storage.

### Request

```json
{
  "fileKey": "https://xxxxx.public.blob.vercel-storage.com/image.jpg"
}
```

### Example

```javascript
await fetch('/admin/uploads/blob', {
  method: 'DELETE',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`,
  },
  body: JSON.stringify({
    fileKey: 'https://xxxxx.public.blob.vercel-storage.com/image.jpg',
  }),
})
```

## Environment Configuration

Ensure `BLOB_READ_WRITE_TOKEN` is set:

```env
# oysom/.env
BLOB_READ_WRITE_TOKEN=vercel_blob_rw_XXXXXXXXXX_YYYYYYYY
```

Get your token from: https://vercel.com/dashboard/stores

## Testing

Test the endpoint with cURL:

```bash
# Get admin token first
TOKEN=$(curl -X POST http://localhost:9000/admin/auth/token \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@test.com","password":"supersecret"}' \
  | jq -r '.token')

# Upload an image
curl -X POST http://localhost:9000/admin/uploads/blob \
  -H "Authorization: Bearer $TOKEN" \
  -F "files=@test-image.jpg"
```

## Limitations

1. **No Default UI Integration**: This API bypasses Medusa's default file upload UI
2. **Manual Integration Required**: You need to customize admin components to use this endpoint
3. **Authentication Required**: All requests must include admin auth token

## Next Steps

1. Get Vercel Blob token
2. Add to environment variables
3. Restart server
4. Test upload with cURL
5. Integrate with admin panel UI

## Troubleshooting

### "Vercel Blob token not configured"
- Ensure `BLOB_READ_WRITE_TOKEN` is set in `.env`
- Restart the server

### "No files provided"
- Ensure Content-Type is `multipart/form-data`
- Check that file field name is `files`

### "401 Unauthorized"
- Get fresh admin token
- Include Authorization header

## Production Deployment

When deploying to production:

1. Add `BLOB_READ_WRITE_TOKEN` to Vercel/Railway environment variables
2. Update admin UI to use production backend URL
3. Test uploads in production environment