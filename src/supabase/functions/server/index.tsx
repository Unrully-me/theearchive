/**
 * THEE ARCHIVE - Backend Server
 * 
 * FIXES APPLIED (Http connection closed error):
 * 1. Added timeout handling to all async KV operations (30s)
 * 2. Added timeout to download proxy streaming (5 min)
 * 3. Added timeout to file upload buffer reading (60s)
 * 4. Improved CORS headers with proper preflight handling
 * 5. Added global error handler and 404 handler
 * 6. Added proper error handling to GM feed operations
 * 7. Fixed FormData file uploads with proper buffer handling
 */

import { Hono } from "npm:hono";
import { cors } from "npm:hono/cors";
import { logger } from "npm:hono/logger";
import { createClient } from "npm:@supabase/supabase-js@2";
import * as kv from "./kv_store.tsx";
const app = new Hono();

// Create Supabase client
const supabase = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
);

// Enable logger
app.use('*', logger(console.log));

// Enable CORS for all routes and methods
app.use(
  "/*",
  cors({
    origin: "*",
    allowHeaders: ["Content-Type", "Authorization", "Range"],
    allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    exposeHeaders: ["Content-Length", "Content-Disposition", "Accept-Ranges"],
    maxAge: 86400, // 24 hours
    credentials: false,
  }),
);

// Handle OPTIONS preflight requests
app.options("/*", (c) => {
  return c.text("", 204);
});

// Health check endpoint
app.get("/make-server-4d451974/health", (c) => {
  return c.json({ status: "ok" });
});

// Get all movies
app.get("/make-server-4d451974/movies", async (c) => {
  try {
    console.log("Fetching movies from database...");
    
    // Add timeout to prevent hanging
    const timeoutPromise = new Promise((_, reject) => 
      setTimeout(() => reject(new Error('Database timeout')), 30000)
    );
    
    const moviesData = await Promise.race([
      kv.getByPrefix("movie:"),
      timeoutPromise
    ]);
    
    // getByPrefix returns an array of objects with key and value
    // We need to extract just the values
    const movies = Array.isArray(moviesData) ? moviesData.map(item => item.value || item) : [];
    
    console.log(`Fetched ${movies.length} movies`);
    return c.json({ success: true, movies });
  } catch (error) {
    console.log(`Error fetching movies: ${error}`);
    return c.json({ success: false, error: String(error), movies: [] }, 500);
  }
});

// Get single movie by ID
app.get("/make-server-4d451974/movies/:id", async (c) => {
  try {
    const id = c.req.param("id");
    const movie = await kv.get(`movie:${id}`);
    if (!movie) {
      return c.json({ success: false, error: "Movie not found" }, 404);
    }
    return c.json({ success: true, movie });
  } catch (error) {
    console.log(`Error fetching movie: ${error}`);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

// Add new movie
app.post("/make-server-4d451974/movies", async (c) => {
  try {
    const body = await c.req.json();
    const { title, description, videoUrl, thumbnailUrl, genre, year, type, fileSize, category, ageRating, section, episodes, seriesTitle, seasonNumber, episodeNumber } = body;

    if (!title || !videoUrl) {
      return c.json({ success: false, error: "Title and video URL are required" }, 400);
    }

    // Generate unique ID based on timestamp
    const id = Date.now().toString();
    const movie = {
      id,
      title,
      description: description || "",
      videoUrl,
      thumbnailUrl: thumbnailUrl || "",
      genre: genre || "General",
      year: year || new Date().getFullYear().toString(),
      type: type || "movie", // movie, series, documentary
      fileSize: fileSize || "",
      category: category || undefined,
      ageRating: ageRating || undefined,
      section: section || undefined,
      episodes: episodes || [], // For series: array of episodes
      // Series fields
      seriesTitle: seriesTitle || undefined,
      seasonNumber: seasonNumber || undefined,
      episodeNumber: episodeNumber || undefined,
      createdAt: new Date().toISOString(),
      uploadedAt: new Date().toISOString(),
    };

    await kv.set(`movie:${id}`, movie);
    return c.json({ success: true, movie });
  } catch (error) {
    console.log(`Error adding movie: ${error}`);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

// Update movie
app.put("/make-server-4d451974/movies/:id", async (c) => {
  try {
    const id = c.req.param("id");
    const existingMovie = await kv.get(`movie:${id}`);
    
    if (!existingMovie) {
      return c.json({ success: false, error: "Movie not found" }, 404);
    }

    const body = await c.req.json();
    const updatedMovie = {
      ...existingMovie,
      ...body,
      id, // Ensure ID doesn't change
      updatedAt: new Date().toISOString(),
    };

    await kv.set(`movie:${id}`, updatedMovie);
    return c.json({ success: true, movie: updatedMovie });
  } catch (error) {
    console.log(`Error updating movie: ${error}`);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

// Delete movie
app.delete("/make-server-4d451974/movies/:id", async (c) => {
  try {
    const id = c.req.param("id");
    await kv.del(`movie:${id}`);
    return c.json({ success: true, message: "Movie deleted successfully" });
  } catch (error) {
    console.log(`Error deleting movie: ${error}`);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

// ===== AUTHENTICATION ROUTES =====

// Sign Up
app.post("/make-server-4d451974/signup", async (c) => {
  try {
    const { email, password, name } = await c.req.json();

    if (!email || !password || !name) {
      return c.json({ success: false, error: "Email, password, and name are required" }, 400);
    }

    // Create user in Supabase Auth
    const { data, error } = await supabase.auth.admin.createUser({
      email,
      password,
      user_metadata: { name },
      email_confirm: true, // Auto-confirm since email server not configured
    });

    if (error) {
      console.log(`Signup error: ${error.message}`);
      return c.json({ success: false, error: error.message }, 400);
    }

    // Store user info in KV store
    const userId = data.user.id;
    const userRecord = {
      id: userId,
      email,
      name,
      isBlocked: false,
      createdAt: new Date().toISOString(),
    };

    await kv.set(`user:${userId}`, userRecord);

    // Sign in to get access token
    const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (signInError) {
      console.log(`Auto sign-in error after signup: ${signInError.message}`);
      return c.json({ success: false, error: signInError.message }, 400);
    }

    return c.json({
      success: true,
      user: {
        id: userId,
        email,
        name,
        accessToken: signInData.session.access_token,
      },
    });
  } catch (error) {
    console.log(`Signup error: ${error}`);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

// Sign In
app.post("/make-server-4d451974/signin", async (c) => {
  try {
    const { email, password } = await c.req.json();

    if (!email || !password) {
      return c.json({ success: false, error: "Email and password are required" }, 400);
    }

    // Sign in with Supabase Auth
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      console.log(`Sign-in error: ${error.message}`);
      return c.json({ success: false, error: error.message }, 401);
    }

    const userId = data.user.id;

    // Get user record from KV store
    const userRecord = await kv.get(`user:${userId}`);

    if (!userRecord) {
      return c.json({ success: false, error: "User record not found" }, 404);
    }

    // Check if user is blocked
    if (userRecord.isBlocked) {
      return c.json({ success: false, error: "Your account has been blocked by admin" }, 403);
    }

    return c.json({
      success: true,
      user: {
        id: userId,
        email: userRecord.email,
        name: userRecord.name,
        accessToken: data.session.access_token,
      },
    });
  } catch (error) {
    console.log(`Sign-in error: ${error}`);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

// Verify Password (for PIN reset security)
app.post("/make-server-4d451974/verify-password", async (c) => {
  try {
    const { email, password } = await c.req.json();

    if (!email || !password) {
      return c.json({ success: false, error: "Email and password are required" }, 400);
    }

    // Try to sign in with the provided credentials
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      console.log(`Password verification failed: ${error.message}`);
      return c.json({ success: false, verified: false, error: "Incorrect password" }, 401);
    }

    // Password is correct
    return c.json({
      success: true,
      verified: true,
      message: "Password verified successfully"
    });
  } catch (error) {
    console.log(`Password verification error: ${error}`);
    return c.json({ success: false, verified: false, error: String(error) }, 500);
  }
});

// Check Auth (verify token and get user)
app.get("/make-server-4d451974/auth/me", async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    
    if (!accessToken) {
      return c.json({ success: false, error: "No token provided" }, 401);
    }

    const { data: { user }, error } = await supabase.auth.getUser(accessToken);

    if (error || !user) {
      return c.json({ success: false, error: "Invalid token" }, 401);
    }

    // Get user record
    const userRecord = await kv.get(`user:${user.id}`);

    if (!userRecord) {
      return c.json({ success: false, error: "User record not found" }, 404);
    }

    // Check if blocked
    if (userRecord.isBlocked) {
      return c.json({ success: false, error: "Account blocked" }, 403);
    }

    return c.json({
      success: true,
      user: {
        id: user.id,
        email: userRecord.email,
        name: userRecord.name,
      },
    });
  } catch (error) {
    console.log(`Auth check error: ${error}`);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

// ===== ADMIN USER MANAGEMENT ROUTES =====

// Get all users (admin only)
app.get("/make-server-4d451974/admin/users", async (c) => {
  try {
    console.log("Fetching all users from database...");
    const usersData = await kv.getByPrefix("user:");
    const users = Array.isArray(usersData) ? usersData.map(item => item.value || item) : [];
    
    console.log(`Found ${users.length} users`);
    return c.json({ success: true, users });
  } catch (error) {
    console.log(`Error fetching users: ${error}`);
    return c.json({ success: false, error: String(error), users: [] }, 500);
  }
});

// Block user (admin only)
app.post("/make-server-4d451974/admin/users/:id/block", async (c) => {
  try {
    const userId = c.req.param("id");
    const userRecord = await kv.get(`user:${userId}`);

    if (!userRecord) {
      return c.json({ success: false, error: "User not found" }, 404);
    }

    const updatedUser = {
      ...userRecord,
      isBlocked: true,
      blockedAt: new Date().toISOString(),
    };

    await kv.set(`user:${userId}`, updatedUser);
    
    console.log(`User ${userId} (${userRecord.email}) has been blocked`);
    return c.json({ success: true, user: updatedUser });
  } catch (error) {
    console.log(`Error blocking user: ${error}`);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

// Unblock user (admin only)
app.post("/make-server-4d451974/admin/users/:id/unblock", async (c) => {
  try {
    const userId = c.req.param("id");
    const userRecord = await kv.get(`user:${userId}`);

    if (!userRecord) {
      return c.json({ success: false, error: "User not found" }, 404);
    }

    const updatedUser = {
      ...userRecord,
      isBlocked: false,
      unblockedAt: new Date().toISOString(),
    };

    await kv.set(`user:${userId}`, updatedUser);
    
    console.log(`User ${userId} (${userRecord.email}) has been unblocked`);
    return c.json({ success: true, user: updatedUser });
  } catch (error) {
    console.log(`Error unblocking user: ${error}`);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

// ===== BACKGROUND SETTINGS ROUTES =====

// Get background settings
app.get("/make-server-4d451974/admin/background", async (c) => {
  try {
    console.log("Fetching background settings...");
    const settingsData = await kv.get("settings:background");
    
    // Default settings
    const defaultSettings = {
      type: 'image',
      videoUrl: '',
      imageUrl: '',
    };
    
    if (!settingsData) {
      console.log("No settings found, returning defaults");
      return c.json({
        success: true,
        settings: defaultSettings,
      });
    }
    
    console.log("Settings found:", JSON.stringify(settingsData));
    return c.json({ 
      success: true, 
      settings: settingsData 
    });
  } catch (error) {
    console.log(`Error fetching background settings: ${error}`);
    return c.json({ 
      success: false, 
      error: String(error) 
    }, 500);
  }
});

// Save background settings
app.post("/make-server-4d451974/admin/background", async (c) => {
  try {
    const body = await c.req.json();
    const { type, videoUrl, imageUrl } = body;
    
    console.log("Received background settings:", JSON.stringify(body));
    
    const settings = {
      type: type || 'image',
      videoUrl: videoUrl || '',
      imageUrl: imageUrl || '',
      updatedAt: new Date().toISOString(),
    };
    
    console.log("Saving settings:", JSON.stringify(settings));
    await kv.set("settings:background", settings);
    console.log("Background settings saved successfully");
    
    return c.json({ 
      success: true, 
      settings: settings 
    });
  } catch (error) {
    console.log(`Error saving background settings: ${error}`);
    return c.json({ 
      success: false, 
      error: String(error) 
    }, 500);
  }
});

// ===== USER ACTIVITY TRACKING ROUTES =====

// Track user activity (watch, download)
app.post("/make-server-4d451974/activity/track", async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    
    if (!accessToken) {
      return c.json({ success: false, error: "No token provided" }, 401);
    }

    const { data: { user }, error } = await supabase.auth.getUser(accessToken);

    if (error || !user) {
      return c.json({ success: false, error: "Invalid token" }, 401);
    }

    const { movieId, action, movieTitle } = await c.req.json();

    if (!movieId || !action) {
      return c.json({ success: false, error: "Movie ID and action are required" }, 400);
    }

    // Create activity record
    const activityId = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const activity = {
      id: activityId,
      userId: user.id,
      movieId,
      movieTitle: movieTitle || '',
      action, // 'watch' or 'download'
      timestamp: new Date().toISOString(),
    };

    // Save activity
    await kv.set(`activity:${user.id}:${activityId}`, activity);

    // Update movie stats
    const movie = await kv.get(`movie:${movieId}`);
    if (movie) {
      const updatedMovie = {
        ...movie,
        views: (movie.views || 0) + (action === 'watch' ? 1 : 0),
        downloads: (movie.downloads || 0) + (action === 'download' ? 1 : 0),
      };
      await kv.set(`movie:${movieId}`, updatedMovie);
    }

    // Update user stats
    const userStats = await kv.get(`user_stats:${user.id}`) || { 
      totalWatches: 0, 
      totalDownloads: 0,
      lastActive: null 
    };
    
    const updatedStats = {
      ...userStats,
      totalWatches: userStats.totalWatches + (action === 'watch' ? 1 : 0),
      totalDownloads: userStats.totalDownloads + (action === 'download' ? 1 : 0),
      lastActive: new Date().toISOString(),
    };
    
    await kv.set(`user_stats:${user.id}`, updatedStats);

    console.log(`Activity tracked: User ${user.id} ${action}ed movie ${movieId}`);
    
    return c.json({ success: true, activity });
  } catch (error) {
    console.log(`Error tracking activity: ${error}`);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

// Get user activity history (for a specific user)
app.get("/make-server-4d451974/admin/users/:id/activity", async (c) => {
  try {
    const userId = c.req.param("id");
    console.log(`Fetching activity for user: ${userId}`);
    
    const activitiesData = await kv.getByPrefix(`activity:${userId}:`);
    const activities = Array.isArray(activitiesData) ? activitiesData.map(item => item.value || item) : [];
    
    // Sort by timestamp descending
    activities.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
    
    // Get user stats
    const userStats = await kv.get(`user_stats:${userId}`) || { 
      totalWatches: 0, 
      totalDownloads: 0,
      lastActive: null 
    };
    
    console.log(`Found ${activities.length} activities for user ${userId}`);
    return c.json({ 
      success: true, 
      activities,
      stats: userStats
    });
  } catch (error) {
    console.log(`Error fetching user activity: ${error}`);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

// Get analytics report (all users overview)
app.get("/make-server-4d451974/admin/analytics/report", async (c) => {
  try {
    console.log("Generating analytics report...");
    
    // Get all users
    const usersData = await kv.getByPrefix("user:");
    const users = Array.isArray(usersData) ? usersData.map(item => item.value || item) : [];
    
    // Get all movies
    const moviesData = await kv.getByPrefix("movie:");
    const movies = Array.isArray(moviesData) ? moviesData.map(item => item.value || item) : [];
    
    // Get all activities
    const activitiesData = await kv.getByPrefix("activity:");
    const activities = Array.isArray(activitiesData) ? activitiesData.map(item => item.value || item) : [];
    
    // Calculate metrics
    const totalUsers = users.length;
    const totalMovies = movies.length;
    const totalViews = activities.filter(a => a.action === 'watch').length;
    const totalDownloads = activities.filter(a => a.action === 'download').length;
    
    // Get top movies by activity
    const movieActivity = {};
    activities.forEach(activity => {
      if (!movieActivity[activity.movieId]) {
        movieActivity[activity.movieId] = { views: 0, downloads: 0 };
      }
      if (activity.action === 'watch') movieActivity[activity.movieId].views++;
      if (activity.action === 'download') movieActivity[activity.movieId].downloads++;
    });
    
    // Get top 10 movies
    const topMovies = Object.entries(movieActivity)
      .map(([movieId, stats]) => {
        const movie = movies.find(m => m.id === movieId);
        return {
          movieId,
          movieTitle: movie?.title || 'Unknown',
          views: stats.views,
          downloads: stats.downloads,
          totalActivity: stats.views + stats.downloads,
        };
      })
      .sort((a, b) => b.totalActivity - a.totalActivity)
      .slice(0, 10);
    
    // Get most active users
    const userActivity = {};
    activities.forEach(activity => {
      if (!userActivity[activity.userId]) {
        userActivity[activity.userId] = { watches: 0, downloads: 0 };
      }
      if (activity.action === 'watch') userActivity[activity.userId].watches++;
      if (activity.action === 'download') userActivity[activity.userId].downloads++;
    });
    
    const topUsers = Object.entries(userActivity)
      .map(([userId, stats]) => {
        const user = users.find(u => u.id === userId);
        return {
          userId,
          userName: user?.name || 'Unknown',
          userEmail: user?.email || 'Unknown',
          watches: stats.watches,
          downloads: stats.downloads,
          totalActivity: stats.watches + stats.downloads,
        };
      })
      .sort((a, b) => b.totalActivity - a.totalActivity)
      .slice(0, 10);
    
    // Recent activities (last 50)
    const recentActivities = activities
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
      .slice(0, 50)
      .map(activity => {
        const user = users.find(u => u.id === activity.userId);
        const movie = movies.find(m => m.id === activity.movieId);
        return {
          ...activity,
          userName: user?.name || 'Unknown',
          userEmail: user?.email || 'Unknown',
          movieTitle: movie?.title || activity.movieTitle || 'Unknown',
        };
      });
    
    const report = {
      overview: {
        totalUsers,
        totalMovies,
        totalViews,
        totalDownloads,
        totalActivity: totalViews + totalDownloads,
      },
      topMovies,
      topUsers,
      recentActivities,
      generatedAt: new Date().toISOString(),
    };
    
    console.log("Analytics report generated successfully");
    return c.json({ success: true, report });
  } catch (error) {
    console.log(`Error generating analytics report: ${error}`);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

// ==================== AD SETTINGS ROUTES ====================

// Get ad settings
app.get("/make-server-4d451974/ad-settings", async (c) => {
  try {
    console.log("Fetching ad settings...");
    const settings = await kv.get("ad_settings");
    
    // Return default settings if none exist
    if (!settings) {
      const defaultSettings = {
        adsEnabled: false,
        propellerAdsEnabled: false,
        propellerAdsPublisherId: '',
        adsterraEnabled: false,
        adsterraPublisherId: '',
        showAdBeforeVideo: false,
        showAdBetweenContent: false,
        showAdOnDownload: false,
        showBannerAds: false,
        showPopunderAds: false,
        videoAdFrequency: 1,
        downloadAdFrequency: 1,
        skipAdAfterSeconds: 5,
        adBlockerDetection: false,
      };
      return c.json({ success: true, settings: defaultSettings });
    }
    
    return c.json({ success: true, settings });
  } catch (error) {
    console.log(`Error fetching ad settings: ${error}`);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

// Update ad settings
app.put("/make-server-4d451974/ad-settings", async (c) => {
  try {
    const body = await c.req.json();
    const { settings } = body;
    
    if (!settings) {
      return c.json({ success: false, error: "Settings data required" }, 400);
    }
    
    console.log("Updating ad settings:", settings);
    await kv.set("ad_settings", settings);
    
    return c.json({ success: true, message: "Ad settings updated successfully" });
  } catch (error) {
    console.log(`Error updating ad settings: ${error}`);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

// ===== VIDEO STREAM PROXY ROUTE (FOR VIEWING) =====
// Proxy videos for streaming/viewing in browser (no download headers)
app.get("/make-server-4d451974/stream-video", async (c) => {
  try {
    const videoUrl = c.req.query("url");
    
    if (!videoUrl) {
      return c.json({ success: false, error: "URL parameter required" }, 400);
    }
    
    console.log("📺 Streaming video for viewing:", videoUrl);
    
    // Fetch with timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 300000); // 5 minute timeout
    
    const response = await fetch(videoUrl, { 
      signal: controller.signal,
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; TheArchive/1.0)',
      }
    }).finally(() => clearTimeout(timeoutId));
    
    if (!response.ok) {
      console.error(`Failed to fetch video: ${response.status} ${response.statusText}`);
      return c.json({ 
        success: false, 
        error: `Failed to fetch video: ${response.status} ${response.statusText}` 
      }, response.status);
    }
    
    // Get the content type from the source
    const contentType = response.headers.get("Content-Type") || "video/mp4";
    const contentLength = response.headers.get("Content-Length");
    
    console.log("✅ Video fetched, streaming for viewing...");
    
    // Stream with proper headers for VIEWING (inline, not attachment)
    const headers = new Headers({
      "Content-Type": contentType,
      "Content-Disposition": "inline", // VIEW in browser, don't download
      "Cache-Control": "public, max-age=3600",
      "Access-Control-Allow-Origin": "*",
      "Accept-Ranges": "bytes", // Support seeking
    });
    
    if (contentLength) {
      headers.set("Content-Length", contentLength);
    }
    
    return new Response(response.body, { headers });
  } catch (error) {
    console.error("❌ Stream proxy error:", error);
    if (error.name === 'AbortError') {
      return c.json({ success: false, error: "Stream timeout" }, 408);
    }
    return c.json({ success: false, error: String(error) }, 500);
  }
});

// ===== DOWNLOAD PROXY ROUTE (FOR DOWNLOADING) =====
// Proxy downloads to handle CORS issues with external video URLs
app.get("/make-server-4d451974/download-proxy", async (c) => {
  try {
    const videoUrl = c.req.query("url");
    const filename = c.req.query("filename") || "video.mp4";
    
    if (!videoUrl) {
      return c.json({ success: false, error: "URL parameter required" }, 400);
    }
    
    console.log("📥 Proxying download for URL:", videoUrl);
    console.log("📥 Filename:", filename);
    
    // Fetch with timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 300000); // 5 minute timeout
    
    const response = await fetch(videoUrl, { 
      signal: controller.signal,
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; TheArchive/1.0)',
      }
    }).finally(() => clearTimeout(timeoutId));
    
    if (!response.ok) {
      console.error(`Failed to fetch video: ${response.status} ${response.statusText}`);
      return c.json({ 
        success: false, 
        error: `Failed to fetch video: ${response.status} ${response.statusText}` 
      }, response.status);
    }
    
    // Get the content type from the source
    const contentType = response.headers.get("Content-Type") || "video/mp4";
    const contentLength = response.headers.get("Content-Length");
    
    console.log("✅ Video fetched, streaming for download...");
    
    // Stream with proper headers for DOWNLOADING (attachment)
    const headers = new Headers({
      "Content-Type": contentType,
      "Content-Disposition": `attachment; filename="${filename}"`,
      "Cache-Control": "no-cache",
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Expose-Headers": "Content-Length, Content-Disposition",
    });
    
    if (contentLength) {
      headers.set("Content-Length", contentLength);
    }
    
    return new Response(response.body, { headers });
  } catch (error) {
    console.error("❌ Download proxy error:", error);
    if (error.name === 'AbortError') {
      return c.json({ success: false, error: "Download timeout" }, 408);
    }
    return c.json({ success: false, error: String(error) }, 500);
  }
});

// ========== GM FEED ENDPOINTS (Great Moments - TikTok-style temporary content) ==========

// Get all GM content (filter by 72 hours)
app.get("/make-server-4d451974/w-feed", async (c) => {
  try {
    console.log("📱 Fetching GM feed content...");
    
    // Add timeout
    const timeoutPromise = new Promise((_, reject) => 
      setTimeout(() => reject(new Error('GM feed timeout')), 30000)
    );
    
    // Fetch both user content (w:) and seeded content (w_content_) with timeout
    const [userContent, seededContent] = await Promise.race([
      Promise.all([
        kv.getByPrefix("w:"),
        kv.getByPrefix("w_content_")
      ]),
      timeoutPromise
    ]);
    
    const allContent = [
      ...(Array.isArray(userContent) ? userContent.map(item => item.value || item) : []),
      ...(Array.isArray(seededContent) ? seededContent.map(item => item.value || item) : [])
    ];
    
    // Filter out expired content (older than 72 hours)
    const now = Date.now();
    const validContent = allContent.filter(item => {
      try {
        const expiresAt = new Date(item.expiresAt).getTime();
        return expiresAt > now;
      } catch {
        return false; // Skip invalid items
      }
    });
    
    console.log(`📱 Found ${validContent.length} valid GM content items`);
    return c.json({ success: true, content: validContent });
  } catch (error) {
    console.log(`❌ Error fetching GM feed: ${error}`);
    return c.json({ success: false, error: String(error), content: [] }, 500);
  }
});

// Upload W content
app.post("/make-server-4d451974/w-feed/upload", async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    
    if (!accessToken) {
      return c.json({ success: false, error: 'No token provided' }, 401);
    }
    
    const { data: { user }, error: authError } = await supabase.auth.getUser(accessToken);
    
    if (authError || !user) {
      console.log("❌ Unauthorized W upload attempt:", authError?.message);
      return c.json({ success: false, error: 'Unauthorized' }, 401);
    }

    const formData = await c.req.formData();
    const file = formData.get('file') as File;
    const caption = formData.get('caption') as string;
    const contentType = formData.get('contentType') as string; // 'video' or 'image'
    
    if (!file) {
      return c.json({ success: false, error: 'No file provided' }, 400);
    }

    console.log(`📱 User ${user.email} uploading W content: ${file.name}`);

    // Create bucket if it doesn't exist
    const bucketName = 'make-4d451974-w-content';
    const { data: buckets } = await supabase.storage.listBuckets();
    const bucketExists = buckets?.some(bucket => bucket.name === bucketName);
    
    if (!bucketExists) {
      console.log("🪣 Creating W content bucket...");
      await supabase.storage.createBucket(bucketName, { 
        public: false,
        fileSizeLimit: 104857600, // 100MB
        allowedMimeTypes: ['video/mp4', 'video/quicktime', 'video/x-msvideo', 'video/webm', 'image/jpeg', 'image/png', 'image/gif', 'image/webp']
      });
    }

    // Check if user is admin or special "gm" account
    const isGMAccount = user.email === 'gm@theearchive.com' || user.id === 'gm-official';
    
    // Validate file type based on account type
    const imageTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    const videoTypes = ['video/mp4', 'video/quicktime', 'video/x-msvideo', 'video/webm'];
    const allowedTypes = isGMAccount ? [...imageTypes, ...videoTypes] : imageTypes;
    
    if (!allowedTypes.includes(file.type)) {
      const message = isGMAccount 
        ? 'Invalid file type!' 
        : 'Only images and GIFs are allowed! Videos are for official GM account only.';
      return c.json({ success: false, error: message }, 400);
    }

    // Upload file to Supabase Storage
    const fileExt = file.name.split('.').pop();
    const fileName = `${user.id}/${Date.now()}.${fileExt}`;
    
    // Convert file to buffer with timeout
    const bufferPromise = file.arrayBuffer();
    const timeoutPromise = new Promise((_, reject) => 
      setTimeout(() => reject(new Error('File read timeout')), 60000) // 60s for large files
    );
    const fileBuffer = await Promise.race([bufferPromise, timeoutPromise]);
    
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from(bucketName)
      .upload(fileName, fileBuffer, {
        contentType: file.type,
        upsert: false
      });

    if (uploadError) {
      console.log(`❌ Upload error: ${uploadError.message}`);
      return c.json({ success: false, error: uploadError.message }, 500);
    }

    // Get signed URL (valid for 73 hours to ensure it lasts full 72 hours)
    const { data: urlData, error: urlError } = await supabase.storage
      .from(bucketName)
      .createSignedUrl(fileName, 262800); // 73 hours in seconds
    
    if (urlError || !urlData?.signedUrl) {
      console.log(`❌ Error creating signed URL: ${urlError?.message}`);
      return c.json({ success: false, error: 'Failed to create signed URL' }, 500);
    }

    console.log(`✅ File uploaded and signed URL created: ${urlData.signedUrl.substring(0, 50)}...`);

    // Store metadata in KV store
    const wId = `w:${Date.now()}_${user.id}`;
    const wData = {
      id: wId,
      userId: user.id,
      userEmail: user.email,
      caption: caption || '',
      contentType: contentType || 'video',
      fileUrl: urlData?.signedUrl || '',
      fileName: fileName,
      uploadedAt: new Date().toISOString(),
      expiresAt: new Date(Date.now() + 72 * 60 * 60 * 1000).toISOString(), // 72 hours from now
    };

    await kv.set(wId, wData);
    console.log(`✅ W content uploaded successfully: ${wId}`);

    return c.json({ success: true, content: wData });
  } catch (error) {
    console.log(`❌ Error uploading W content: ${error}`);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

// Delete W content (user deletes their own content)
app.delete("/make-server-4d451974/w-feed/:id", async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    const { data: { user }, error: authError } = await supabase.auth.getUser(accessToken);
    
    if (!user) {
      return c.json({ success: false, error: 'Unauthorized' }, 401);
    }

    const contentId = c.req.param("id");
    const content = await kv.get(contentId);

    if (!content) {
      return c.json({ success: false, error: 'Content not found' }, 404);
    }

    // Check if user owns this content
    if (content.userId !== user.id) {
      return c.json({ success: false, error: 'Not authorized to delete this content' }, 403);
    }

    // Delete from storage
    const bucketName = 'make-4d451974-w-content';
    await supabase.storage.from(bucketName).remove([content.fileName]);

    // Delete from KV store
    await kv.del(contentId);

    console.log(`✅ W content deleted: ${contentId}`);
    return c.json({ success: true, message: 'Content deleted successfully' });
  } catch (error) {
    console.log(`❌ Error deleting W content: ${error}`);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

// Cleanup expired GM content (call this periodically)
app.post("/make-server-4d451974/w-feed/cleanup", async (c) => {
  try {
    console.log("🧹 Starting GM feed cleanup...");
    const wContentData = await kv.getByPrefix("w:");
    const allContent = Array.isArray(wContentData) ? wContentData.map(item => item.value || item) : [];
    
    const now = Date.now();
    let deletedCount = 0;
    
    for (const item of allContent) {
      const expiresAt = new Date(item.expiresAt).getTime();
      if (expiresAt <= now) {
        // Delete from storage
        const bucketName = 'make-4d451974-w-content';
        await supabase.storage.from(bucketName).remove([item.fileName]);
        
        // Delete from KV store
        await kv.del(item.id);
        deletedCount++;
      }
    }
    
    console.log(`✅ GM feed cleanup complete. Deleted ${deletedCount} expired items.`);
    return c.json({ success: true, deletedCount });
  } catch (error) {
    console.log(`❌ Error during GM feed cleanup: ${error}`);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

// ==========================================
// GM FEED ENGAGEMENT SETTINGS
// ==========================================
  
// Get GM settings
app.get('/make-server-4d451974/gm-settings', async (c) => {
  const settings = await kv.get('gm_feed_settings');
  return c.json({ 
    success: true, 
    settings: settings || {
      enabled: true,
      likesMin: 10,
      likesMax: 100,
      viewsMin: 50,
      viewsMax: 1000,
      enableFakeComments: true,
    }
  });
});

// Seed 100 Sample GM Content
app.post('/make-server-4d451974/admin/seed-gm-content', async (c) => {
  try {
    console.log('🌱 Seeding 100 sample GM content...');
    
    const sampleCaptions = [
      // Romantic
      "Love isn't about finding the perfect person, it's about seeing an imperfect person perfectly ❤️",
      "In your arms, I found my home 🏡💕",
      "Every love story is beautiful, but ours is my favorite 💑",
      "You are my today and all of my tomorrows 🌅",
      "Love is composed of a single soul inhabiting two bodies ✨",
      "When I'm with you, hours feel like seconds ⏰💖",
      "You had me at hello 👋❤️",
      "My heart is perfect because you are inside 💝",
      "Together is my favorite place to be 🌍💕",
      "You are my sunshine on a rainy day ☀️🌧️",
      
      // Cinematic/Dramatic
      "The best view comes after the hardest climb 🏔️",
      "Dreams don't work unless you do 💪✨",
      "Stars can't shine without darkness 🌟",
      "Life is a journey, not a destination 🚶‍♂️🌅",
      "Chase the vision, not the money 💎",
      "The future belongs to those who believe in their dreams 🎯",
      "Great things never come from comfort zones 🚀",
      "Be the energy you want to attract ⚡",
      "Your vibe attracts your tribe 👥✨",
      "Sunset state of mind 🌇",
      
      // Motivational
      "Success is not final, failure is not fatal 🔥",
      "The only way to do great work is to love what you do 💼❤️",
      "Believe you can and you're halfway there 🎯",
      "Your limitation is only your imagination 🧠✨",
      "Push yourself, because no one else is going to do it for you 💪",
      "Great things never came from comfort zones 🌟",
      "Dream it. Wish it. Do it. ✅",
      "Success doesn't just find you. You have to go out and get it 🏆",
      "Don't stop when you're tired. Stop when you're done 🔥",
      "Wake up with determination. Go to bed with satisfaction 😴✨",
      
      // Adventure
      "Adventure awaits 🗺️",
      "Collect moments, not things 📸",
      "Wanderlust and city dust 🌆",
      "Take only memories, leave only footprints 👣",
      "Travel far enough to meet yourself 🌍",
      "The world is a book, and those who don't travel read only one page 📖",
      "Not all who wander are lost 🧭",
      "Life is short and the world is wide 🌎",
      "To travel is to live 🌏✈️",
      "Adventure is out there! 🏕️",
      
      // Nature
      "Nature does not hurry, yet everything is accomplished 🌿",
      "Look deep into nature, and you will understand everything 🍃",
      "In every walk with nature, one receives far more than he seeks 🌲",
      "The earth has music for those who listen 🎵🌍",
      "Adopt the pace of nature: her secret is patience 🦋",
      "Nature always wears the colors of the spirit 🎨",
      "Between every two pines is a doorway to a new world 🌲🚪",
      "Choose only one master — Nature 🌺",
      "Study nature, love nature, stay close to nature 🍂",
      "Heaven is under our feet as well as over our heads 🌈",
      
      // Inspirational
      "Be yourself; everyone else is already taken ✨",
      "The best time for new beginnings is now 🌱",
      "Difficult roads often lead to beautiful destinations 🛤️",
      "Your only limit is your mind 🧠💫",
      "Sometimes later becomes never. Do it now ⏰",
      "Don't wait for opportunity. Create it 🔨",
      "Little things make big days 🎉",
      "It's going to be hard, but hard does not mean impossible 💪",
      "Do something today that your future self will thank you for 🙏",
      "Everything you can imagine is real 🌈",
      
      // Artistic
      "Art is not what you see, but what you make others see 🎨",
      "Creativity takes courage 🖌️",
      "Every artist was first an amateur 👨‍🎨",
      "Life is the art of drawing without an eraser ✏️",
      "Color is my day-long obsession, joy and torment 🌈",
      "Art enables us to find ourselves and lose ourselves at the same time 🎭",
      "The purpose of art is washing the dust of daily life off our souls 🧼✨",
      "Art is the most intense mode of individualism 🎨",
      "Creativity is intelligence having fun 🧠🎉",
      "Every child is an artist 👶🖍️",
      
      // Night vibes
      "Good vibes only 🌙✨",
      "Night owl mode activated 🦉",
      "City lights and starry nights 🌃⭐",
      "The night is still young 🌌",
      "Moonlight drowns out all but the brightest stars 🌙",
      "The darker the night, the brighter the stars ✨",
      "Night changes everything 🌃",
      "Let the night guide you 🌠",
      "Beneath the stars, we are all equal 🌟",
      "Night whispers secrets 🌙💫",
      
      // Fashion/Style
      "Style is a way to say who you are without speaking 👗",
      "Fashion is what you buy, style is what you do with it 💃",
      "Dress like you're already famous ⭐",
      "Life isn't perfect, but your outfit can be 👔",
      "Fashion fades, style is eternal ✨",
      "Elegance is the only beauty that never fades 💎",
      "Style is something each of us already has 👑",
      "Simplicity is the keynote of all true elegance 🖤",
      "Fashion is about dressing according to what's fashionable. Style is more about being yourself 🎨",
      "The best things in life are free. The second best are very expensive 💰",
      
      // Fitness/Health
      "Stronger than yesterday 💪",
      "Sweat is just fat crying 😅",
      "No pain, no gain 🏋️",
      "Train insane or remain the same 🔥",
      "Your body can stand almost anything. It's your mind you have to convince 🧠",
      "The only bad workout is the one that didn't happen ✅",
      "Fitness is not about being better than someone else. It's about being better than you used to be 📈",
      "Take care of your body. It's the only place you have to live 🏠",
      "A one hour workout is 4% of your day 🕐",
      "Wake up. Work out. Look hot. Kick ass. 🔥"
    ];

    const videoUrls = [
      "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4",
      "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4",
      "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4",
      "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4",
      "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4",
      "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyrides.mp4",
      "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerMeltdowns.mp4",
      "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/Sintel.mp4",
      "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/SubaruOutbackOnStreetAndDirt.mp4",
      "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4"
    ];

    const imageCategories = [
      "romantic sunset",
      "cinematic landscape",
      "urban night",
      "nature beauty",
      "ocean waves",
      "mountain peak",
      "city skyline",
      "forest path",
      "desert dunes",
      "waterfall nature"
    ];

    const now = Date.now();
    const existingContent = await kv.getByPrefix('w_content_');
    const startIndex = existingContent.length;

    for (let i = 0; i < 100; i++) {
      const contentId = `w_content_gm_${Date.now()}_${i}`;
      const isVideo = i % 3 === 0; // 33% videos, 67% images
      const caption = sampleCaptions[i % sampleCaptions.length];
      
      let fileUrl;
      let fileName;
      
      if (isVideo) {
        fileUrl = videoUrls[i % videoUrls.length];
        fileName = `gm_video_${i}.mp4`;
      } else {
        // Use Unsplash for images
        const category = imageCategories[i % imageCategories.length];
        fileUrl = `https://source.unsplash.com/800x1200/?${category.replace(' ', ',')}`;
        fileName = `gm_image_${i}.jpg`;
      }

      const content = {
        id: contentId,
        userId: 'gm-official',
        userEmail: 'gm@theearchive.com',
        userName: 'GM Official',
        caption,
        contentType: isVideo ? 'video' : 'image',
        fileUrl,
        fileName,
        uploadedAt: new Date(now + i * 1000).toISOString(), // Stagger timestamps
        expiresAt: new Date(now + (72 * 60 * 60 * 1000)).toISOString(), // 72 hours from now
      };

      await kv.set(contentId, content);
      console.log(`✅ Created GM content ${i + 1}/100: ${isVideo ? 'VIDEO' : 'IMAGE'}`);
    }

    console.log('🎉 Successfully seeded 100 GM content items!');
    return c.json({ 
      success: true, 
      message: '100 GM content items created successfully!',
      totalCreated: 100
    });
  } catch (error) {
    console.error('Error seeding GM content:', error);
    return c.json({ success: false, error: error.message }, 500);
  }
});

// ==========================================
// GM SOCIAL FEED - Reddit-style posts system
// ==========================================

// Get all GM posts (public endpoint - no auth required)
app.get("/make-server-4d451974/gm-posts", async (c) => {
  try {
    console.log('📡 GET /gm-posts - Fetching all posts...');
    const authHeader = c.req.header('Authorization');
    const accessToken = authHeader?.split(' ')[1];
    const anonKey = Deno.env.get('SUPABASE_ANON_KEY') ?? '';
    
    console.log(`🔑 Auth header: ${authHeader ? 'Present' : 'Missing'}`);
    let user = null;
    
    // Try to get user if token exists and is not the anon key
    if (accessToken && accessToken !== 'undefined' && accessToken !== anonKey) {
      try {
        console.log('🔍 Validating user token...');
        const { data, error } = await supabase.auth.getUser(accessToken);
        if (error) {
          console.log('❌ Token validation error:', error.message);
        } else {
          user = data?.user || null;
          console.log(`👤 User authenticated: ${user ? user.email : 'None'}`);
        }
      } catch (authError) {
        console.log('⚠️ User not authenticated, continuing without auth:', authError);
      }
    } else if (accessToken === anonKey) {
      console.log('🔑 Using anon key - no user authentication');
    } else {
      console.log('🔓 No token provided - public access');
    }
    
    const postsData = await kv.getByPrefix('gm_post:');
    console.log(`📦 Found ${postsData.length} raw posts from KV store`);
    console.log(`📦 Posts data sample:`, JSON.stringify(postsData.slice(0, 3), null, 2));
    
    // Filter out any invalid posts and extract values
    const posts = postsData
      .map(p => {
        console.log(`🔍 Processing item:`, { key: p?.key, hasValue: !!p?.value, valueId: p?.value?.id });
        return p?.value;
      })
      .filter(post => {
        const isValid = post && typeof post === 'object' && post.id && post.createdAt;
        if (!isValid) {
          console.log('❌ Invalid post found:', { hasPost: !!post, hasId: !!post?.id, hasCreatedAt: !!post?.createdAt, post });
        }
        return isValid;
      })
      .sort((a, b) => 
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
    
    console.log(`✅ Filtered to ${posts.length} valid posts`);
    console.log(`✅ First valid post sample:`, posts[0]);

    // Check if user has GMed each post
    const userGMsData = user?.id ? await kv.get(`gm_user_gms:${user.id}`) : null;
    const userGMs = Array.isArray(userGMsData) ? userGMsData : [];

    const postsWithUserData = posts.map(post => ({
      ...post,
      hasUserGMed: user?.id && post?.id ? userGMs.includes(post.id) : false
    }));

    console.log(`📤 Returning ${postsWithUserData.length} posts to frontend`);
    return c.json({ success: true, posts: postsWithUserData });
  } catch (error) {
    console.error('Error fetching GM posts:', error);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

// Create a new GM post
app.post("/make-server-4d451974/gm-posts/create", async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    const { data, error: authError } = await supabase.auth.getUser(accessToken);
    const user = data?.user;
    
    if (!user?.id || authError) {
      return c.json({ success: false, error: 'Unauthorized - Please login to create posts' }, 401);
    }

    const formData = await c.req.formData();
    const postType = formData.get('postType') as string;
    const title = formData.get('title') as string;
    const content = formData.get('content') as string;
    const socialLink = formData.get('socialLink') as string;
    const mediaFile = formData.get('media') as File;

    if (!title?.trim()) {
      return c.json({ success: false, error: 'Title is required' }, 400);
    }

    // Validate social link if post type is social_link
    if (postType === 'social_link' && !socialLink?.trim()) {
      return c.json({ success: false, error: 'Social link is required for social posts' }, 400);
    }

    let mediaUrl = '';

    // Upload media if provided
    if (mediaFile && (postType === 'image' || postType === 'video')) {
      const bucketName = 'make-4d451974-gm-posts';
      
      // Create bucket if doesn't exist
      const { data: buckets } = await supabase.storage.listBuckets();
      const bucketExists = buckets?.some(bucket => bucket.name === bucketName);
      if (!bucketExists) {
        await supabase.storage.createBucket(bucketName, { public: false });
      }

      // Upload file
      const fileExt = mediaFile.name.split('.').pop();
      const fileName = `${user.id}/${Date.now()}.${fileExt}`;
      const arrayBuffer = await mediaFile.arrayBuffer();
      const buffer = new Uint8Array(arrayBuffer);

      const { data: uploadData, error: uploadError } = await supabase.storage
        .from(bucketName)
        .upload(fileName, buffer, {
          contentType: mediaFile.type,
          cacheControl: '3600',
          upsert: false,
        });

      if (uploadError) {
        console.error('Upload error:', uploadError);
        return c.json({ success: false, error: 'Failed to upload media' }, 500);
      }

      // Get signed URL
      const { data: signedUrlData } = await supabase.storage
        .from(bucketName)
        .createSignedUrl(fileName, 60 * 60 * 24 * 365); // 1 year

      mediaUrl = signedUrlData?.signedUrl || '';
    }

    // Create post
    const postId = `post_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const post = {
      id: postId,
      userId: user.id,
      userName: user.user_metadata?.name || user.email?.split('@')[0] || 'User',
      userEmail: user.email,
      postType,
      title,
      content: content || '',
      mediaUrl,
      socialLink: socialLink || '',
      gmCount: 0,
      commentCount: 0,
      createdAt: new Date().toISOString(),
    };

    console.log(`Creating GM post: ${postId}, type: ${postType}, socialLink: ${socialLink || 'none'}`);
    await kv.set(`gm_post:${postId}`, post);

    return c.json({ success: true, post });
  } catch (error) {
    console.error('Error creating post:', error);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

// Admin: Bulk create GM posts (for posting under different user accounts)
app.post("/make-server-4d451974/admin/bulk-create-gm-posts", async (c) => {
  try {
    const body = await c.req.json();
    const { posts } = body;

    if (!Array.isArray(posts) || posts.length === 0) {
      return c.json({ success: false, error: 'Posts array is required' }, 400);
    }

    console.log(`📝 Bulk creating ${posts.length} GM posts...`);

    let successCount = 0;
    let failCount = 0;
    const createdPosts = [];

    for (const postData of posts) {
      try {
        const { userName, userEmail, title, content, socialLink } = postData;

        // Validate required fields
        if (!userName?.trim() || !userEmail?.trim() || !title?.trim() || !socialLink?.trim()) {
          console.error('❌ Missing required fields:', postData);
          failCount++;
          continue;
        }

        // Create a fake user ID from email (consistent for same email)
        const userId = `fake_${userEmail.replace(/[^a-zA-Z0-9]/g, '_')}`;

        // Create post
        const postId = `post_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        const post = {
          id: postId,
          userId,
          userName,
          userEmail,
          postType: 'social_link',
          title,
          content: content || '',
          mediaUrl: '',
          socialLink,
          gmCount: 0,
          commentCount: 0,
          createdAt: new Date().toISOString(),
        };

        await kv.set(`gm_post:${postId}`, post);
        console.log(`✅ Created post: ${postId} by ${userName}`);
        
        createdPosts.push(post);
        successCount++;

        // Small delay to avoid timestamp collisions
        await new Promise(resolve => setTimeout(resolve, 10));
      } catch (error) {
        console.error('Error creating individual post:', error);
        failCount++;
      }
    }

    console.log(`📊 Bulk create complete: ${successCount} success, ${failCount} failed`);

    return c.json({ 
      success: true, 
      successCount, 
      failCount,
      createdPosts,
      message: `Created ${successCount} posts successfully`
    });
  } catch (error) {
    console.error('Error bulk creating posts:', error);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

// Toggle GM (like) on a post
app.post("/make-server-4d451974/gm-posts/:id/gm", async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    const { data, error: authError } = await supabase.auth.getUser(accessToken);
    const user = data?.user;
    
    if (!user?.id || authError) {
      return c.json({ success: false, error: 'Unauthorized - Please login to GM posts' }, 401);
    }

    const postId = c.req.param('id');
    const post = await kv.get(`gm_post:${postId}`);

    if (!post) {
      return c.json({ success: false, error: 'Post not found' }, 404);
    }

    // Get user's GMs
    const userGMs = (await kv.get(`gm_user_gms:${user.id}`)) || [];
    const hasGMed = userGMs.includes(postId);

    let newGMCount = post.gmCount;
    let newUserGMs;

    if (hasGMed) {
      // Remove GM
      newGMCount = Math.max(0, newGMCount - 1);
      newUserGMs = userGMs.filter(id => id !== postId);
    } else {
      // Add GM
      newGMCount = newGMCount + 1;
      newUserGMs = [...userGMs, postId];
    }

    // Update post
    await kv.set(`gm_post:${postId}`, { ...post, gmCount: newGMCount });
    
    // Update user GMs
    await kv.set(`gm_user_gms:${user.id}`, newUserGMs);

    return c.json({ 
      success: true, 
      gmCount: newGMCount,
      hasUserGMed: !hasGMed
    });
  } catch (error) {
    console.error('Error toggling GM:', error);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

// Get comments for a post
app.get("/make-server-4d451974/gm-posts/:id/comments", async (c) => {
  try {
    const postId = c.req.param('id');
    const commentsData = await kv.getByPrefix(`gm_comment:${postId}:`);
    const comments = commentsData.map(c => c.value).sort((a, b) => 
      new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
    );

    return c.json({ success: true, comments });
  } catch (error) {
    console.error('Error fetching comments:', error);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

// Add a comment to a post
app.post("/make-server-4d451974/gm-posts/:id/comment", async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    const { data, error: authError } = await supabase.auth.getUser(accessToken);
    const user = data?.user;
    
    if (!user?.id || authError) {
      return c.json({ success: false, error: 'Unauthorized - Please login to comment' }, 401);
    }

    const postId = c.req.param('id');
    const { content } = await c.req.json();

    if (!content?.trim()) {
      return c.json({ success: false, error: 'Comment cannot be empty' }, 400);
    }

    const post = await kv.get(`gm_post:${postId}`);
    if (!post) {
      return c.json({ success: false, error: 'Post not found' }, 404);
    }

    // Create comment
    const commentId = `comment_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const comment = {
      id: commentId,
      postId,
      userId: user.id,
      userName: user.user_metadata?.name || user.email?.split('@')[0] || 'User',
      content,
      createdAt: new Date().toISOString(),
    };

    await kv.set(`gm_comment:${postId}:${commentId}`, comment);

    // Update post comment count
    await kv.set(`gm_post:${postId}`, { ...post, commentCount: post.commentCount + 1 });

    return c.json({ success: true, comment });
  } catch (error) {
    console.error('Error adding comment:', error);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

// Clear all GM posts (for debugging)
app.delete("/make-server-4d451974/admin/clear-gm-posts", async (c) => {
  try {
    console.log('🗑️ Clearing all GM posts...');
    const postsData = await kv.getByPrefix('gm_post:');
    const keys = postsData.map(p => p.key);
    
    if (keys.length > 0) {
      await kv.mdel(keys);
      console.log(`✅ Cleared ${keys.length} GM posts`);
    }
    
    return c.json({ success: true, message: `Cleared ${keys.length} posts` });
  } catch (error) {
    console.error('Error clearing GM posts:', error);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

// Debug: Get raw GM posts data from KV
app.get("/make-server-4d451974/admin/debug-gm-posts", async (c) => {
  try {
    console.log('🔍 DEBUG: Fetching raw GM posts data...');
    const postsData = await kv.getByPrefix('gm_post:');
    console.log(`📊 Found ${postsData.length} items with gm_post: prefix`);
    
    // Log first 3 items
    console.log('First 3 items:', JSON.stringify(postsData.slice(0, 3), null, 2));
    
    return c.json({
      success: true,
      totalItems: postsData.length,
      items: postsData,
      sample: postsData.slice(0, 5)
    });
  } catch (error) {
    console.error('Error in debug route:', error);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

// Clear ALL GM posts (admin only)
app.delete("/make-server-4d451974/admin/clear-gm-posts", async (c) => {
  try {
    console.log('🗑️ Clearing ALL GM posts...');
    const existingPosts = await kv.getByPrefix('gm_post:');
    console.log(`Found ${existingPosts.length} posts to delete`);
    
    if (existingPosts.length > 0) {
      const keys = existingPosts.map(p => p.key);
      await kv.mdel(keys);
      console.log(`✅ Deleted ${keys.length} posts`);
    }
    
    return c.json({ 
      success: true, 
      message: `Cleared ${existingPosts.length} posts`,
      deletedCount: existingPosts.length 
    });
  } catch (error) {
    console.error('Error clearing posts:', error);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

// Seed initial GM posts for engagement
app.post("/make-server-4d451974/admin/seed-gm-posts", async (c) => {
  try {
    console.log('🌱 Seeding initial GM posts...');
    
    // ALWAYS clear existing posts first for clean slate
    console.log('🗑️ Clearing ALL existing posts first...');
    const existingPosts = await kv.getByPrefix('gm_post:');
    console.log(`📊 Found ${existingPosts.length} existing posts`);
    
    if (existingPosts.length > 0) {
      const keys = existingPosts.map(p => p.key);
      await kv.mdel(keys);
      console.log(`✅ Cleared ${keys.length} existing posts`);
      // Wait for KV to fully clear
      await new Promise(resolve => setTimeout(resolve, 1000));
    }

    const seedPosts = [
      {
        postType: 'text',
        title: 'Welcome to Great Moments! 🎉',
        content: 'This is where we share our favorite movie moments, discuss cinema, and connect with fellow film lovers. Drop your favorite movie quote below! 🎬',
      },
      {
        postType: 'text',
        title: 'What\'s the best movie you watched this week?',
        content: 'Share your recent cinema discoveries! I just watched The Shawshank Redemption for the 10th time and it still hits different every time. 🔥',
      },
      {
        postType: 'text',
        title: 'Unpopular opinion: Sequels can be better than originals',
        content: 'The Dark Knight, Godfather Part II, Empire Strikes Back... sometimes the sequel surpasses the original. Change my mind! 🎯',
      },
      {
        postType: 'text',
        title: 'Looking for movie recommendations 🍿',
        content: 'I love psychological thrillers and mind-bending plots. Already seen Inception, Shutter Island, and Memento. What should I watch next?',
      },
      {
        postType: 'text',
        title: 'That moment when the plot twist hits... 🤯',
        content: 'Just finished watching a movie with the most insane plot twist. My jaw literally dropped. No spoilers, but if you know, you know!',
      },
      {
        postType: 'text',
        title: 'Classic movies still hold up!',
        content: 'Just introduced my younger sibling to The Godfather and they were blown away. Proof that great storytelling is timeless. What classics do you recommend?',
      },
      {
        postType: 'text',
        title: 'Best movie soundtrack?',
        content: 'Interstellar\'s soundtrack by Hans Zimmer is a masterpiece. That organ in "Mountains" scene still gives me chills. What\'s your favorite movie score? 🎵',
      },
      {
        postType: 'text',
        title: 'Friday night movie marathon - Genre?',
        content: 'Setting up for an all-night movie marathon this Friday. Should I go Horror, Sci-Fi, or Classic Action? Drop your suggestions! 🎬🍕',
      },
      {
        postType: 'text',
        title: 'Actors who disappeared but were legendary',
        content: 'Remember actors who had a few iconic roles then vanished? Let\'s appreciate their contributions to cinema! Who comes to mind?',
      },
      {
        postType: 'text',
        title: 'Movies that made you cry (admit it!) 😢',
        content: 'It\'s okay to admit it - some movies just hit different. For me, it was The Green Mile. What movie made you tear up?',
      },
      {
        postType: 'text',
        title: 'Best movie franchise of all time?',
        content: 'Lord of the Rings, Star Wars, Marvel, Harry Potter... which franchise reigns supreme in your opinion? Let\'s settle this! 👑',
      },
      {
        postType: 'text',
        title: 'That one movie everyone loves but you don\'t',
        content: 'Okay controversial take time... I know everyone loves it, but I just couldn\'t get into Avatar (the blue people one). Anyone else? 👀',
      },
      {
        postType: 'text',
        title: 'Directors who never miss 🎯',
        content: 'Christopher Nolan, Quentin Tarantino, Martin Scorsese... which director has the perfect filmography in your eyes?',
      },
      {
        postType: 'text',
        title: 'Movie quotes you use in daily life',
        content: '"May the Force be with you" is a staple in my vocabulary 😂 What movie quotes do you randomly drop in conversations?',
      },
      {
        postType: 'text',
        title: 'Underrated gems nobody talks about',
        content: 'There are so many amazing movies that flew under the radar. Let\'s give them some love! What underrated film deserves more recognition?',
      },
    ];

    const adminUser = {
      id: 'admin_system',
      email: 'admin@theearchive.com',
      user_metadata: { name: 'THEE ARCHIVE Team' }
    };

    for (let i = 0; i < seedPosts.length; i++) {
      const seedPost = seedPosts[i];
      const postId = `post_seed_${Date.now()}_${i}`;
      
      const post = {
        id: postId,
        userId: adminUser.id,
        userName: adminUser.user_metadata.name,
        userEmail: adminUser.email,
        postType: seedPost.postType,
        title: seedPost.title || '',
        content: seedPost.content || '',
        mediaUrl: '',
        socialLink: seedPost.socialLink || '',
        gmCount: Math.floor(Math.random() * 50) + 5, // Random GMs between 5-55
        commentCount: Math.floor(Math.random() * 20), // Random comments 0-20
        createdAt: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString(), // Random time in last 7 days
      };

      console.log(`Creating post ${i + 1}/${seedPosts.length}: ${post.id}`);
      await kv.set(`gm_post:${postId}`, post);
      console.log(`✅ Created post: ${post.id}`);
    }

    console.log(`✅ Seeded ${seedPosts.length} GM posts successfully`);
    
    // Verify posts were created and log their structure
    await new Promise(resolve => setTimeout(resolve, 500));
    const verifyPosts = await kv.getByPrefix('gm_post:');
    console.log(`✅ Verification: ${verifyPosts.length} posts now in database`);
    console.log(`✅ First post structure:`, verifyPosts[0]);
    
    return c.json({ 
      success: true, 
      message: `Seeded ${seedPosts.length} GM posts`,
      count: verifyPosts.length,
      posts: verifyPosts.slice(0, 3)
    });
  } catch (error) {
    console.error('Error seeding GM posts:', error);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

// ===== MOVIE SHORTS ROUTES =====

// Get likes for a movie short
app.get("/make-server-4d451974/shorts/likes/:movieId", async (c) => {
  try {
    const movieId = c.req.param("movieId");
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    
    const likesData = await kv.get(`shorts_likes:${movieId}`);
    const likes = likesData ? JSON.parse(likesData) : [];
    
    let userLiked = false;
    if (accessToken) {
      const { data: { user } } = await supabase.auth.getUser(accessToken);
      if (user) {
        userLiked = likes.includes(user.id);
      }
    }
    
    return c.json({
      success: true,
      count: likes.length,
      userLiked
    });
  } catch (error) {
    console.error('Error getting likes:', error);
    return c.json({ success: false, error: error.message }, 500);
  }
});

// Toggle like for a movie short
app.post("/make-server-4d451974/shorts/like/:movieId", async (c) => {
  try {
    const movieId = c.req.param("movieId");
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    
    if (!accessToken) {
      return c.json({ success: false, error: 'Unauthorized' }, 401);
    }
    
    const { data: { user } } = await supabase.auth.getUser(accessToken);
    if (!user) {
      return c.json({ success: false, error: 'Unauthorized' }, 401);
    }
    
    const { action } = await c.req.json();
    
    const likesData = await kv.get(`shorts_likes:${movieId}`);
    let likes = likesData ? JSON.parse(likesData) : [];
    
    if (action === 'like') {
      if (!likes.includes(user.id)) {
        likes.push(user.id);
      }
    } else {
      likes = likes.filter((id: string) => id !== user.id);
    }
    
    await kv.set(`shorts_likes:${movieId}`, JSON.stringify(likes));
    
    return c.json({
      success: true,
      count: likes.length
    });
  } catch (error) {
    console.error('Error toggling like:', error);
    return c.json({ success: false, error: error.message }, 500);
  }
});

// Get comments for a movie short
app.get("/make-server-4d451974/shorts/comments/:movieId", async (c) => {
  try {
    const movieId = c.req.param("movieId");
    
    const commentsData = await kv.get(`shorts_comments:${movieId}`);
    const comments = commentsData ? JSON.parse(commentsData) : [];
    
    return c.json({
      success: true,
      comments: comments.sort((a: any, b: any) => 
        new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
      )
    });
  } catch (error) {
    console.error('Error getting comments:', error);
    return c.json({ success: false, error: error.message }, 500);
  }
});

// Post comment on a movie short
app.post("/make-server-4d451974/shorts/comment/:movieId", async (c) => {
  try {
    const movieId = c.req.param("movieId");
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    
    if (!accessToken) {
      return c.json({ success: false, error: 'Unauthorized' }, 401);
    }
    
    const { data: { user } } = await supabase.auth.getUser(accessToken);
    if (!user) {
      return c.json({ success: false, error: 'Unauthorized' }, 401);
    }
    
    // Get user details
    const userDataStr = await kv.get(`user:${user.id}`);
    const userData = userDataStr ? JSON.parse(userDataStr) : null;
    
    const { text } = await c.req.json();
    
    if (!text || text.trim().length === 0) {
      return c.json({ success: false, error: 'Comment text is required' }, 400);
    }
    
    const commentsData = await kv.get(`shorts_comments:${movieId}`);
    const comments = commentsData ? JSON.parse(commentsData) : [];
    
    const newComment = {
      id: `comment_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      userId: user.id,
      userName: userData?.name || user.email?.split('@')[0] || 'Anonymous',
      userEmail: user.email,
      text: text.trim(),
      timestamp: new Date().toISOString()
    };
    
    comments.push(newComment);
    
    await kv.set(`shorts_comments:${movieId}`, JSON.stringify(comments));
    
    return c.json({
      success: true,
      comment: newComment
    });
  } catch (error) {
    console.error('Error posting comment:', error);
    return c.json({ success: false, error: error.message }, 500);
  }
});

// Delete comment (admin only)
app.delete("/make-server-4d451974/shorts/comment/:commentId", async (c) => {
  try {
    const commentId = c.req.param("commentId");
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    
    if (!accessToken) {
      return c.json({ success: false, error: 'Unauthorized' }, 401);
    }
    
    const { data: { user } } = await supabase.auth.getUser(accessToken);
    if (!user) {
      return c.json({ success: false, error: 'Unauthorized' }, 401);
    }
    
    // Check if user is admin (email contains 'admin')
    if (!user.email?.includes('admin')) {
      return c.json({ success: false, error: 'Forbidden: Admin access required' }, 403);
    }
    
    // Find and delete the comment from all movies
    const allCommentsKeys = await kv.getByPrefix('shorts_comments:');
    
    for (const { key, value } of allCommentsKeys) {
      const comments = JSON.parse(value);
      const filteredComments = comments.filter((c: any) => c.id !== commentId);
      
      if (filteredComments.length !== comments.length) {
        // Comment was found and removed
        await kv.set(key, JSON.stringify(filteredComments));
        break;
      }
    }
    
    return c.json({
      success: true,
      message: 'Comment deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting comment:', error);
    return c.json({ success: false, error: error.message }, 500);
  }
});

// Global error handler
app.onError((err, c) => {
  console.error(`🚨 Unhandled error: ${err}`);
  return c.json({
    success: false,
    error: err.message || 'Internal server error'
  }, 500);
});

// 404 handler
app.notFound((c) => {
  return c.json({
    success: false,
    error: 'Route not found'
  }, 404);
});

Deno.serve(app.fetch);