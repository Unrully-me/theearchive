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
    allowHeaders: ["Content-Type", "Authorization"],
    allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    exposeHeaders: ["Content-Length"],
    maxAge: 600,
  }),
);

// Health check endpoint
app.get("/health", (c) => {
  return c.json({ status: "ok" });
});

// Get all movies
app.get("/movies", async (c) => {
  try {
    console.log("Fetching movies from database...");
    const moviesData = await kv.getByPrefix("movie:");
    console.log("Raw data from getByPrefix:", JSON.stringify(moviesData));
    
    // getByPrefix returns an array of objects with key and value
    // We need to extract just the values
    const movies = Array.isArray(moviesData) ? moviesData.map(item => item.value || item) : [];
    
    console.log("Processed movies:", JSON.stringify(movies));
    return c.json({ success: true, movies });
  } catch (error) {
    console.log(`Error fetching movies: ${error}`);
    return c.json({ success: false, error: String(error), movies: [] }, 500);
  }
});

// Get single movie by ID
app.get("/movies/:id", async (c) => {
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
app.post("/movies", async (c) => {
  try {
    const body = await c.req.json();
    const { title, description, videoUrl, thumbnailUrl, genre, year, type, fileSize } = body;

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
      createdAt: new Date().toISOString(),
    };

    await kv.set(`movie:${id}`, movie);
    return c.json({ success: true, movie });
  } catch (error) {
    console.log(`Error adding movie: ${error}`);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

// Update movie
app.put("/movies/:id", async (c) => {
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
app.delete("/movies/:id", async (c) => {
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
app.post("/signup", async (c) => {
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
app.post("/signin", async (c) => {
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

// Check Auth (verify token and get user)
app.get("/auth/me", async (c) => {
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
app.get("/admin/users", async (c) => {
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
app.post("/admin/users/:id/block", async (c) => {
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
app.post("/admin/users/:id/unblock", async (c) => {
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
app.get("/admin/background", async (c) => {
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
app.post("/admin/background", async (c) => {
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

Deno.serve(app.fetch);
