# 💰 GOOGLE ADSENSE SETUP GUIDE

## 🎯 How Ads Work Now

Your app triggers Google AdSense when users:
1. ✅ Click "Watch" button → Ad triggers → Video plays
2. ✅ Click "Download" button → Ad triggers → Download starts

**No countdown timers! Google handles everything!** 🔥

---

## 📝 STEP 1: Get Google AdSense Account

### A. Sign Up
1. Go to: https://www.google.com/adsense
2. Click "Get Started"
3. Enter your website URL (your Stellar domain)
4. Fill in payment details
5. Submit application

### B. Wait for Approval
- Usually takes 1-3 days
- Google reviews your site
- You'll get email when approved

### C. Get Your Publisher ID
After approval:
1. Login to AdSense dashboard
2. Go to Account → Account Information
3. Find your **Publisher ID**: `ca-pub-XXXXXXXXXX`
4. Copy this ID (you'll need it!)

---

## 🔧 STEP 2: Add AdSense to Your App

### A. Find the Code

Open `/App.tsx` and search for this line (at the very end):

```html
<script
  async
  src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-XXXXXXXXXX"
  crossOrigin="anonymous"
></script>
```

### B. Replace Publisher ID

Replace `ca-pub-XXXXXXXXXX` with YOUR real publisher ID:

```html
<script
  async
  src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-1234567890123456"
  crossOrigin="anonymous"
></script>
```

### C. Rebuild & Deploy

```bash
npm run build
# Upload /dist to Stellar hosting
```

---

## 🎬 STEP 3: How Ads Trigger

### Automatic Trigger Function

The app has this function built-in:

```typescript
const triggerGoogleAd = () => {
  try {
    if (window.adsbygoogle && window.adsbygoogle.loaded) {
      (window.adsbygoogle = window.adsbygoogle || []).push({});
    }
  } catch (e) {
    console.log('AdSense not loaded yet');
  }
};
```

This runs when users:
- Click "Watch" → `handleWatchClick()` → triggers ad
- Click "Download" → `handleDownloadClick()` → triggers ad

**You don't need to do anything! It's automatic!** ✅

---

## 📊 STEP 4: Add Ad Units (Optional)

For more control, create specific ad units:

### A. Create Ad Unit
1. Login to AdSense dashboard
2. Go to "Ads" → "By ad unit"
3. Click "Display ads"
4. Choose ad type:
   - **Recommended:** Auto ads (Google optimizes)
   - **Manual:** Display, In-feed, In-article, Multiplex

### B. Get Ad Code

Google will give you code like:

```html
<ins class="adsbygoogle"
     style="display:block"
     data-ad-client="ca-pub-1234567890123456"
     data-ad-slot="9876543210"
     data-ad-format="auto"
     data-full-width-responsive="true"></ins>
<script>
     (adsbygoogle = window.adsbygoogle || []).push({});
</script>
```

### C. Add to Your App (Optional)

You can add this code anywhere in your app:

**Example: Add ad between movies**

Open `/App.tsx`, find the movies grid section, and add:

```tsx
{/* Movies Grid */}
<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
  {filteredMovies.slice(0, 8).map((movie) => (
    // Movie card here...
  ))}
  
  {/* AD UNIT */}
  <div className="col-span-full my-8">
    <ins className="adsbygoogle"
         style={{ display: 'block' }}
         data-ad-client="ca-pub-1234567890123456"
         data-ad-slot="9876543210"
         data-ad-format="auto"
         data-full-width-responsive="true"></ins>
    <script>
         (window.adsbygoogle = window.adsbygoogle || []).push({});
    </script>
  </div>
  
  {filteredMovies.slice(8).map((movie) => (
    // More movie cards...
  ))}
</div>
```

---

## 🎨 AD PLACEMENT IDEAS

### 1. **Auto Ads (Easiest)** ✅
- Let Google place ads automatically
- Just add publisher ID
- Google optimizes placement
- **Recommended for beginners!**

### 2. **Between Movies**
- Add ad unit every 8-12 movies
- Looks natural
- Good click-through rate

### 3. **Above Footer**
- Banner ad before footer
- Users see it when scrolling down
- Good for engagement

### 4. **Sidebar (Desktop Only)**
- Sticky sidebar ad
- Stays visible while scrolling
- Great for desktop users

### 5. **In-Article**
- Inside movie descriptions
- Looks like native content
- High engagement

---

## 💡 BEST PRACTICES

### ✅ DO:
- Use Auto Ads for easy setup
- Place ads where users naturally pause
- Keep ads relevant to content
- Monitor performance in AdSense dashboard
- Test different placements

### ❌ DON'T:
- Don't click your own ads (Google will ban you!)
- Don't tell users to click ads
- Don't place too many ads (annoying)
- Don't hide ads in confusing places
- Don't refresh page just to show more ads

---

## 📈 REVENUE TIPS

### 1. **Quality Content**
- Add high-quality movies
- Good descriptions
- Proper categorization
- Users stay longer = more ad views

### 2. **User Experience**
- Fast loading times
- Mobile-friendly
- Easy navigation
- Happy users = more clicks

### 3. **Traffic**
- Promote on social media
- SEO optimization
- Word of mouth
- More visitors = more revenue

### 4. **Ad Optimization**
- Try different ad types
- Test placements
- Use responsive ads
- Check AdSense reports

---

## 🧪 TESTING YOUR ADS

### Development Testing

Google has a **test mode** for development:

```html
<script>
  window.adsbygoogle = window.adsbygoogle || [];
  window.adsbygoogle.push({
    google_ad_client: "ca-pub-1234567890123456",
    enable_page_level_ads: true,
    overlays: {bottom: true}
  });
</script>
```

### Check if Ads Work

1. Deploy to your domain
2. Visit site
3. Click "Watch" or "Download"
4. Open browser console (F12)
5. Look for AdSense messages
6. Check if ads appear

**Note:** Ads might not show immediately:
- Google needs to review your site first
- May take 24-48 hours after adding code
- Test with different browsers/devices

---

## 📊 MONITORING REVENUE

### AdSense Dashboard

Login to https://www.google.com/adsense to see:
- **Today's earnings**
- **Clicks**
- **Impressions**
- **CTR (Click-Through Rate)**
- **CPC (Cost Per Click)**
- **Top performing pages**

### Reports to Check

1. **Overview** - Quick snapshot
2. **Sites** - Performance by domain
3. **Ads** - Performance by ad unit
4. **Countries** - Where traffic comes from
5. **Platforms** - Mobile vs Desktop

---

## 💰 EXPECTED EARNINGS

### Realistic Numbers (Uganda/Africa)

**Per 1,000 Views:**
- **Low:** $0.50 - $2
- **Average:** $2 - $5
- **High:** $5 - $10+

**Factors:**
- Movie content quality
- User engagement
- Geographic location
- Ad relevance
- Mobile vs Desktop

**Example:**
- 100 daily visitors
- 3,000 monthly views
- $3 per 1,000 views
- **= $9/month**

Scale up:
- 1,000 daily visitors
- 30,000 monthly views
- **= $90/month**
- 10,000 daily visitors
- 300,000 monthly views
- **= $900/month**

---

## 🚨 COMMON ISSUES

### "Ads Not Showing"
- ✅ Wait 24-48 hours after adding code
- ✅ Check if AdSense account approved
- ✅ Verify publisher ID is correct
- ✅ Check browser console for errors
- ✅ Try different browser/device

### "Account Suspended"
- ❌ Don't click own ads!
- ❌ Don't ask users to click
- ❌ Don't use bots/fake traffic
- ❌ Don't violate Google policies

### "Low Revenue"
- Add more quality content
- Increase traffic
- Optimize ad placements
- Improve user engagement
- Check AdSense recommendations

---

## 📞 SUPPORT

### Google AdSense Help
- Help Center: https://support.google.com/adsense
- Community Forum: https://support.google.com/adsense/community
- Contact Support: From AdSense dashboard

### Your App Support
- Check `/README.md`
- Check `/CHANGES_SUMMARY.md`
- Review browser console (F12)

---

## ✅ QUICK SETUP CHECKLIST

- [ ] Sign up for Google AdSense
- [ ] Wait for account approval (1-3 days)
- [ ] Get publisher ID from dashboard
- [ ] Add publisher ID to `/App.tsx`
- [ ] Rebuild: `npm run build`
- [ ] Upload to Stellar hosting
- [ ] Test on live site
- [ ] Wait 24-48 hours for ads to appear
- [ ] Monitor AdSense dashboard
- [ ] Optimize based on reports

---

## 🎉 YOU'RE READY TO MONETIZE!

**Your app is AdSense-ready! Just add your publisher ID and deploy!** 💯🔥💰

---

**Questions? Check Google AdSense Help Center or your app documentation!** 📚✨
