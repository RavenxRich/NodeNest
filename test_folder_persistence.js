/**
 * NodeNest Folder Persistence Test Script
 * 
 * This script tests the folder persistence logic described in the review request.
 * It can be run in the browser console to diagnose the issue.
 */

class NodeNestFolderPersistenceTest {
    constructor() {
        this.results = {
            browserSupport: null,
            localStorageState: null,
            indexedDBState: null,
            landingPageLogic: null,
            issues: [],
            recommendations: []
        };
    }

    log(message, type = 'info') {
        const prefix = {
            'info': 'ℹ️',
            'success': '✅',
            'error': '❌',
            'warning': '⚠️'
        }[type] || 'ℹ️';
        
        console.log(`${prefix} ${message}`);
    }

    async testBrowserSupport() {
        this.log('Testing browser support...', 'info');
        
        const support = {
            hasFileSystemAPI: 'showDirectoryPicker' in window,
            isInIframe: window.self !== window.top,
            userAgent: navigator.userAgent,
            isChromiumBased: /Chrome|Chromium|Edge|Brave/.test(navigator.userAgent)
        };
        
        this.results.browserSupport = support;
        
        this.log(`File System Access API: ${support.hasFileSystemAPI ? 'Supported' : 'Not supported'}`, 
                 support.hasFileSystemAPI ? 'success' : 'error');
        this.log(`Running in iframe: ${support.isInIframe ? 'Yes (problematic)' : 'No (good)'}`, 
                 support.isInIframe ? 'error' : 'success');
        this.log(`Chromium-based browser: ${support.isChromiumBased ? 'Yes' : 'No'}`, 
                 support.isChromiumBased ? 'success' : 'warning');
        
        if (!support.hasFileSystemAPI) {
            this.results.issues.push('Browser does not support File System Access API');
            this.results.recommendations.push('Use Chrome, Edge, or Brave browser');
        }
        
        if (support.isInIframe) {
            this.results.issues.push('Running in iframe prevents folder access');
            this.results.recommendations.push('Open app in new tab (right-click → "Open in New Tab")');
        }
        
        return support;
    }

    async testLocalStorageState() {
        this.log('Checking localStorage state...', 'info');
        
        const state = {
            hasDirectory: localStorage.getItem('nodenest_has_directory'),
            storageMode: localStorage.getItem('nodenest_storage_mode'),
            localStorageType: localStorage.getItem('nodenest_local_storage_type'),
            userId: localStorage.getItem('nodenest_user_id')
        };
        
        this.results.localStorageState = state;
        
        this.log(`nodenest_has_directory: "${state.hasDirectory}"`, 
                 state.hasDirectory === 'true' ? 'success' : 'info');
        this.log(`nodenest_storage_mode: "${state.storageMode}"`, 
                 state.storageMode === 'local' ? 'success' : 'info');
        this.log(`nodenest_local_storage_type: "${state.localStorageType}"`, 
                 state.localStorageType === 'filesystem' ? 'success' : 'info');
        this.log(`nodenest_user_id: "${state.userId}"`, 
                 state.userId ? 'success' : 'info');
        
        return state;
    }

    async testIndexedDBState() {
        this.log('Checking IndexedDB state...', 'info');
        
        try {
            // Open IndexedDB
            const db = await new Promise((resolve, reject) => {
                const request = indexedDB.open('NodeNestDB', 1);
                request.onerror = () => reject(request.error);
                request.onsuccess = () => resolve(request.result);
                request.onupgradeneeded = (event) => {
                    const db = event.target.result;
                    if (!db.objectStoreNames.contains('handles')) {
                        db.createObjectStore('handles');
                    }
                };
            });
            
            this.log('IndexedDB opened successfully', 'success');
            
            // Check for directory handle
            const tx = db.transaction('handles', 'readonly');
            const store = tx.objectStore('handles');
            const request = store.get('directory');
            
            const handle = await new Promise((resolve, reject) => {
                request.onsuccess = () => resolve(request.result);
                request.onerror = () => reject(request.error);
            });
            
            if (handle) {
                this.log(`Found directory handle: "${handle.name}"`, 'success');
                
                // Test permission status
                try {
                    const permission = await handle.queryPermission({ mode: 'readwrite' });
                    this.log(`Permission status: "${permission}"`, 
                             permission === 'granted' ? 'success' : 'warning');
                    
                    const state = {
                        hasHandle: true,
                        handleName: handle.name,
                        handleKind: handle.kind,
                        permission: permission,
                        handle: handle
                    };
                    
                    this.results.indexedDBState = state;
                    
                    if (permission === 'granted') {
                        this.log('Permission already granted - should auto-navigate to dashboard', 'success');
                    } else if (permission === 'prompt') {
                        this.log('Permission needs to be requested - browser should show dialog', 'warning');
                    } else {
                        this.log('Permission denied - user will need to select folder again', 'error');
                        this.results.issues.push('Folder permission was denied');
                    }
                    
                    return state;
                } catch (permError) {
                    this.log(`Error checking permission: ${permError.message}`, 'error');
                    this.results.issues.push(`Permission check failed: ${permError.message}`);
                    return {
                        hasHandle: true,
                        handleName: handle.name,
                        permission: 'error',
                        error: permError.message
                    };
                }
            } else {
                this.log('No directory handle found in IndexedDB', 'error');
                this.results.indexedDBState = { hasHandle: false };
                this.results.issues.push('No folder handle stored in IndexedDB');
                return { hasHandle: false };
            }
            
        } catch (error) {
            this.log(`IndexedDB test failed: ${error.message}`, 'error');
            this.results.indexedDBState = { hasHandle: false, error: error.message };
            this.results.issues.push(`IndexedDB access failed: ${error.message}`);
            return { hasHandle: false, error: error.message };
        }
    }

    async analyzeLandingPageLogic() {
        this.log('Analyzing Landing page logic...', 'info');
        
        const localStorage = this.results.localStorageState;
        const indexedDB = this.results.indexedDBState;
        
        // Replicate the Landing.js logic (line 52)
        const storageMode = localStorage.storageMode;
        const hasDirectory = localStorage.hasDirectory === 'true';
        
        this.log(`Current storageMode: "${storageMode}"`, 'info');
        this.log(`hasDirectory flag: ${hasDirectory}`, 'info');
        
        // Check the condition from Landing.js line 52:
        // storageMode === 'local' || (!storageMode && hasDirectory === 'true')
        const shouldCheckFolder = storageMode === 'local' || (!storageMode && hasDirectory);
        
        this.log(`Should check folder: ${shouldCheckFolder}`, shouldCheckFolder ? 'success' : 'warning');
        
        const logic = {
            storageMode,
            hasDirectory,
            shouldCheckFolder,
            expectedBehavior: null
        };
        
        if (shouldCheckFolder) {
            this.log('Landing page SHOULD attempt folder restoration', 'success');
            
            if (indexedDB && indexedDB.hasHandle) {
                this.log('IndexedDB has folder handle', 'success');
                
                if (indexedDB.permission === 'granted') {
                    logic.expectedBehavior = 'auto-navigate-to-dashboard';
                    this.log('EXPECTED: Auto-navigate to dashboard (no folder picker)', 'success');
                } else if (indexedDB.permission === 'prompt') {
                    logic.expectedBehavior = 'request-permission-then-navigate';
                    this.log('EXPECTED: Show permission dialog, then navigate to dashboard', 'warning');
                } else {
                    logic.expectedBehavior = 'clear-state-show-picker';
                    this.log('EXPECTED: Clear state and show folder picker', 'error');
                }
            } else {
                logic.expectedBehavior = 'show-folder-picker';
                this.log('EXPECTED: Show folder picker (no handle found)', 'error');
            }
        } else {
            logic.expectedBehavior = 'show-storage-options';
            this.log('Landing page will NOT attempt folder restoration', 'error');
            this.log('EXPECTED: Show storage options (Get Started button)', 'info');
            
            if (hasDirectory && !storageMode) {
                this.results.issues.push('hasDirectory flag is true but storageMode is not set');
                this.results.recommendations.push('Check why storageMode was cleared but hasDirectory flag remains');
            }
        }
        
        this.results.landingPageLogic = logic;
        return logic;
    }

    async testCurrentPageState() {
        this.log('Checking current page state...', 'info');
        
        const currentUrl = window.location.href;
        const isOnDashboard = currentUrl.includes('/dashboard');
        const isOnLanding = currentUrl === window.location.origin + '/' || 
                           currentUrl === window.location.origin + '/NodeNest' ||
                           currentUrl === window.location.origin + '/NodeNest/';
        
        this.log(`Current URL: ${currentUrl}`, 'info');
        this.log(`On dashboard: ${isOnDashboard}`, isOnDashboard ? 'success' : 'info');
        this.log(`On landing: ${isOnLanding}`, isOnLanding ? 'info' : 'success');
        
        // Check what's visible on the page
        const getStartedBtn = document.querySelector('[data-testid="get-started-btn"]');
        const localStorageCard = document.querySelector('[data-testid="local-storage-card"]');
        const cloudStorageCard = document.querySelector('[data-testid="cloud-storage-card"]');
        
        const pageElements = {
            showsGetStarted: getStartedBtn && getStartedBtn.offsetParent !== null,
            showsStorageOptions: localStorageCard && localStorageCard.offsetParent !== null,
            showsCloudOption: cloudStorageCard && cloudStorageCard.offsetParent !== null
        };
        
        this.log(`Shows "Get Started" button: ${pageElements.showsGetStarted}`, 'info');
        this.log(`Shows storage options: ${pageElements.showsStorageOptions}`, 'info');
        
        // Analyze if current state matches expected behavior
        const logic = this.results.landingPageLogic;
        if (logic && logic.expectedBehavior) {
            if (logic.expectedBehavior === 'auto-navigate-to-dashboard' && !isOnDashboard) {
                this.results.issues.push('Should have auto-navigated to dashboard but still on landing page');
                this.results.recommendations.push('Check Landing.js checkExistingStorage function execution');
            } else if (logic.expectedBehavior === 'show-storage-options' && !pageElements.showsStorageOptions) {
                this.results.issues.push('Should show storage options but they are not visible');
            }
        }
        
        return {
            currentUrl,
            isOnDashboard,
            isOnLanding,
            ...pageElements
        };
    }

    async simulateFolderSelection() {
        this.log('Simulating folder selection process...', 'info');
        
        if (!this.results.browserSupport.hasFileSystemAPI) {
            this.log('Cannot simulate - File System Access API not supported', 'error');
            return false;
        }
        
        if (this.results.browserSupport.isInIframe) {
            this.log('Cannot simulate - running in iframe', 'error');
            return false;
        }
        
        try {
            this.log('Requesting directory picker...', 'info');
            const handle = await window.showDirectoryPicker({
                mode: 'readwrite',
                startIn: 'documents'
            });
            
            this.log(`Folder selected: "${handle.name}"`, 'success');
            
            // Store in IndexedDB (simulate StorageContext.js logic)
            const db = await new Promise((resolve, reject) => {
                const request = indexedDB.open('NodeNestDB', 1);
                request.onerror = () => reject(request.error);
                request.onsuccess = () => resolve(request.result);
                request.onupgradeneeded = (event) => {
                    const db = event.target.result;
                    if (!db.objectStoreNames.contains('handles')) {
                        db.createObjectStore('handles');
                    }
                };
            });
            
            const tx = db.transaction('handles', 'readwrite');
            tx.objectStore('handles').put(handle, 'directory');
            
            await new Promise((resolve, reject) => {
                tx.oncomplete = () => resolve();
                tx.onerror = () => reject(tx.error);
            });
            
            // Set localStorage flags
            localStorage.setItem('nodenest_has_directory', 'true');
            localStorage.setItem('nodenest_storage_mode', 'local');
            localStorage.setItem('nodenest_local_storage_type', 'filesystem');
            localStorage.setItem('nodenest_user_id', 'local_user');
            
            this.log('Folder handle stored successfully', 'success');
            this.log('localStorage flags set', 'success');
            
            return true;
        } catch (error) {
            this.log(`Folder selection failed: ${error.message}`, 'error');
            return false;
        }
    }

    clearAllData() {
        this.log('Clearing all NodeNest data...', 'info');
        
        // Clear localStorage
        const keys = ['nodenest_has_directory', 'nodenest_storage_mode', 'nodenest_local_storage_type', 'nodenest_user_id'];
        keys.forEach(key => {
            if (localStorage.getItem(key)) {
                localStorage.removeItem(key);
                this.log(`Removed localStorage: ${key}`, 'info');
            }
        });
        
        // Clear IndexedDB
        indexedDB.deleteDatabase('NodeNestDB');
        this.log('Cleared IndexedDB: NodeNestDB', 'info');
        
        this.log('All data cleared', 'success');
    }

    generateReport() {
        console.log('\n' + '='.repeat(60));
        console.log('📊 NODENEST FOLDER PERSISTENCE TEST REPORT');
        console.log('='.repeat(60));
        
        if (this.results.issues.length === 0) {
            this.log('All tests passed - folder persistence should be working', 'success');
        } else {
            this.log(`Found ${this.results.issues.length} issue(s):`, 'error');
            this.results.issues.forEach((issue, index) => {
                console.log(`   ${index + 1}. ${issue}`);
            });
        }
        
        if (this.results.recommendations.length > 0) {
            console.log('\n💡 Recommendations:');
            this.results.recommendations.forEach((rec, index) => {
                console.log(`   ${index + 1}. ${rec}`);
            });
        }
        
        console.log('\n🔍 Code Inspection Points:');
        console.log('   - Landing.js lines 32-116 (checkExistingStorage function)');
        console.log('   - StorageContext.js lines 56-115 (folder handle storage)');
        console.log('   - Look for console messages with 📁, ✅, ❌, 📝, 🔄 emojis');
        
        console.log('\n📋 Test Results Summary:');
        console.log(`   Browser Support: ${this.results.browserSupport?.hasFileSystemAPI ? '✅' : '❌'}`);
        console.log(`   Has Directory Flag: ${this.results.localStorageState?.hasDirectory === 'true' ? '✅' : '❌'}`);
        console.log(`   IndexedDB Handle: ${this.results.indexedDBState?.hasHandle ? '✅' : '❌'}`);
        console.log(`   Should Check Folder: ${this.results.landingPageLogic?.shouldCheckFolder ? '✅' : '❌'}`);
        
        return this.results;
    }

    async runFullTest() {
        console.log('🧪 Starting NodeNest Folder Persistence Test...');
        console.log('='.repeat(60));
        
        try {
            await this.testBrowserSupport();
            await this.testLocalStorageState();
            await this.testIndexedDBState();
            await this.analyzeLandingPageLogic();
            await this.testCurrentPageState();
            
            return this.generateReport();
        } catch (error) {
            this.log(`Test execution failed: ${error.message}`, 'error');
            console.error(error);
            return null;
        }
    }
}

// Make available globally for browser console use
if (typeof window !== 'undefined') {
    window.NodeNestTest = new NodeNestFolderPersistenceTest();
    
    // Convenience functions
    window.testNodeNest = () => window.NodeNestTest.runFullTest();
    window.clearNodeNestData = () => window.NodeNestTest.clearAllData();
    window.simulateFolder = () => window.NodeNestTest.simulateFolderSelection();
    
    console.log('🧪 NodeNest Folder Persistence Test loaded!');
    console.log('💡 Available commands:');
    console.log('   - testNodeNest() - Run full diagnostic test');
    console.log('   - clearNodeNestData() - Clear all stored data');
    console.log('   - simulateFolder() - Simulate folder selection');
    console.log('   - window.NodeNestTest - Access full test object');
}

// Export for Node.js if needed
if (typeof module !== 'undefined' && module.exports) {
    module.exports = NodeNestFolderPersistenceTest;
}