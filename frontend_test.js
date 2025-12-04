// NodeNest Folder Persistence Test
// This test examines the folder persistence logic issue

const FRONTEND_URL = 'https://nodenest.preview.emergentagent.com';

console.log('🧪 Starting NodeNest Folder Persistence Test');
console.log('Frontend URL:', FRONTEND_URL);

// Test 1: Check localStorage state
function testLocalStorageState() {
    console.log('\n📋 TEST 1: LocalStorage State Check');
    console.log('='.repeat(50));
    
    const hasDirectory = localStorage.getItem('nodenest_has_directory');
    const storageMode = localStorage.getItem('nodenest_storage_mode');
    const localStorageType = localStorage.getItem('nodenest_local_storage_type');
    const userId = localStorage.getItem('nodenest_user_id');
    
    console.log('📁 nodenest_has_directory:', hasDirectory);
    console.log('💾 nodenest_storage_mode:', storageMode);
    console.log('🔧 nodenest_local_storage_type:', localStorageType);
    console.log('👤 nodenest_user_id:', userId);
    
    return {
        hasDirectory: hasDirectory === 'true',
        storageMode,
        localStorageType,
        userId
    };
}

// Test 2: Check IndexedDB state
async function testIndexedDBState() {
    console.log('\n🗄️ TEST 2: IndexedDB State Check');
    console.log('='.repeat(50));
    
    try {
        // Open IndexedDB
        const db = await new Promise((resolve, reject) => {
            const request = indexedDB.open('NodeNestDB', 1);
            request.onerror = () => {
                console.error('❌ Failed to open IndexedDB:', request.error);
                reject(request.error);
            };
            request.onsuccess = () => {
                console.log('✅ IndexedDB opened successfully');
                resolve(request.result);
            };
            request.onupgradeneeded = (event) => {
                console.log('🔧 IndexedDB upgrade needed');
                const db = event.target.result;
                if (!db.objectStoreNames.contains('handles')) {
                    db.createObjectStore('handles');
                    console.log('📁 Created handles object store');
                }
            };
        });
        
        // Check for directory handle
        const tx = db.transaction('handles', 'readonly');
        const store = tx.objectStore('handles');
        const request = store.get('directory');
        
        const handle = await new Promise((resolve, reject) => {
            request.onsuccess = () => {
                console.log('✅ IndexedDB query successful');
                resolve(request.result);
            };
            request.onerror = () => {
                console.error('❌ IndexedDB query failed:', request.error);
                reject(request.error);
            };
        });
        
        if (handle) {
            console.log('✅ Found directory handle in IndexedDB');
            console.log('📂 Handle name:', handle.name);
            console.log('📂 Handle kind:', handle.kind);
            
            // Test permission status
            try {
                const permission = await handle.queryPermission({ mode: 'readwrite' });
                console.log('🔐 Current permission status:', permission);
                
                if (permission === 'granted') {
                    console.log('✅ Permission already granted');
                } else if (permission === 'prompt') {
                    console.log('⚠️ Permission needs to be requested');
                } else {
                    console.log('❌ Permission denied');
                }
                
                return {
                    hasHandle: true,
                    handleName: handle.name,
                    permission,
                    handle
                };
            } catch (permError) {
                console.error('❌ Error checking permission:', permError);
                return {
                    hasHandle: true,
                    handleName: handle.name,
                    permission: 'error',
                    error: permError.message
                };
            }
        } else {
            console.log('❌ No directory handle found in IndexedDB');
            return {
                hasHandle: false
            };
        }
        
    } catch (error) {
        console.error('❌ IndexedDB test failed:', error);
        return {
            hasHandle: false,
            error: error.message
        };
    }
}

// Test 3: Simulate Landing page logic
async function testLandingPageLogic() {
    console.log('\n🏠 TEST 3: Landing Page Logic Simulation');
    console.log('='.repeat(50));
    
    const localStorageState = testLocalStorageState();
    const indexedDBState = await testIndexedDBState();
    
    console.log('\n🔍 Analyzing Landing Page Flow:');
    
    // Check the conditions from Landing.js line 52
    const storageMode = localStorageState.storageMode;
    const hasDirectory = localStorageState.hasDirectory;
    
    console.log(`📊 storageMode: "${storageMode}"`);
    console.log(`📁 hasDirectory: ${hasDirectory}`);
    
    // Condition: storageMode === 'local' || (!storageMode && hasDirectory === 'true')
    const shouldCheckFolder = storageMode === 'local' || (!storageMode && hasDirectory);
    console.log(`🎯 Should check folder: ${shouldCheckFolder}`);
    
    if (shouldCheckFolder) {
        console.log('✅ Landing page SHOULD attempt folder restoration');
        
        if (indexedDBState.hasHandle) {
            console.log('✅ IndexedDB has folder handle');
            console.log(`🔐 Permission status: ${indexedDBState.permission}`);
            
            if (indexedDBState.permission === 'granted') {
                console.log('✅ Should navigate to dashboard automatically');
                console.log('🎯 EXPECTED: User should NOT see folder picker');
            } else if (indexedDBState.permission === 'prompt') {
                console.log('⚠️ Should request permission and then navigate');
                console.log('🎯 EXPECTED: Browser permission dialog, then dashboard');
            } else {
                console.log('❌ Permission denied - should clear state');
                console.log('🎯 EXPECTED: User sees folder picker again');
            }
        } else {
            console.log('❌ No folder handle in IndexedDB');
            console.log('🎯 EXPECTED: User sees folder picker');
        }
    } else {
        console.log('❌ Landing page will NOT attempt folder restoration');
        console.log('🎯 EXPECTED: User sees storage options');
    }
    
    return {
        shouldCheckFolder,
        localStorageState,
        indexedDBState
    };
}

// Test 4: Browser compatibility check
function testBrowserCompatibility() {
    console.log('\n🌐 TEST 4: Browser Compatibility Check');
    console.log('='.repeat(50));
    
    const hasFileSystemAPI = 'showDirectoryPicker' in window;
    const isInIframe = window.self !== window.top;
    const userAgent = navigator.userAgent;
    
    console.log('🔧 File System Access API available:', hasFileSystemAPI);
    console.log('🖼️ Running in iframe:', isInIframe);
    console.log('🌐 User Agent:', userAgent);
    
    if (!hasFileSystemAPI) {
        console.log('❌ Browser does not support File System Access API');
        console.log('💡 Supported browsers: Chrome, Edge, Brave (Chromium-based)');
    }
    
    if (isInIframe) {
        console.log('❌ Running in iframe - folder storage will not work');
        console.log('💡 Need to open in new tab for folder storage');
    }
    
    return {
        hasFileSystemAPI,
        isInIframe,
        userAgent
    };
}

// Main test execution
async function runAllTests() {
    console.log('🚀 NodeNest Folder Persistence Diagnostic Test');
    console.log('='.repeat(60));
    
    const browserCompat = testBrowserCompatibility();
    const landingLogic = await testLandingPageLogic();
    
    console.log('\n📊 SUMMARY REPORT');
    console.log('='.repeat(50));
    
    // Determine the likely issue
    if (!browserCompat.hasFileSystemAPI) {
        console.log('🔴 ISSUE: Browser does not support File System Access API');
        console.log('💡 SOLUTION: Use Chrome, Edge, or Brave browser');
    } else if (browserCompat.isInIframe) {
        console.log('🔴 ISSUE: Running in iframe prevents folder access');
        console.log('💡 SOLUTION: Open app in new tab');
    } else if (!landingLogic.localStorageState.hasDirectory) {
        console.log('🔴 ISSUE: No hasDirectory flag in localStorage');
        console.log('💡 CAUSE: User never successfully selected a folder');
    } else if (!landingLogic.indexedDBState.hasHandle) {
        console.log('🔴 ISSUE: No folder handle stored in IndexedDB');
        console.log('💡 CAUSE: Folder handle was not saved or was cleared');
    } else if (landingLogic.indexedDBState.permission === 'denied') {
        console.log('🔴 ISSUE: Folder permission was denied');
        console.log('💡 CAUSE: User denied permission or browser blocked access');
    } else if (landingLogic.indexedDBState.permission === 'prompt') {
        console.log('🟡 ISSUE: Permission needs to be requested');
        console.log('💡 CAUSE: Browser requires fresh permission request');
    } else if (!landingLogic.shouldCheckFolder) {
        console.log('🔴 ISSUE: Landing page logic not triggering folder check');
        console.log('💡 CAUSE: Storage mode or hasDirectory flag incorrect');
    } else {
        console.log('🟢 All checks passed - folder persistence should work');
        console.log('💡 If still not working, check browser console for errors');
    }
    
    return {
        browserCompat,
        landingLogic
    };
}

// Export for use in browser console
if (typeof window !== 'undefined') {
    window.NodeNestTest = {
        runAllTests,
        testLocalStorageState,
        testIndexedDBState,
        testLandingPageLogic,
        testBrowserCompatibility
    };
    
    console.log('🧪 NodeNest test functions available as window.NodeNestTest');
    console.log('💡 Run window.NodeNestTest.runAllTests() to start testing');
}

// Auto-run if in Node.js environment
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        runAllTests,
        testLocalStorageState,
        testIndexedDBState,
        testLandingPageLogic,
        testBrowserCompatibility
    };
}