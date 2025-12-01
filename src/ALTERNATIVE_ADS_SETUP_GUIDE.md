# 🚀 Alternative Ad Networks Setup Guide
## PropellerAds & AdSterra (Adult-Friendly)

Since you're keeping the 18+ section, you made the RIGHT CHOICE to use alternative ad networks that allow adult content!

---

## ✅ WHY THESE AD NETWORKS?

### **Google AdSense vs Alternative Networks:**

| Feature | Google AdSense | PropellerAds/AdSterra |
|---------|---------------|----------------------|
| **Adult Content** | ❌ NOT ALLOWED | ✅ ALLOWED |
| **Approval Time** | 24-48 hours | Instant - 24 hours |
| **CPM (US)** | $3-$10 | $1-$4 |
| **Payment Threshold** | $100 | $5-$100 |
| **Best For** | Family sites | Adult/Mixed content sites |

---

## 📊 REVENUE COMPARISON

### **PropellerAds:**
- **CPM:** $1-$3 (US/UK), $0.50-$1.50 (others)
- **Best Formats:** Push Notifications, Popunders
- **Payment:** $5 minimum (WebMoney), $100 (PayPal/Wire)
- **✅ Allows:** Adult content, file sharing, gambling

### **AdSterra:**
- **CPM:** $2-$4 (US/UK), $1-$2 (others)
- **Best Formats:** Popunders, Social Bar, Native
- **Payment:** $5 minimum (WebMoney), $100 (others)
- **✅ Allows:** Adult content, file sharing, crypto

### **Expected Monthly Earnings:**
- **10K visitors:** $10-$40/month
- **100K visitors:** $100-$400/month
- **1M visitors:** $1,000-$4,000/month

---

## 🛠️ STEP-BY-STEP SETUP

## **Option 1: PropellerAds (Recommended)**

### **Step 1: Sign Up**
1. Go to https://propellerads.com
2. Click "Sign Up" → Choose "Publisher"
3. Fill in your details (name, email, etc.)
4. Verify your email

### **Step 2: Add Your Website**
1. Log in to dashboard
2. Go to "Websites & Apps" → "Add Website"
3. Enter your website URL
4. Select categories that match your content
5. ✅ Check "Adult content" if applicable
6. Submit for approval (usually instant!)

### **Step 3: Create Ad Zones**
1. Go to "Ad Zones" → "Create Ad Zone"
2. Choose ad format:
   - **Push Notifications** (highest CPM, $2-5)
   - **Popunder** (good CPM, $1-3, but annoying)
   - **Banner Ads** (lowest CPM, $0.50-1)
   - **Native Ads** (best UX, $1-2)
   - **Interstitial** (medium CPM, $1-2)

3. Copy your **Zone ID** (looks like: `7654321`)

### **Step 4: Add Ads to Your App**

In your React components:

```tsx
import { PropellerAd } from './components/PropellerAd';

// Banner Ad (After hero section)
<PropellerAd zoneId="7654321" adType="banner" className="my-8" />

// Native Ad (In content feed)
<PropellerAd zoneId="7654322" adType="native" className="my-6" />

// Push Notifications (All pages - best revenue!)
<PropellerAd zoneId="7654323" adType="push" />

// Popunder (High CPM but annoying - use sparingly)
<PropellerAd zoneId="7654324" adType="popunder" />
```

### **Step 5: Get Paid!**
1. Go to "Finances" → "Payment Settings"
2. Add payment method:
   - PayPal (min $100)
   - Payoneer (min $100)
   - WebMoney (min $5) ← Lowest threshold!
   - Wire Transfer (min $500)
3. Set payment schedule (weekly/monthly)

---

## **Option 2: AdSterra**

### **Step 1: Sign Up**
1. Go to https://adsterra.com
2. Click "Sign Up" → Choose "Publishers"
3. Fill registration form
4. Verify email

### **Step 2: Add Website**
1. Dashboard → "Websites" → "Add Website"
2. Enter domain
3. Select content type (check "Adult" if applicable)
4. Wait for approval (1-24 hours)

### **Step 3: Create Ad Codes**
1. Go to "Codes" → "Add New Code"
2. Choose format:
   - **Popunder** (best CPM, $3-6!)
   - **Social Bar** (good balance, $1-2)
   - **Banner** ($0.50-1.50)
   - **Native Banner** ($1-2)
   - **Direct Link** ($1-3)

3. Copy your **Ad Key** (looks like: `abc123xyz456`)

### **Step 4: Add Ads to Your App**

```tsx
import { AdSterraAd } from './components/AdSterraAd';

// Banner Ad
<AdSterraAd adKey="abc123xyz" adType="banner" className="my-8" />

// Native Banner (best UX)
<AdSterraAd adKey="def456uvw" adType="native" className="my-6" />

// Popunder (highest CPM!)
<AdSterraAd adKey="ghi789rst" adType="popunder" />

// Social Bar (bottom sticky bar)
<AdSterraAd adKey="jkl012mno" adType="social-bar" />
```

### **Step 5: Payment**
1. Dashboard → "Payment Settings"
2. Add method:
   - WebMoney (min $5) ← Lowest!
   - Paxum (min $100)
   - PayPal (min $100)
   - Bitcoin (min $100)
   - Wire (min $1,000)
3. Payments on NET-15 basis (15 days after month end)

---

## 🎯 OPTIMAL AD PLACEMENT STRATEGY

### **Home Page:**
```tsx
// HERO SECTION
<div className="hero">
  {/* Your hero content */}
</div>

// AD 1: After Hero (Banner or Native)
<PropellerAd zoneId="YOUR_ZONE_ID" adType="banner" className="my-8" />

// TRENDING SECTION
<SectionWithAll title="Trending" ... />

// AD 2: Between Sections (Native)
<AdSterraAd adKey="YOUR_KEY" adType="native" className="my-6" />

// MOVIES SECTION
<SectionWithAll title="Movies" ... />

// AD 3: Before Footer (Banner)
<PropellerAd zoneId="YOUR_ZONE_ID" adType="banner" className="my-8" />
```

### **18+ Section** (Higher CPM here!):
```tsx
{activeBottomTab === '18plus' && (
  <div>
    {/* AD 1: Top of 18+ section - Higher paying ads! */}
    <AdSterraAd adKey="YOUR_18PLUS_KEY" adType="banner" className="mb-6" />
    
    {/* 18+ Content */}
    <div className="adult-content">
      {/* Your 18+ movies */}
    </div>
    
    {/* AD 2: Middle of content */}
    <PropellerAd zoneId="YOUR_ZONE_ID" adType="native" className="my-6" />
  </div>
)}
```

### **Video Player:**
```tsx
<div className="video-container">
  {/* AD: Pre-roll (before video) */}
  <AdSterraAd adKey="YOUR_KEY" adType="banner" className="mb-4" />
  
  {/* Video Player */}
  <video src={videoUrl} controls />
</div>
```

### **Global Ads** (All Pages):
```tsx
// In your App.tsx, add these once:

{/* Push Notifications - Highest revenue, non-intrusive */}
<PropellerAd zoneId="YOUR_PUSH_ZONE" adType="push" />

{/* Popunder - High revenue but annoying (use one only!) */}
<AdSterraAd adKey="YOUR_POPUNDER_KEY" adType="popunder" />

{/* Social Bar - Bottom sticky bar */}
<AdSterraAd adKey="YOUR_SOCIAL_KEY" adType="social-bar" />
```

---

## 💰 MAXIMIZE YOUR REVENUE

### **Best Practices:**
1. **Use Push Notifications** - Highest CPM, least intrusive
2. **One Popunder Max** - High CPM but annoying, use sparingly
3. **Native Ads in Feed** - Best user experience + decent CPM
4. **18+ Section Gets Higher CPM** - Adult advertisers pay more!
5. **Mix Both Networks** - PropellerAds for push/popunder, AdSterra for banners
6. **Test Ad Positions** - Track which placements perform best

### **Don't Do This:**
- ❌ Too many ads (max 3-4 per page)
- ❌ Multiple popunders (users will hate you)
- ❌ Ads blocking content
- ❌ Auto-play video ads (annoying!)

---

## 📈 TRACKING & OPTIMIZATION

### **PropellerAds Dashboard:**
- Check "Statistics" daily
- Focus on **eCPM** (effective CPM)
- Pause low-performing zones
- Test different ad formats

### **AdSterra Dashboard:**
- Review "Statistics" → "By Website"
- Track **CPM** and **Revenue**
- Disable underperforming ad codes
- Try different ad formats

### **Key Metrics:**
- **CPM:** Cost per 1,000 impressions
- **CTR:** Click-through rate
- **Fill Rate:** % of ad requests filled
- **Revenue:** Total earnings

---

## 🚀 IMPLEMENTATION CHECKLIST

- [ ] Sign up for PropellerAds
- [ ] Sign up for AdSterra
- [ ] Add websites to both platforms
- [ ] Create ad zones/codes
- [ ] Copy Zone IDs and Ad Keys
- [ ] Add PropellerAd components to your app
- [ ] Add AdSterraAd components to your app
- [ ] Replace placeholder IDs with real ones
- [ ] Deploy to production
- [ ] Wait 24 hours for ads to start showing
- [ ] Check analytics and optimize!

---

## ⚡ QUICK SETUP (Copy-Paste Ready)

### **1. Home Page Ads:**
```tsx
{activeBottomTab === 'home' && (
  <div>
    {/* Hero Section */}
    <HeroSlider />
    
    {/* Ad 1 */}
    <PropellerAd zoneId="REPLACE_ME" adType="banner" className="my-8" />
    
    {/* Trending */}
    <SectionWithAll title="Trending" movies={trendingMovies} />
    
    {/* Ad 2 */}
    <AdSterraAd adKey="REPLACE_ME" adType="native" className="my-6" />
    
    {/* Movies */}
    <SectionWithAll title="Movies" movies={movies} />
    
    {/* Ad 3 */}
    <PropellerAd zoneId="REPLACE_ME" adType="banner" className="my-8" />
  </div>
)}
```

### **2. Global Push Notifications (Add once in App.tsx):**
```tsx
{/* Right before closing </div> of main app */}
<PropellerAd zoneId="REPLACE_WITH_PUSH_ZONE_ID" adType="push" />
```

### **3. Video Player Ads:**
```tsx
{showPlayer && (
  <div>
    <AdSterraAd adKey="REPLACE_ME" adType="banner" className="mb-4" />
    <VideoPlayer videoUrl={videoUrl} />
  </div>
)}
```

---

## 🎉 YOU'RE ALL SET!

Your app is now monetized with adult-friendly ad networks! 

**Next Steps:**
1. Sign up for both networks
2. Get your Zone IDs / Ad Keys
3. Replace "REPLACE_ME" in the examples above
4. Deploy to production
5. Watch the money roll in! 💰

**Questions?**
- PropellerAds Support: support@propellerads.com
- AdSterra Support: publishers@adsterra.com

---

**💡 Pro Tip:** Use PropellerAds for Push Notifications (best revenue) and AdSterra for Popunders and Banners. Mix and match for maximum earnings!

Good luck with your monetization! 🚀💰
