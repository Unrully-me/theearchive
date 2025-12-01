# 📦 AWS S3 Setup Guide - Movie Hosting

## 🎯 Why AWS S3?
- **Reliable:** Amazon's cloud storage
- **Fast:** CDN delivery worldwide
- **Cheap:** Pay only for what you use
- **Scalable:** Upload unlimited movies

---

## 🚀 Quick Setup (10 Minutes)

### Step 1: Create AWS Account
1. Go to https://aws.amazon.com
2. Click "Create an AWS Account"
3. Follow signup process (credit card required)
4. Free tier includes 5GB storage

---

### Step 2: Create S3 Bucket

#### Via AWS Console:
1. Login to AWS Console: https://console.aws.amazon.com
2. Search for "S3" in the services menu
3. Click "Create bucket"
4. Settings:
   - **Bucket name:** `thee-archive-movies` (must be globally unique)
   - **Region:** Choose closest to Uganda (e.g., `eu-west-1` - Ireland)
   - **Block Public Access:** UNCHECK all boxes (we need public access)
   - **Versioning:** Disabled
   - Click "Create bucket"

#### Via AWS CLI:
```bash
# Create bucket
aws s3 mb s3://thee-archive-movies --region eu-west-1

# Make bucket public
aws s3api put-public-access-block \
    --bucket thee-archive-movies \
    --public-access-block-configuration \
    "BlockPublicAcls=false,IgnorePublicAcls=false,BlockPublicPolicy=false,RestrictPublicBuckets=false"

# Add bucket policy for public read
aws s3api put-bucket-policy \
    --bucket thee-archive-movies \
    --policy '{
      "Version": "2012-10-17",
      "Statement": [{
        "Sid": "PublicReadGetObject",
        "Effect": "Allow",
        "Principal": "*",
        "Action": "s3:GetObject",
        "Resource": "arn:aws:s3:::thee-archive-movies/*"
      }]
    }'
```

---

### Step 3: Configure Bucket Policy (Important!)

1. Go to your bucket → Permissions tab
2. Scroll to "Bucket policy"
3. Click "Edit"
4. Paste this policy:

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "PublicReadGetObject",
      "Effect": "Allow",
      "Principal": "*",
      "Action": "s3:GetObject",
      "Resource": "arn:aws:s3:::thee-archive-movies/*"
    }
  ]
}
```

5. Click "Save changes"

---

### Step 4: Upload Your First Movie

#### Via AWS Console:
1. Open your bucket
2. Click "Upload"
3. Drag & drop your movie file
4. Click "Upload"
5. Click on uploaded file
6. Copy "Object URL" (e.g., `https://thee-archive-movies.s3.amazonaws.com/movie.mp4`)

#### Via AWS CLI:
```bash
# Upload movie
aws s3 cp my-movie.mp4 s3://thee-archive-movies/movies/my-movie.mp4 --acl public-read

# Get URL
echo "https://thee-archive-movies.s3.amazonaws.com/movies/my-movie.mp4"
```

---

## 🎬 Movie Upload Workflow

### 1. Prepare Movie File
- Format: MP4 (recommended)
- Resolution: 720p or 1080p
- Audio: AAC codec
- Filename: Use descriptive names (e.g., `kyamundu-2024.mp4`)

### 2. Upload to S3
```bash
# Single upload
aws s3 cp kyamundu-2024.mp4 s3://thee-archive-movies/movies/kyamundu-2024.mp4 --acl public-read

# Bulk upload (entire folder)
aws s3 sync ./movies/ s3://thee-archive-movies/movies/ --acl public-read
```

### 3. Get Public URL
```
https://thee-archive-movies.s3.amazonaws.com/movies/kyamundu-2024.mp4
```

### 4. Add to THEE ARCHIVE
1. Go to your site
2. Click red dot 6x → Admin portal
3. Password: `0701680Kyamundu`
4. Add movie:
   - **AWS Video URL:** Paste S3 URL
   - **Thumbnail URL:** Movie poster image URL
   - Fill other details
   - Save!

---

## 💰 Cost Estimation

### AWS S3 Pricing (as of 2025):
- **Storage:** $0.023 per GB/month
- **Data Transfer (Downloads):** $0.09 per GB

### Example:
- **100 movies** × 1.5GB each = 150GB storage
- **Storage cost:** 150GB × $0.023 = **$3.45/month**
- **10,000 downloads/month** = 15TB transfer
- **Transfer cost:** 15,000GB × $0.09 = **$1,350/month**

💡 **Note:** First 100GB transfer/month is FREE with AWS Free Tier!

---

## 🔧 AWS CLI Installation

### Windows:
```bash
# Download installer from:
# https://awscli.amazonaws.com/AWSCLIV2.msi

# Or via MSI installer:
msiexec.exe /i https://awscli.amazonaws.com/AWSCLIV2.msi
```

### Mac:
```bash
brew install awscli
```

### Linux:
```bash
curl "https://awscli.amazonaws.com/awscli-exe-linux-x86_64.zip" -o "awscliv2.zip"
unzip awscliv2.zip
sudo ./aws/install
```

### Configure:
```bash
aws configure
# AWS Access Key ID: [from IAM console]
# AWS Secret Access Key: [from IAM console]
# Default region: eu-west-1
# Default output format: json
```

---

## 🔐 Create IAM User (For CLI Access)

1. Go to AWS IAM: https://console.aws.amazon.com/iam/
2. Click "Users" → "Add user"
3. Username: `thee-archive-uploader`
4. Access type: ✅ Programmatic access
5. Permissions: Attach "AmazonS3FullAccess" policy
6. Create user
7. **SAVE ACCESS KEYS!** (shown only once)
8. Use these keys in `aws configure`

---

## 🎨 Movie Thumbnail Hosting

### Option 1: Host on S3 (same bucket)
```bash
aws s3 cp poster.jpg s3://thee-archive-movies/posters/poster.jpg --acl public-read
# URL: https://thee-archive-movies.s3.amazonaws.com/posters/poster.jpg
```

### Option 2: Use Free Image Hosting
- **ImgBB:** https://imgbb.com
- **Cloudinary:** https://cloudinary.com
- **Imgur:** https://imgur.com

---

## 🚀 Advanced: CloudFront CDN (Optional)

For faster global delivery:

1. Go to AWS CloudFront
2. Create distribution
3. Origin: Your S3 bucket
4. Deploy
5. Get CloudFront URL (e.g., `d12345.cloudfront.net`)
6. Use CloudFront URL instead of S3 URL

**Benefits:**
- ⚡ Faster downloads worldwide
- 💰 Cheaper data transfer ($0.085/GB vs $0.09/GB)
- 🔒 HTTPS by default

---

## 🧪 Test Your Setup

```bash
# Test upload
echo "Test file" > test.txt
aws s3 cp test.txt s3://thee-archive-movies/test.txt --acl public-read

# Test download
curl https://thee-archive-movies.s3.amazonaws.com/test.txt

# Should output: "Test file"

# Clean up
aws s3 rm s3://thee-archive-movies/test.txt
```

---

## 📋 Checklist

Before uploading movies:
- [ ] AWS account created
- [ ] S3 bucket created (`thee-archive-movies`)
- [ ] Bucket policy set to public read
- [ ] AWS CLI installed and configured
- [ ] Test upload successful
- [ ] Test download URL works
- [ ] Admin portal ready to add movies

---

## 🐛 Troubleshooting

### "Access Denied" when downloading
- Check bucket policy (must allow public read)
- Verify file was uploaded with `--acl public-read`

### "Bucket name already exists"
- Bucket names are globally unique
- Try: `thee-archive-movies-uganda` or `thee-archive-movies-2025`

### Upload too slow
- Check internet connection
- Consider uploading during off-peak hours
- Use AWS CLI (faster than console)

### Cost too high
- Enable "Intelligent-Tiering" storage class
- Use CloudFront CDN to reduce transfer costs
- Compress videos before uploading

---

## 📞 Resources

- **AWS S3 Docs:** https://docs.aws.amazon.com/s3/
- **AWS CLI Docs:** https://docs.aws.amazon.com/cli/
- **AWS Pricing:** https://aws.amazon.com/s3/pricing/
- **AWS Free Tier:** https://aws.amazon.com/free/

---

**🎬 Ready to host your movies in the cloud!** ☁️
