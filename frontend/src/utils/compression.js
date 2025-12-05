// Data compression utilities for QR code sync

/**
 * Compresses a string using LZ-based compression
 * Uses a simple implementation that works in browsers
 */
export const compressData = (data) => {
  try {
    // Simple LZ-style compression using repeated pattern replacement
    const jsonString = typeof data === 'string' ? data : JSON.stringify(data);
    
    // Convert to Uint8Array
    const encoder = new TextEncoder();
    const encoded = encoder.encode(jsonString);
    
    // Use built-in compression if available (Chrome 80+, Firefox 113+)
    if (typeof CompressionStream !== 'undefined') {
      return compressWithStream(encoded);
    }
    
    // Fallback: simple base64 with minimal overhead
    return btoa(String.fromCharCode(...encoded));
  } catch (error) {
    console.error('Compression error:', error);
    return null;
  }
};

/**
 * Decompresses data compressed by compressData
 */
export const decompressData = (compressed) => {
  try {
    if (!compressed) return null;
    
    // Try to detect if it was stream-compressed
    if (compressed.startsWith('STREAM:')) {
      return decompressWithStream(compressed.substring(7));
    }
    
    // Fallback: simple base64 decode
    const decoded = atob(compressed);
    const bytes = new Uint8Array(decoded.length);
    for (let i = 0; i < decoded.length; i++) {
      bytes[i] = decoded.charCodeAt(i);
    }
    const decoder = new TextDecoder();
    return decoder.decode(bytes);
  } catch (error) {
    console.error('Decompression error:', error);
    return null;
  }
};

// Stream-based compression using CompressionStream API
const compressWithStream = async (data) => {
  try {
    const stream = new Blob([data]).stream();
    const compressedStream = stream.pipeThrough(new CompressionStream('gzip'));
    const chunks = [];
    const reader = compressedStream.getReader();
    
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      chunks.push(value);
    }
    
    const compressed = new Uint8Array(chunks.reduce((acc, chunk) => acc + chunk.length, 0));
    let offset = 0;
    for (const chunk of chunks) {
      compressed.set(chunk, offset);
      offset += chunk.length;
    }
    
    return 'STREAM:' + btoa(String.fromCharCode(...compressed));
  } catch (error) {
    console.error('Stream compression error:', error);
    // Fallback to simple base64
    return btoa(String.fromCharCode(...data));
  }
};

const decompressWithStream = async (compressed) => {
  try {
    const decoded = atob(compressed);
    const bytes = new Uint8Array(decoded.length);
    for (let i = 0; i < decoded.length; i++) {
      bytes[i] = decoded.charCodeAt(i);
    }
    
    const stream = new Blob([bytes]).stream();
    const decompressedStream = stream.pipeThrough(new DecompressionStream('gzip'));
    const chunks = [];
    const reader = decompressedStream.getReader();
    
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      chunks.push(value);
    }
    
    const decompressed = new Uint8Array(chunks.reduce((acc, chunk) => acc + chunk.length, 0));
    let offset = 0;
    for (const chunk of chunks) {
      decompressed.set(chunk, offset);
      offset += chunk.length;
    }
    
    const decoder = new TextDecoder();
    return decoder.decode(decompressed);
  } catch (error) {
    console.error('Stream decompression error:', error);
    return null;
  }
};

/**
 * Creates minimal sync data payload (only essential fields)
 */
export const createMinimalSyncData = (tools) => {
  if (!tools || !Array.isArray(tools)) return [];
  
  return tools.map(tool => ({
    t: tool.title,           // title
    u: tool.url,             // url
    c: tool.category_id,     // category
    f: tool.favicon,         // favicon
    d: tool.description,     // description (truncated)
    g: tool.tags,            // tags
    v: tool.favorite ? 1 : 0 // favorite (as 1/0 for smaller size)
  }));
};

/**
 * Expands minimal sync data back to full tool objects
 */
export const expandMinimalSyncData = (minimalTools) => {
  if (!minimalTools || !Array.isArray(minimalTools)) return [];
  
  return minimalTools.map((t, idx) => ({
    id: `tool_${Date.now()}_${idx}_${Math.random().toString(36).substr(2, 5)}`,
    title: t.t,
    url: t.u,
    category_id: t.c,
    favicon: t.f,
    description: t.d,
    tags: t.g || [],
    favorite: t.v === 1,
    click_count: 0,
    date_added: new Date().toISOString(),
    last_used: null
  }));
};

