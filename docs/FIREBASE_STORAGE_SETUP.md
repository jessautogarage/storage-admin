# Firebase Storage Setup Guide

## Overview
This guide explains how to set up Firebase Storage for the LockifyHub application, including security rules deployment and configuration.

## Storage Rules Deployment

### 1. Install Firebase CLI (if not already installed)
```bash
npm install -g firebase-tools
```

### 2. Login to Firebase
```bash
firebase login
```

### 3. Initialize Firebase Storage Rules (if not done)
If you haven't initialized Firebase in your project yet:
```bash
firebase init
```
Select:
- Firestore
- Storage
- Functions (if needed)

### 4. Deploy Storage Rules
Deploy the storage rules to Firebase:
```bash
firebase deploy --only storage
```

Or deploy all rules:
```bash
firebase deploy
```

## Firebase Configuration

### Environment Variables
Ensure these environment variables are set in your `.env` file:

```env
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
VITE_FIREBASE_DATABASE_URL=https://your_project.firebaseio.com
VITE_USE_EMULATORS=false # Set to true for development
```

## Storage Structure

The application uses the following storage structure:

```
/
├── images/{userId}/               # User profile images
├── listings/{listingId}/          # Listing photos
├── verification/{userId}/         # Verification documents
├── chat/{conversationId}/         # Chat attachments
├── disputes/{disputeId}/          # Dispute evidence
├── system/                        # System/admin uploads
└── temp/{userId}/                 # Temporary uploads
```

## Security Rules Explanation

### Profile Images
- **Read**: Public (for displaying profile pictures)
- **Write**: Owner or Admin only
- **File Type**: Images only (JPEG, PNG, WebP)
- **Size Limit**: 10MB

### Listing Images
- **Read**: Public (for browsing listings)
- **Write**: Authenticated users (hosts)
- **File Type**: Images only
- **Size Limit**: 10MB

### Verification Documents
- **Read**: Owner or Admin only
- **Write**: Owner only
- **File Type**: Images and PDFs
- **Size Limit**: 20MB

### Chat Attachments
- **Read**: Authenticated users (chat participants)
- **Write**: Authenticated users
- **File Type**: Images only
- **Size Limit**: 10MB

## Testing Storage Rules

### Using Firebase Emulator
For development, use the Firebase emulator:

1. Set `VITE_USE_EMULATORS=true` in your `.env` file
2. Start the emulators:
```bash
firebase emulators:start
```

### Manual Testing
1. Upload a file as an authenticated user
2. Try to access another user's files (should fail)
3. Upload oversized files (should fail)
4. Upload invalid file types (should fail)

## Common Issues and Solutions

### Issue: "Firebase Storage: User does not have permission"
**Solution**: Check that:
1. User is properly authenticated
2. Storage rules allow the operation
3. File path matches the expected structure

### Issue: "File too large"
**Solution**: 
1. Check file size limits in rules
2. Implement client-side compression
3. Verify file size before upload

### Issue: "Invalid file type"
**Solution**:
1. Check `contentType` in storage rules
2. Validate file types on client-side
3. Ensure proper MIME types

## Best Practices

### 1. File Naming
- Use consistent naming conventions
- Include timestamps for uniqueness
- Include user IDs for organization

### 2. Image Optimization
- Compress images before upload
- Use appropriate formats (WebP for web)
- Generate thumbnails for large images

### 3. Security
- Always validate file types and sizes
- Use server-side validation when possible
- Implement rate limiting for uploads
- Monitor storage usage and costs

### 4. Error Handling
- Provide clear error messages to users
- Log errors for debugging
- Implement retry mechanisms for failed uploads

## Monitoring and Maintenance

### Storage Usage
Monitor storage usage in Firebase Console:
1. Go to Firebase Console
2. Navigate to Storage
3. Check usage metrics
4. Set up billing alerts

### Performance
- Monitor upload/download speeds
- Implement CDN for frequently accessed files
- Use appropriate regions for storage

### Cleanup
- Implement cleanup for temporary files
- Remove orphaned files from deleted records
- Archive old files if needed

## File Upload Component Usage

### Basic Usage
```jsx
import ImageUpload from '../Common/ImageUpload';

const MyComponent = () => {
  const [images, setImages] = useState([]);
  
  return (
    <ImageUpload
      onImagesChange={setImages}
      maxImages={5}
      folder="my-folder"
      existingImages={images}
    />
  );
};
```

### Advanced Usage
```jsx
<ImageUpload
  onImagesChange={(images) => setFormData(prev => ({ ...prev, images }))}
  maxImages={10}
  folder="listings"
  existingImages={formData.images}
  allowMultiple={true}
  showPreview={true}
  placeholder="Upload property photos"
  description="Show all angles and features of your space"
  accept="image/jpeg,image/png,image/webp"
/>
```

## Troubleshooting

If you encounter issues:

1. Check browser console for errors
2. Verify Firebase configuration
3. Test with Firebase emulator first
4. Check storage rules syntax
5. Verify user authentication status
6. Check file permissions and ownership

For more help, refer to [Firebase Storage Documentation](https://firebase.google.com/docs/storage).