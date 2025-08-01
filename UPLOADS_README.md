# Media Uploads Documentation

This document outlines how media uploads work in the portfolio website.

## Cloudinary Integration

The website uses Cloudinary for media storage and management. All media files (images and videos) are stored in Cloudinary and served through their CDN.

### Configuration

1. Cloudinary credentials are stored in environment variables:
   ```
   CLOUDINARY_CLOUD_NAME=your_cloud_name
   CLOUDINARY_API_KEY=your_api_key
   CLOUDINARY_API_SECRET=your_api_secret
   ```

2. The Cloudinary configuration is initialized in `lib/cloudinary.ts`

## Gallery Types

The website supports three types of galleries:

1. **Public Gallery** (`public`)
   - Accessible to all visitors
   - Contains general content and previews
   - Located at `/gallery`

2. **Exclusive Gallery** (`exclusive`)
   - Requires membership access
   - Contains premium content
   - Located at `/exclusive`

3. **Behind-the-Scenes** (`behind-scenes`)
   - Requires membership access
   - Contains behind-the-scenes content
   - Located at `/behind-scenes`

## Media Upload Process

1. Files are uploaded via the `MediaDialog` component
2. The server action `saveMediaAction` handles the upload:
   - Validates the file type and size
   - Uploads to Cloudinary
   - Stores metadata in the gallery data
   - Returns the Cloudinary URL

3. Media items are stored in the gallery data with:
   - Unique ID and slug
   - Title and description
   - Cover image URL
   - Image URLs (for image sets)
   - Video URL (for videos)
   - Creation date
   - Gallery type
   - Tags and other metadata

## Hero Images

Each gallery and the about page has a customizable hero image:

1. Hero images are managed through the `GalleryHero` component
2. Images are stored in Cloudinary
3. URLs are persisted in both:
   - Local storage (for quick access)
   - Server-side gallery data (for persistence)

## Development

### Local Storage

During development, media data is stored in:
- `data/gallery.json` - Contains gallery data and media items
- `data/media.json` - Contains media item details

### Testing Uploads

1. Ensure Cloudinary credentials are set in `.env.local`
2. Use the MediaDialog component to upload files
3. Check Cloudinary dashboard to verify uploads
4. Verify media appears in the correct gallery

## Production Considerations

### Security
- All uploads are processed through Cloudinary
- File type validation is enforced
- Authentication is required for exclusive content
- API keys are stored securely in environment variables

### Performance
- Cloudinary's CDN ensures fast delivery
- Images are automatically optimized
- Videos are streamed efficiently
- Thumbnails are generated automatically

### Backup
- Cloudinary provides automatic backup
- Gallery data is stored in version control
- Regular exports of gallery data are recommended

### Maintenance
- Monitor Cloudinary usage and quotas
- Regularly review and clean up unused media
- Keep gallery data organized and tagged
- Update hero images as needed

## Troubleshooting

### Common Issues

1. **Upload Failures**
   - Check Cloudinary credentials
   - Verify file size and type
   - Check network connection

2. **Media Not Appearing**
   - Verify gallery type is correct
   - Check Cloudinary URL format
   - Clear local storage if needed

3. **Hero Image Issues**
   - Check both local storage and gallery data
   - Verify image URL format
   - Clear browser cache if needed
