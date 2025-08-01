# Cloudinary Setup Guide

This guide provides step-by-step instructions for setting up and configuring Cloudinary for the FluxEdita Premium Landing Page project.

## Table of Contents
1. [Prerequisites](#prerequisites)
2. [Cloudinary Account Setup](#cloudinary-account-setup)
3. [Environment Variables](#environment-variables)
4. [Upload Preset Configuration](#upload-preset-configuration)
5. [Folder Structure](#folder-structure)
6. [Testing the Integration](#testing-the-integration)
7. [Troubleshooting](#troubleshooting)

## Prerequisites
- A Cloudinary account (Free tier or higher)
- Node.js and npm installed
- Basic understanding of environment variables

## Cloudinary Account Setup

1. **Create a Cloudinary Account**
   - Go to [Cloudinary Sign Up](https://cloudinary.com/users/register/free)
   - Sign up with your email or use a third-party provider
   - Verify your email address

2. **Get Your Cloudinary Credentials**
   - After logging in, go to the Dashboard
   - Note down your `Cloud Name` (visible in the Dashboard)
   - Go to Account Details > API section
   - Note down your `API Key` and `API Secret`

## Environment Variables

Update your `.env.local` file with the following Cloudinary variables:

```env
# Cloudinary Configuration
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=your_cloud_name
NEXT_PUBLIC_CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET=your_upload_preset
CLOUDINARY_URL=cloudinary://your_api_key:your_api_secret@your_cloud_name
```

## Upload Preset Configuration

1. **Create an Upload Preset**
   - In Cloudinary Dashboard, go to Settings > Upload
   - Scroll down to the "Upload presets" section
   - Click "Add upload preset"

2. **Configure Upload Preset**
   - **Preset name**: `m1_default` (or update the env variable if you choose a different name)
   - **Signing mode**: `Signed` (required for server-side uploads)
   - **Asset folder**: `portfolio` (or your preferred folder name)
   - **Use asset folder as public ID prefix**: `Enabled`
   - **Storage**: Keep default settings
   - **Upload manipulation**: Configure as needed
   - **Access control**: `Public` (unless you need private assets)
   - **Save** the preset

## Folder Structure

The application is configured to use the following folder structure in Cloudinary:

```
portfolio/
  ├── images/
  └── videos/
```

All media uploaded through the application will be stored in the `portfolio` folder by default. The Media Library in the application will only show files from this folder.

## Testing the Integration

1. **Test Upload**
   - Start the development server: `npm run dev`
   - Visit `http://localhost:3000/test-upload`
   - Try uploading an image
   - Verify the file appears in your Cloudinary Media Library under the `portfolio` folder

2. **Test Media Library**
   - Navigate to the Media section in the admin panel
   - Try viewing and selecting media from Cloudinary
   - Verify that only files from the `portfolio` folder are shown

## Troubleshooting

### Common Issues

1. **Upload Failing**
   - Verify all environment variables are set correctly
   - Check browser console for specific error messages
   - Ensure the upload preset exists and is properly configured

2. **Media Not Showing in Library**
   - Verify the media is in the correct folder in Cloudinary
   - Check the network tab in browser dev tools for API call errors
   - Ensure the folder name in the code matches your Cloudinary folder

3. **Authentication Errors**
   - Double-check your API key and secret
   - Ensure the CLOUDINARY_API_SECRET is not exposed in client-side code
   - Verify the CLOUDINARY_URL format is correct

### Debugging

1. **Check Server Logs**
   - Look for any error messages in the terminal where you're running `npm run dev`

2. **Browser Developer Tools**
   - Check the Console tab for JavaScript errors
   - Check the Network tab for failed API requests

## Next Steps

- [ ] Set up automatic cleanup of unused assets
- [ ] Configure image transformations and optimizations
- [ ] Set up webhooks for media processing events
- [ ] Implement CDN caching strategy

## Additional Resources

- [Cloudinary Documentation](https://cloudinary.com/documentation)
- [Cloudinary Node.js SDK](https://cloudinary.com/documentation/node_integration)
- [Cloudinary React Components](https://cloudinary.com/documentation/react_integration)

---

## Updating Cloudinary Credentials

When you add or change your Cloudinary credentials, follow these steps:

1. **Update your `.env` file** with your Cloudinary `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, and `CLOUDINARY_API_SECRET` values.
2. **Restart your app/server** (if required by your framework) so the new environment variables are loaded.
3. **No further code changes are needed.** All Cloudinary features in the app (media library, uploads, media cards, etc.) will automatically use the new credentials from the `.env` file.

### Summary Table

| Step                        | Required? | Notes                                                      |
|-----------------------------|-----------|------------------------------------------------------------|
| Update `.env`               | Yes       | Must include correct Cloudinary credentials                 |
| Update media library API    | No        | Uses env vars automatically                                |
| Update media card component | No        | Uses env vars automatically                                |
| Update other code           | No        | Unless credentials are hardcoded (not recommended)          |
| Restart app/server          | Maybe     | Required if env vars are loaded at startup                 |

> **Note:**
> After updating your `.env` file with your Cloudinary credentials, no further code changes are required. All Cloudinary features in the app will automatically use the new credentials. Just update `.env` and restart the app if necessary.

---

*Last Updated: July 2025*
