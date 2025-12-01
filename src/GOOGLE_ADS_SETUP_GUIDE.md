# 🚀 Google AdSense Setup Guide for THEE ARCHIVE

## ⚠️ CRITICAL: 18+ CONTENT & ADSENSE POLICY

**IMPORTANT NOTICE:** Google AdSense **DOES NOT ALLOW** websites with adult/sexual content (18+ sections).

### Your Options:

1. **Option A: Remove 18+ Content (Recommended for AdSense)**
   - Delete the entire 18+ section
   - This makes your site AdSense-compliant
   - Maximum ad revenue potential

2. **Option B: Use Alternative Ad Networks**
   - Keep 18+ content
   - Use adult-friendly ad networks:
     - **PropellerAds** (https://propellerads.com)
     - **AdSterra** (https://adsterra.com)
     - **ExoClick** (https://exoclick.com)
     - **TrafficJunky**
   - Lower CPM but allows adult content

3. **Option C: Separate Domains**
   - Main domain: Family-friendly content + AdSense
   - Secondary domain: 18+ content + alternative ads

---

## 📋 What Google Requires (Already Implemented ✅)

Your app now has ALL required pages for AdSense approval:

- ✅ **Privacy Policy** (`/components/legal/PrivacyPolicy.tsx`)
- ✅ **Terms of Service** (`/components/legal/TermsOfService.tsx`)
- ✅ **About Us** (`/components/legal/AboutUs.tsx`)
- ✅ **Contact Us** (`/components/legal/ContactUs.tsx`)
- ✅ **Footer** with legal links (`/components/Footer.tsx`)
- ✅ **Cookie Consent Banner** (`/components/CookieConsent.tsx`)
- ✅ **Google Ad Component** (`/components/GoogleAd.tsx`)

All pages are accessible from the footer at the bottom of your site!

---

## 🔧 Step-by-Step AdSense Setup

### Step 1: Sign Up for Google AdSense

1. Go to https://www.google.com/adsense
2. Click "Get Started"
3. Sign in with your Google account
4. Fill in your website URL (e.g., `https://theearchive.com`)
5. Fill in your payment details
6. Submit application

### Step 2: Wait for Approval

- Google typically reviews applications within **24-48 hours** (can take up to 2 weeks)
- They'll check if your site meets their policies
- **Remember:** They will reject if you have 18+ content!

### Step 3: Get Your Publisher ID

Once approved, you'll receive:
- **Publisher ID**: Looks like `ca-pub-1234567890123456`
- **Ad Unit IDs**: For different ad placements

### Step 4: Add AdSense Code to Your Site

#### Option A: Add Global Script (index.html)

Add this to your `/public/index.html` in the `<head>` section:

```html
<script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-XXXXXXXXXX"
     crossorigin="anonymous"></script>
```

Replace `ca-pub-XXXXXXXXXX` with your actual Publisher ID!

#### Option B: Update GoogleAd Component

Open `/components/GoogleAd.tsx` and replace line 58:

```typescript
data-ad-client="ca-pub-XXXXXXXXXX" // REPLACE WITH YOUR PUBLISHER ID
```

Change to:

```typescript
data-ad-client="ca-pub-1234567890123456" // Your real ID
```

### Step 5: Add Ads to Your App

Use the `GoogleAd` component anywhere in your app:

```tsx
import { GoogleAd } from './components/GoogleAd';

// In your component:
<GoogleAd adSlot="1234567890" adFormat="auto" />
```

#### Recommended Ad Placements:

1. **Hero Section** (After main banner)
   ```tsx
   <GoogleAd adSlot="1111111111" adFormat="horizontal" className="mb-8" />
   ```

2. **Between Content Sections** (Movies/Series)
   ```tsx
   <GoogleAd adSlot="2222222222" adFormat="auto" className="my-8" />
   ```

3. **Sidebar** (Desktop only)
   ```tsx
   <GoogleAd adSlot="3333333333" adFormat="vertical" className="hidden md:block" />
   ```

4. **Before Footer**
   ```tsx
   <GoogleAd adSlot="4444444444" adFormat="horizontal" className="mb-8" />
   ```

5. **Video Player** (Before video)
   ```tsx
   <GoogleAd adSlot="5555555555" adFormat="rectangle" className="mb-4" />
   ```

### Step 6: Create Ad Units in AdSense Dashboard

1. Go to AdSense Dashboard → **Ads** → **By ad unit**
2. Click **New ad unit**
3. Choose ad type (Display, In-feed, In-article)
4. Name it (e.g., "Home Page Banner", "Video Pre-Roll")
5. Copy the **Ad slot ID** (looks like `1234567890`)
6. Use this ID in your `<GoogleAd adSlot="1234567890" />` component

---

## 🎯 Optimal Ad Strategy (Maximum Revenue)

### High-Traffic Pages:
- **Home Page**: 3-4 ads
- **Browse Page**: 2-3 ads
- **Series Detail**: 2 ads
- **Video Player**: 1 pre-roll ad

### Ad Formats:
- **Auto Ads**: Let Google optimize placement (recommended for beginners)
- **Display Ads**: Fixed sizes (728x90, 300x250, 160x600)
- **Responsive Ads**: Adapt to screen size (best for mobile)

### Best Practices:
- Don't place too many ads (Google penalizes)
- Max **3 ads per page view**
- Place ads **above the fold** (visible without scrolling)
- Use **native ads** (blend with content)

---

## 📊 Example Ad Implementation

### Home Page (`App.tsx`):

```tsx
{activeBottomTab === 'home' && !showKidoMode && (
  <div>
    {/* Hero Slider */}
    <div className="hero-section">
      {/* ... your hero content ... */}
    </div>

    {/* AD 1: After Hero */}
    <GoogleAd adSlot="1111111111" adFormat="horizontal" className="my-8" />

    {/* Trending Section */}
    <SectionWithAll title="🔥 Trending Now" ... />

    {/* AD 2: Between Sections */}
    <GoogleAd adSlot="2222222222" adFormat="auto" className="my-8" />

    {/* Movies Section */}
    <SectionWithAll title="🎬 Movies" ... />

    {/* AD 3: Before Footer */}
    <GoogleAd adSlot="3333333333" adFormat="horizontal" className="my-8" />
  </div>
)}
```

### Video Player (`VideoPlayer.tsx`):

```tsx
<div className="video-player">
  {/* AD: Pre-roll (before video) */}
  <GoogleAd adSlot="4444444444" adFormat="rectangle" className="mb-4" />
  
  {/* Actual Video */}
  <video src={videoUrl} controls />
</div>
```

---

## 🔍 Testing Your Ads

### Development Mode:
- Ads show as **placeholders** (yellow boxes)
- Says "Google Ad Placeholder (Dev Mode)"
- Real ads only appear in **production**

### Production Testing:
1. Deploy your app to a live domain
2. Wait 15-30 minutes for ads to activate
3. Visit your site (don't click your own ads!)
4. Use **Google Publisher Toolbar** Chrome extension to verify

---

## 💰 Revenue Expectations

### Average CPM (Cost Per 1000 Impressions):
- **US/UK/Canada**: $3 - $10
- **Europe**: $2 - $6
- **Asia/Africa**: $0.50 - $2

### Example Earnings (US Traffic):
- **10,000 views/month**: $30 - $100
- **100,000 views/month**: $300 - $1,000
- **1,000,000 views/month**: $3,000 - $10,000

### Boost Revenue:
- Target **US/UK audiences** (highest CPM)
- Place ads **above the fold**
- Use **video ads** (higher CPM)
- Enable **auto ads** (Google optimizes)

---

## ❌ Common Issues & Solutions

### "Ads Not Showing"
- **Cause**: AdSense still reviewing
- **Solution**: Wait 24-48 hours after approval

### "Blank Ad Spaces"
- **Cause**: Ad blockers or no ads available
- **Solution**: Test without ad blocker, wait for Google to fill inventory

### "Invalid Traffic Warning"
- **Cause**: Clicking your own ads or bot traffic
- **Solution**: Never click your own ads! Use real users

### "Policy Violation"
- **Cause**: 18+ content, copyright violations, misleading content
- **Solution**: Remove offending content, appeal to Google

---

## 📞 Need Help?

### AdSense Support:
- **Email**: adsense-support@google.com
- **Forum**: https://support.google.com/adsense/community
- **Help Center**: https://support.google.com/adsense

### Your Legal Pages (Required by Google):
- Privacy Policy: Click footer → "Privacy Policy"
- Terms of Service: Click footer → "Terms of Service"
- Contact: Click footer → "Contact Us"

---

## ✅ Final Checklist

Before submitting to AdSense:

- [ ] Privacy Policy page accessible
- [ ] Terms of Service page accessible
- [ ] Contact Us page accessible
- [ ] About Us page accessible
- [ ] Footer with legal links visible
- [ ] Cookie consent banner working
- [ ] **18+ content removed** (or use alternative ads)
- [ ] Site has original, valuable content
- [ ] Site is live on a real domain (not localhost)
- [ ] Site has been live for at least 7 days
- [ ] No copyright violations

---

## 🎉 You're Ready!

Your app now has **everything Google requires** for AdSense approval! 

**Next Steps:**
1. **Remove 18+ content** if keeping AdSense
2. Sign up at https://www.google.com/adsense
3. Add your Publisher ID to `/components/GoogleAd.tsx`
4. Wait for approval
5. Add ad placements throughout your app
6. Watch the revenue roll in! 💰

---

## 🚨 Alternative: Remove 18+ Section

If you want AdSense, you MUST remove the 18+ section. Here's how:

1. Open `/App.tsx`
2. Find the `activeBottomTab === '18plus'` section
3. Delete or comment out that entire section
4. Remove the 18+ tab from `FourTabBottomNav.tsx`
5. Filter out all movies with `ageRating: '18+'` from database

This makes your site 100% AdSense compliant!

---

**Good luck with your ad monetization! 🚀💰**
