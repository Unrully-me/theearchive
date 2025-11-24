# ⚡ QUICK START - Add Ads in 5 Minutes!

## 🎯 **YOUR AD COMPONENTS ARE READY!**

You already have two ad components created:
- ✅ `/components/PropellerAd.tsx` - PropellerAds integration
- ✅ `/components/AdSterraAd.tsx` - AdSterra integration

They're already imported in `/App.tsx`!

---

## 📍 **WHERE TO ADD ADS (Copy-Paste Ready!)**

### **Step 1: Find This Section in App.tsx**

Search for: `{/* MAIN CONTENT */}` around line 800-900

### **Step 2: Add Ads Between Sections**

Here's exactly where to add them:

#### **LOCATION 1: After Hero Slider (High Visibility!)**

Find this code:
```tsx
{/* Hero slider will go here */}
```

Add AFTER it:
```tsx
{/* AD 1: After Hero - High visibility! */}
<div className="max-w-7xl mx-auto px-4">
  <PropellerAd 
    zoneId="REPLACE_WITH_YOUR_ZONE_ID" 
    adType="banner" 
    className="my-8" 
  />
</div>
```

#### **LOCATION 2: Between Trending and Movies**

Find this code:
```tsx
<SectionWithAll 
  title="🔥 Trending Now"
  ...
/>
```

Add AFTER the closing tag:
```tsx
{/* AD 2: Between sections - Native ad for better UX */}
<div className="max-w-7xl mx-auto px-4">
  <AdSterraAd 
    adKey="REPLACE_WITH_YOUR_AD_KEY" 
    adType="native" 
    className="my-6" 
  />
</div>
```

#### **LOCATION 3: Before Footer**

Find where `<Footer` component is rendered (near end of file).

Add BEFORE it:
```tsx
{/* AD 3: Before footer - Last chance impression! */}
{!showPlayer && !showSeriesDetail && (
  <div className="max-w-7xl mx-auto px-4 mb-8">
    <PropellerAd 
      zoneId="REPLACE_WITH_YOUR_ZONE_ID" 
      adType="banner" 
      className="my-8" 
    />
  </div>
)}
```

---

## 🌍 **GLOBAL ADS (Best Revenue!)**

### **Add These ONCE at the Bottom of App.tsx**

Find the LAST closing `</div>` before `</div>` in the return statement.

Add these:

```tsx
{/* GLOBAL ADS - Add once, show everywhere! */}

{/* Push Notifications - HIGHEST CPM ($2-5)! */}
<PropellerAd zoneId="PUSH_ZONE_ID_HERE" adType="push" />

{/* Popunder - High CPM but annoying (ONE per session!) */}
<AdSterraAd adKey="POPUNDER_KEY_HERE" adType="popunder" />

{/* Social Bar - Sticky bottom bar */}
<AdSterraAd adKey="SOCIAL_BAR_KEY_HERE" adType="social-bar" />
```

---

## 💰 **SPECIAL: 18+ Section (Higher CPM!)**

Adult advertisers pay MORE! Add ads in your 18+ section for maximum revenue.

Find:
```tsx
{activeBottomTab === '18plus' && is18PlusUnlocked && (
```

Add INSIDE that block:
```tsx
{/* 18+ SECTION ADS - Adult advertisers pay 2-3x more! */}
<div className="max-w-7xl mx-auto px-4 mb-6">
  <AdSterraAd 
    adKey="18PLUS_AD_KEY_HERE" 
    adType="banner" 
    className="bg-red-500/10 border border-red-500/30 rounded-xl p-4" 
  />
  <p className="text-xs text-gray-500 text-center mt-2">
    🔞 Adult Content Advertisement
  </p>
</div>
```

---

## 🎬 **VIDEO PLAYER ADS**

Find your VideoPlayer component usage and wrap it:

```tsx
{showPlayer && selectedMovie && (
  <>
    {/* Pre-roll ad (before video) */}
    <div className="max-w-4xl mx-auto px-4 pt-4">
      <PropellerAd 
        zoneId="VIDEO_ZONE_ID_HERE" 
        adType="banner" 
        className="mb-4" 
      />
    </div>
    
    <VideoPlayer
      videoUrl={selectedMovie.videoUrl}
      // ... rest of props
    />
  </>
)}
```

---

## 📝 **COMPLETE EXAMPLE - HOME SCREEN**

Here's a full example with all ad placements:

```tsx
{activeBottomTab === 'home' && !showKidoMode && (
  <main className="pt-16 pb-24">
    {/* HERO SECTION */}
    <div className="hero-slider">
      {/* Your hero content here */}
    </div>

    {/* ===== AD 1: AFTER HERO ===== */}
    <div className="max-w-7xl mx-auto px-4 my-8">
      <PropellerAd 
        zoneId="1234567" 
        adType="banner" 
      />
    </div>

    {/* TRENDING SECTION */}
    <SectionWithAll
      title="🔥 Trending Now"
      emoji="🔥"
      movies={trendingMovies}
      onSeeAll={handleViewAll}
      onWatch={handleWatch}
    />

    {/* ===== AD 2: BETWEEN SECTIONS ===== */}
    <div className="max-w-7xl mx-auto px-4 my-6">
      <AdSterraAd 
        adKey="abc123xyz" 
        adType="native" 
      />
    </div>

    {/* MOVIES SECTION */}
    <SectionWithAll
      title="🎬 Movies"
      emoji="🎬"
      movies={moviesOnly}
      onSeeAll={handleViewAll}
      onWatch={handleWatch}
    />

    {/* SERIES SECTION */}
    <SectionWithAll
      title="📺 Series"
      emoji="📺"
      movies={groupedSeries}
      onSeeAll={handleViewAll}
      onWatch={handleSeriesClick}
    />

    {/* ===== AD 3: BEFORE FOOTER ===== */}
    <div className="max-w-7xl mx-auto px-4 my-8">
      <PropellerAd 
        zoneId="7654321" 
        adType="banner" 
      />
    </div>
  </main>
)}
```

---

## 🔧 **SETUP STEPS:**

### **1. Sign Up (5 minutes)**
- PropellerAds: https://propellerads.com/signup
- AdSterra: https://adsterra.com/signup

### **2. Add Your Website (2 minutes)**
- Dashboard → "Add Website"
- Enter your domain
- Select "Adult content" if applicable
- Submit (instant approval usually!)

### **3. Create Ad Zones (3 minutes)**

**PropellerAds:**
1. Go to "Ad Zones" → "Create Ad Zone"
2. Choose format:
   - Push Notifications (zone ID: 1234567)
   - Banner (zone ID: 2345678)
   - Native (zone ID: 3456789)
3. Copy the Zone ID

**AdSterra:**
1. Go to "Codes" → "Add New Code"
2. Choose format:
   - Popunder (ad key: abc123xyz)
   - Banner (ad key: def456uvw)
   - Social Bar (ad key: ghi789rst)
3. Copy the Ad Key

### **4. Replace IDs in Code (2 minutes)**

Find all instances of:
- `REPLACE_WITH_YOUR_ZONE_ID` → Replace with PropellerAds Zone ID
- `REPLACE_WITH_YOUR_AD_KEY` → Replace with AdSterra Ad Key
- `PUSH_ZONE_ID_HERE` → Replace with Push Notification Zone ID
- `POPUNDER_KEY_HERE` → Replace with Popunder Ad Key
- `18PLUS_AD_KEY_HERE` → Replace with 18+ Ad Key

### **5. Deploy & Wait (1 hour)**
- Deploy your app to production
- Wait 24 hours for ads to start showing
- Ads WON'T show in development mode!

---

## ✅ **CHECKLIST:**

- [ ] Signed up for PropellerAds
- [ ] Signed up for AdSterra
- [ ] Added website to both platforms
- [ ] Created Push Notification zone (PropellerAds)
- [ ] Created Banner zones (PropellerAds)
- [ ] Created Popunder code (AdSterra)
- [ ] Created Banner codes (AdSterra)
- [ ] Copied all Zone IDs and Ad Keys
- [ ] Added Ad #1 (after hero)
- [ ] Added Ad #2 (between sections)
- [ ] Added Ad #3 (before footer)
- [ ] Added global Push Notifications
- [ ] Added global Popunder
- [ ] Added 18+ section ads (higher CPM!)
- [ ] Replaced all placeholder IDs
- [ ] Deployed to production
- [ ] Waited 24 hours for ads to activate
- [ ] Checked analytics dashboard
- [ ] First payment received! 💰

---

## 🚨 **TROUBLESHOOTING:**

### **"Ads not showing!"**
- ✅ Are you in production? (Ads don't show in dev mode)
- ✅ Did you replace ALL placeholder IDs?
- ✅ Did you wait 24 hours after deployment?
- ✅ Try disabling ad blocker
- ✅ Check browser console for errors

### **"Low revenue!"**
- ✅ Add Push Notifications (highest CPM)
- ✅ Place ads in 18+ section (adult ads pay more)
- ✅ Optimize ad positions (test different locations)
- ✅ Increase traffic (more visitors = more revenue)

### **"Too many ads!"**
- ✅ Max 3-4 ads per page
- ✅ Use native ads (better UX)
- ✅ ONE popunder per session only
- ✅ Don't block content with ads

---

## 📊 **EXPECTED TIMELINE:**

- **Day 1:** Sign up, add website, create ad zones
- **Day 2:** Add ads to code, deploy to production
- **Day 3:** Ads start showing (check after 24 hours)
- **Week 1:** Monitor analytics, optimize placements
- **Month 1:** First payment! 💰

---

## 💡 **PRO TIPS:**

1. **Push Notifications = Best ROI** - Highest CPM, least intrusive
2. **18+ Section = Higher CPM** - Adult advertisers pay 2-3x more
3. **Mix Networks** - Use PropellerAds for push, AdSterra for popunders
4. **Test Positions** - Try different ad locations, keep what works
5. **Check Analytics Daily** - Disable low-performing ads

---

## 🎉 **YOU'RE DONE!**

That's it! Your app is now monetized with adult-friendly ad networks.

**Total Time:** 15-20 minutes
**First Payment:** 30-45 days (depending on traffic)
**Potential Revenue:** $10-$4,000/month (based on traffic)

---

## 📞 **NEED HELP?**

- PropellerAds Support: support@propellerads.com
- AdSterra Support: publishers@adsterra.com
- Read full guide: `/ALTERNATIVE_ADS_SETUP_GUIDE.md`

**Good luck! 🚀💰**
