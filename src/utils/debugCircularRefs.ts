/**
 * Debugging utilities to track down circular references in objects
 * Use these functions to find which objects are causing "Converting circular structure to JSON" errors
 */

/**
 * Safely stringify an object, detecting circular references
 * Returns the string if successful, or an error message with details
 */
export function safeStringify(obj: any, label: string = 'Object'): { success: boolean; result?: string; error?: string; circularPath?: string[] } {
  const seen = new WeakSet();
  const path: string[] = [];
  
  try {
    const result = JSON.stringify(obj, (key, value) => {
      if (typeof value === 'object' && value !== null) {
        // Detect circular reference
        if (seen.has(value)) {
          const circularPath = [...path, key];
          console.error(`🔴 CIRCULAR REFERENCE DETECTED at:`, circularPath.join(' → '));
          return '[Circular Reference]';
        }
        seen.add(value);
        path.push(key);
      }
      return value;
    });
    
    return { success: true, result };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : String(error),
      circularPath: path
    };
  }
}

/**
 * Find all circular references in an object
 * Returns an array of paths to circular references
 */
export function findCircularReferences(obj: any, maxDepth: number = 10): string[] {
  const circularPaths: string[] = [];
  const seen = new Map<any, string>();
  
  function traverse(current: any, path: string, depth: number = 0) {
    if (depth > maxDepth) {
      console.warn(`⚠️ Max depth ${maxDepth} reached at path: ${path}`);
      return;
    }
    
    if (current === null || current === undefined) {
      return;
    }
    
    if (typeof current === 'object') {
      // Check if we've seen this object before
      if (seen.has(current)) {
        const originalPath = seen.get(current)!;
        const circularPath = `${path} → CIRCULAR BACK TO → ${originalPath}`;
        circularPaths.push(circularPath);
        console.error(`🔴 CIRCULAR: ${circularPath}`);
        return;
      }
      
      // Mark this object as seen
      seen.set(current, path);
      
      // Special handling for HTMLElements and DOM nodes
      if (current instanceof Element || current instanceof Node) {
        console.warn(`⚠️ DOM Node found at: ${path} (type: ${current.constructor.name})`);
        return;
      }
      
      // Special handling for React Fiber nodes
      if (current._reactInternals || current._reactInternalFiber) {
        console.warn(`⚠️ React Fiber found at: ${path}`);
        return;
      }
      
      // Traverse object properties
      try {
        for (const key in current) {
          if (Object.prototype.hasOwnProperty.call(current, key)) {
            const newPath = path ? `${path}.${key}` : key;
            traverse(current[key], newPath, depth + 1);
          }
        }
      } catch (error) {
        console.error(`❌ Error traversing ${path}:`, error);
      }
    }
  }
  
  traverse(obj, 'root');
  return circularPaths;
}

/**
 * Deep clone an object, removing circular references and DOM elements
 * Returns a clean object that can be safely stringified
 */
export function cleanDeep(obj: any, maxDepth: number = 10): any {
  const seen = new WeakSet();
  
  function clean(current: any, depth: number = 0): any {
    if (depth > maxDepth) {
      console.warn(`⚠️ Max depth ${maxDepth} reached, truncating`);
      return '[Max Depth Reached]';
    }
    
    // Handle primitives
    if (current === null || current === undefined) {
      return current;
    }
    
    if (typeof current !== 'object') {
      return current;
    }
    
    // Detect circular reference
    if (seen.has(current)) {
      return '[Circular Reference Removed]';
    }
    
    // Filter out DOM elements and React internals
    if (current instanceof Element || current instanceof Node) {
      return '[DOM Element Removed]';
    }
    
    if (current instanceof HTMLVideoElement) {
      return '[HTMLVideoElement Removed]';
    }
    
    if (current._reactInternals || current._reactInternalFiber) {
      return '[React Fiber Removed]';
    }
    
    // Mark as seen
    seen.add(current);
    
    // Handle arrays
    if (Array.isArray(current)) {
      return current.map(item => clean(item, depth + 1));
    }
    
    // Handle objects
    const cleaned: any = {};
    try {
      for (const key in current) {
        if (Object.prototype.hasOwnProperty.call(current, key)) {
          // Skip function properties
          if (typeof current[key] === 'function') {
            continue;
          }
          cleaned[key] = clean(current[key], depth + 1);
        }
      }
    } catch (error) {
      console.error(`❌ Error cleaning object:`, error);
      return '[Cleaning Error]';
    }
    
    return cleaned;
  }
  
  return clean(obj);
}

/**
 * Test if an object can be safely stringified
 * Logs detailed error information if it fails
 */
export function testStringify(obj: any, label: string = 'Object'): boolean {
  console.log(`\n🧪 Testing JSON.stringify for: ${label}`);
  console.log(`📊 Type:`, typeof obj);
  
  if (typeof obj === 'object' && obj !== null) {
    console.log(`🔑 Keys (first 20):`, Object.keys(obj).slice(0, 20));
  }
  
  const result = safeStringify(obj, label);
  
  if (result.success) {
    console.log(`✅ ${label} can be safely stringified`);
    console.log(`📏 Size: ${result.result?.length || 0} characters`);
    return true;
  } else {
    console.error(`❌ ${label} CANNOT be stringified!`);
    console.error(`🚨 Error:`, result.error);
    console.error(`📍 Circular path:`, result.circularPath);
    
    // Find all circular references
    console.log(`\n🔍 Searching for all circular references...`);
    const circularPaths = findCircularReferences(obj);
    
    if (circularPaths.length > 0) {
      console.error(`\n🔴 Found ${circularPaths.length} circular reference(s):`);
      circularPaths.forEach((path, index) => {
        console.error(`  ${index + 1}. ${path}`);
      });
    }
    
    return false;
  }
}

/**
 * Monitor localStorage operations for circular reference errors
 * Call this at app startup to wrap localStorage.setItem
 */
export function monitorLocalStorage() {
  const originalSetItem = localStorage.setItem.bind(localStorage);
  
  localStorage.setItem = function(key: string, value: string) {
    try {
      // Test if the value is valid JSON
      JSON.parse(value);
      originalSetItem(key, value);
    } catch (error) {
      console.error(`\n🚨🚨🚨 localStorage.setItem ERROR 🚨🚨🚨`);
      console.error(`🔑 Key: "${key}"`);
      console.error(`❌ Error:`, error);
      console.error(`📦 Value length:`, value?.length || 0);
      console.error(`📦 Value preview:`, value?.substring(0, 200));
      console.trace(`📍 Stack trace:`);
      throw error;
    }
  };
  
  console.log('✅ localStorage monitoring enabled');
}
