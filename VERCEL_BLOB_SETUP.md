# Vercel Blob Storage Setup Guide

This guide explains how to configure Vercel Blob storage for product image uploads in your Medusa backend.

## Overview

Vercel Blob storage provides a simple, scalable solution for storing product images and media files. The integration is already configured in this project and ready to use.

## Prerequisites

1. A Vercel account (free tier is sufficient)
2. Access to your Vercel dashboard

## Setup Steps

### 1. Create a Blob Store in Vercel

1. Go to https://vercel.com/dashboard/stores
2. Click **"Create Database"** or **"Create Store"**
3. Select **"Blob"** from the storage options
4. Give your store a name (e.g., "ojsom-product-images")
5. Click **"Create"**

### 2. Get Your Blob Token

After creating the store:

1. In your Blob store dashboard, click on the **".env.local"** tab
2. Copy the `BLOB_READ_WRITE_TOKEN` value
3. It should look like: `vercel_blob_rw_XXXXXXXXXX_YYYYYYYY`

### 3. Configure Environment Variables

#### Local Development

Update `oysom/.env`:

```env
BLOB_READ_WRITE_TOKEN=vercel_blob_rw_XXXXXXXXXX_YYYYYYYY
```

#### Production

Update `oysom/.env.prd`:

```env
BLOB_READ_WRITE_TOKEN=vercel_blob_rw_XXXXXXXXXX_YYYYYYYY
```

Or add it to your Vercel project settings:
1. Go to your Vercel project
2. Navigate to **Settings** → **Environment Variables**
3. Add variable:
   - **Key**: `BLOB_READ_WRITE_TOKEN`
   - **Value**: Your token
   - **Environment**: Production, Preview, Development

### 4. Rebuild and Restart

```bash
cd oysom
npm run build
npm run dev
```

## How It Works

### File Upload Flow

1. Admin uploads an image through the Medusa admin panel
2. The file is sent to the Medusa backend
3. The Vercel Blob file service processes the upload
4. File is stored in Vercel Blob storage
5. A public URL is returned (e.g., `https://xxxxx.public.blob.vercel-storage.com/image.jpg`)
6. This URL is saved to the database and used by the storefront

### Module Structure

```
oysom/src/modules/file-vercel-blob/
├── index.ts          # Module provider definition
└── service.ts        # Vercel Blob file service implementation
```

### Configuration

The module is configured in [`medusa-config.ts`](medusa-config.ts):

```typescript
modules: [
  {
    resolve: "./src/modules/file-vercel-blob",
    options: {
      token: process.env.BLOB_READ_WRITE_TOKEN,
    },
  },
]
```

## Testing Image Upload

### Via Admin Panel

1. Start the backend: `cd oysom && npm run dev`
2. Access admin at: http://localhost:9000/app
3. Go to **Products** → Create or Edit a product
4. Upload an image in the Media section
5. Save the product
6. The image URL should be a Vercel Blob URL

### Via API (cURL)

```bash
# Upload a file
curl -X POST http://localhost:9000/admin/uploads \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  -F "files=@/path/to/image.jpg"
```

### Verify Upload

Check the response for a URL like:
```
https://xxxxx.public.blob.vercel-storage.com/1234567890-image.jpg
```

## Storefront Image Display

Images are automatically displayed on the storefront using Next.js Image component. The configuration in [`oysom-storefront/next.config.js`](../oysom-storefront/next.config.js) allows Vercel Blob URLs:

```javascript
images: {
  remotePatterns: [
    {
      protocol: "https",
      hostname: "*.public.blob.vercel-storage.com",
    },
  ],
}
```

## Troubleshooting

### Issue: "Vercel Blob token is required"

**Solution**: Ensure `BLOB_READ_WRITE_TOKEN` is set in your `.env` file.

### Issue: Images not uploading

**Checklist**:
1. Verify token is correct
2. Check backend logs for errors
3. Ensure the module is loaded: Look for "File service registered" in logs
4. Try rebuilding: `npm run build`

### Issue: Images not displaying on storefront

**Checklist**:
1. Verify the image URL in the database
2. Check Next.js image configuration includes Vercel Blob hostname
3. Open browser dev tools and check for image loading errors
4. Clear Next.js cache: `rm -rf .next && npm run dev`

### Issue: "Failed to upload file"

**Possible causes**:
- Invalid or expired token
- Network connectivity issues
- File size too large (Vercel Blob limits apply)

**Solution**:
- Generate a new token from Vercel dashboard
- Check your internet connection
- Reduce file size if needed

## File Size Limits

### Vercel Blob Limits (Free Tier)

- Max file size: 4.5 MB per file
- Total storage: 500 MB
- Bandwidth: Unlimited

For larger files or more storage, upgrade your Vercel plan.

## Best Practices

1. **Image Optimization**: Optimize images before upload (compress, resize)
2. **File Naming**: Use descriptive, SEO-friendly filenames
3. **Cleanup**: Delete unused images from Vercel Blob to save storage
4. **Backup**: Vercel Blob is reliable, but consider backing up critical images
5. **Environment Separation**: Use different Blob stores for dev/staging/production

## Alternative: Local File Storage

If you prefer local file storage during development:

1. Install the local file module:
   ```bash
   npm install @medusajs/file-local
   ```

2. Update `medusa-config.ts`:
   ```typescript
   modules: [
     {
       resolve: "@medusajs/file-local",
       options: {
         upload_dir: "uploads",
       },
     },
   ]
   ```

3. Update Next.js config to allow localhost:
   ```javascript
   {
     protocol: "http",
     hostname: "localhost",
   }
   ```

## Cost Considerations

### Vercel Blob Pricing

- **Hobby (Free)**: 500 MB storage, unlimited bandwidth
- **Pro**: $20/month includes 100 GB storage, $0.08/GB after
- **Enterprise**: Custom pricing

For most e-commerce sites, the free tier is sufficient for product images.

## Migration from Other Storage

If migrating from S3, Cloudinary, or other storage:

1. Export all image URLs from your database
2. Download images from old storage
3. Upload to Vercel Blob using the admin panel or API
4. Update product records with new URLs

## Security

- Vercel Blob URLs are public by default
- Tokens should be kept secret (never commit to git)
- Use environment variables for tokens
- Rotate tokens periodically for security

## Additional Resources

- [Vercel Blob Documentation](https://vercel.com/docs/storage/vercel-blob)
- [Medusa File Service Documentation](https://docs.medusajs.com/resources/file-service)
- [Next.js Image Optimization](https://nextjs.org/docs/app/building-your-application/optimizing/images)

## Support

For issues:
1. Check Vercel Blob dashboard for errors
2. Review Medusa backend logs
3. Consult Medusa Discord community
4. Check Vercel support documentation