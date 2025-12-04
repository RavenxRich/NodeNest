#!/usr/bin/env node

/**
 * NodeNest Folder Persistence Test
 * Tests the folder persistence logic described in the review request
 */

const puppeteer = require('puppeteer');

const FRONTEND_URL = 'https://nodenest.preview.emergentagent.com';

class FolderPersistenceTest {
    constructor() {
        this.browser = null;
        this.page = null;
        this.testResults = {
            browserSupport: null,
            initialState: null,
            folderSelection: null,
            persistence: null,
            issues: []
        };
    }

    async setup() {
        console.log('🚀 Setting up test environment...');
        
        try {
            this.browser = await puppeteer.launch({
                headless: false, // Set to true for CI
                args: [
                    '--no-sandbox',
                    '--disable-setuid-sandbox',
                    '--disable-web-security',
                    '--disable-features=VizDisplayCompositor'
                ]
            });
            
            this.page = await this.browser.newPage();
            
            // Enable console logging
            this.page.on('console', msg => {
                const type = msg.type();
                const text = msg.text();
                if (text.includes('📁') || text.includes('✅') || text.includes('❌') || text.includes('⚠️')) {
                    console.log(`[BROWSER ${type.toUpperCase()}] ${text}`);
                }
            });
            
            // Navigate to the app
            console.log(`📱 Navigating to ${FRONTEND_URL}...`);
            await this.page.goto(FRONTEND_URL, { waitUntil: 'networkidle2' });
            
            console.log('✅ Test environment ready');
            return true;
        } catch (error) {
            console.error('❌ Failed to setup test environment:', error);
            return false;
        }
    }

    async testBrowserSupport() {
        console.log('\n🌐 Testing browser support...');
        
        const support = await this.page.evaluate(() => {
            return {
                hasFileSystemAPI: 'showDirectoryPicker' in window,
                isInIframe: window.self !== window.top,
                userAgent: navigator.userAgent
            };
        });
        
        this.testResults.browserSupport = support;
        
        console.log('🔧 File System Access API:', support.hasFileSystemAPI ? '✅ Supported' : '❌ Not supported');
        console.log('🖼️ Running in iframe:', support.isInIframe ? '❌ Yes' : '✅ No');
        
        if (!support.hasFileSystemAPI) {
            this.testResults.issues.push('Browser does not support File System Access API');
        }
        
        if (support.isInIframe) {
            this.testResults.issues.push('Running in iframe prevents folder access');
        }
        
        return support;
    }

    async testInitialState() {
        console.log('\n📋 Testing initial localStorage and IndexedDB state...');
        
        const state = await this.page.evaluate(async () => {
            // Check localStorage
            const localStorage = {
                hasDirectory: localStorage.getItem('nodenest_has_directory'),
                storageMode: localStorage.getItem('nodenest_storage_mode'),
                localStorageType: localStorage.getItem('nodenest_local_storage_type'),
                userId: localStorage.getItem('nodenest_user_id')
            };
            
            // Check IndexedDB
            let indexedDB = { hasHandle: false, error: null };
            try {
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
                
                const tx = db.transaction('handles', 'readonly');
                const request = tx.objectStore('handles').get('directory');
                
                const handle = await new Promise((resolve, reject) => {
                    request.onsuccess = () => resolve(request.result);
                    request.onerror = () => reject(request.error);
                });
                
                if (handle) {
                    const permission = await handle.queryPermission({ mode: 'readwrite' });
                    indexedDB = {
                        hasHandle: true,
                        handleName: handle.name,
                        permission: permission
                    };
                } else {
                    indexedDB = { hasHandle: false };
                }
            } catch (error) {
                indexedDB = { hasHandle: false, error: error.message };
            }
            
            return { localStorage, indexedDB };
        });
        
        this.testResults.initialState = state;
        
        console.log('📁 localStorage.nodenest_has_directory:', state.localStorage.hasDirectory);
        console.log('💾 localStorage.nodenest_storage_mode:', state.localStorage.storageMode);
        console.log('🗄️ IndexedDB has folder handle:', state.indexedDB.hasHandle ? '✅ Yes' : '❌ No');
        
        if (state.indexedDB.hasHandle) {
            console.log('📂 Folder name:', state.indexedDB.handleName);
            console.log('🔐 Permission status:', state.indexedDB.permission);
        }
        
        return state;
    }

    async testLandingPageBehavior() {
        console.log('\n🏠 Testing Landing page behavior...');
        
        // Wait for the page to load and check what's displayed
        await this.page.waitForSelector('[data-testid="get-started-btn"], [data-testid="local-storage-card"]', { timeout: 10000 });
        
        const pageState = await this.page.evaluate(() => {
            const getStartedBtn = document.querySelector('[data-testid="get-started-btn"]');
            const localStorageCard = document.querySelector('[data-testid="local-storage-card"]');
            const cloudStorageCard = document.querySelector('[data-testid="cloud-storage-card"]');
            
            return {
                showsGetStarted: !!getStartedBtn && getStartedBtn.offsetParent !== null,
                showsStorageOptions: !!localStorageCard && localStorageCard.offsetParent !== null,
                url: window.location.href
            };
        });
        
        console.log('🎯 Current URL:', pageState.url);
        console.log('🔘 Shows "Get Started" button:', pageState.showsGetStarted ? '✅ Yes' : '❌ No');
        console.log('📦 Shows storage options:', pageState.showsStorageOptions ? '✅ Yes' : '❌ No');
        
        // Check if user is on dashboard (should be if folder persistence worked)
        const isOnDashboard = pageState.url.includes('/dashboard');
        console.log('📊 On dashboard:', isOnDashboard ? '✅ Yes' : '❌ No');
        
        if (!isOnDashboard && this.testResults.initialState.localStorage.hasDirectory === 'true') {
            this.testResults.issues.push('User has folder flag but is not on dashboard - persistence failed');
        }
        
        return pageState;
    }

    async testFolderSelectionFlow() {
        console.log('\n📁 Testing folder selection flow...');
        
        try {
            // Click "Get Started" if visible
            const getStartedVisible = await this.page.$('[data-testid="get-started-btn"]');
            if (getStartedVisible) {
                console.log('🔘 Clicking "Get Started" button...');
                await this.page.click('[data-testid="get-started-btn"]');
                await this.page.waitForTimeout(1000);
            }
            
            // Wait for storage options to appear
            await this.page.waitForSelector('[data-testid="local-storage-card"]', { timeout: 5000 });
            
            // Click on folder storage option
            console.log('📁 Clicking folder storage option...');
            await this.page.click('[data-testid="local-storage-card"] button');
            
            // Monitor console for debugging messages
            console.log('👂 Monitoring console for folder selection messages...');
            
            // Wait a bit to see what happens
            await this.page.waitForTimeout(3000);
            
            // Check if we're now on dashboard
            const currentUrl = await this.page.url();
            const isOnDashboard = currentUrl.includes('/dashboard');
            
            console.log('🎯 After folder selection - URL:', currentUrl);
            console.log('📊 Successfully navigated to dashboard:', isOnDashboard ? '✅ Yes' : '❌ No');
            
            return { success: isOnDashboard, url: currentUrl };
            
        } catch (error) {
            console.error('❌ Error during folder selection:', error.message);
            this.testResults.issues.push(`Folder selection failed: ${error.message}`);
            return { success: false, error: error.message };
        }
    }

    async testPersistenceAfterReload() {
        console.log('\n🔄 Testing persistence after page reload...');
        
        try {
            // Reload the page
            console.log('🔄 Reloading page...');
            await this.page.reload({ waitUntil: 'networkidle2' });
            
            // Wait a bit for any automatic navigation
            await this.page.waitForTimeout(3000);
            
            // Check where we end up
            const currentUrl = await this.page.url();
            const isOnDashboard = currentUrl.includes('/dashboard');
            const isOnLanding = currentUrl.includes('/') && !currentUrl.includes('/dashboard');
            
            console.log('🎯 After reload - URL:', currentUrl);
            console.log('📊 On dashboard:', isOnDashboard ? '✅ Yes' : '❌ No');
            console.log('🏠 On landing:', isOnLanding ? '✅ Yes' : '❌ No');
            
            if (isOnLanding) {
                // Check if storage options are shown (indicating persistence failed)
                const showsStorageOptions = await this.page.$('[data-testid="local-storage-card"]');
                if (showsStorageOptions) {
                    console.log('❌ User is being asked to select folder again - persistence failed');
                    this.testResults.issues.push('Folder persistence failed - user asked to select folder again after reload');
                }
            }
            
            return { 
                success: isOnDashboard, 
                url: currentUrl,
                persistenceWorked: isOnDashboard
            };
            
        } catch (error) {
            console.error('❌ Error testing persistence:', error.message);
            this.testResults.issues.push(`Persistence test failed: ${error.message}`);
            return { success: false, error: error.message };
        }
    }

    async runFullTest() {
        console.log('🧪 Starting NodeNest Folder Persistence Test');
        console.log('='.repeat(60));
        
        if (!(await this.setup())) {
            return false;
        }
        
        try {
            // Test 1: Browser support
            await this.testBrowserSupport();
            
            // Test 2: Initial state
            await this.testInitialState();
            
            // Test 3: Landing page behavior
            await this.testLandingPageBehavior();
            
            // Test 4: Folder selection (if needed)
            const currentUrl = await this.page.url();
            if (!currentUrl.includes('/dashboard')) {
                await this.testFolderSelectionFlow();
            }
            
            // Test 5: Persistence after reload
            await this.testPersistenceAfterReload();
            
            // Generate report
            this.generateReport();
            
            return true;
            
        } catch (error) {
            console.error('❌ Test execution failed:', error);
            return false;
        } finally {
            if (this.browser) {
                await this.browser.close();
            }
        }
    }

    generateReport() {
        console.log('\n📊 TEST REPORT');
        console.log('='.repeat(50));
        
        if (this.testResults.issues.length === 0) {
            console.log('🟢 All tests passed - folder persistence should be working');
        } else {
            console.log('🔴 Issues found:');
            this.testResults.issues.forEach((issue, index) => {
                console.log(`   ${index + 1}. ${issue}`);
            });
        }
        
        console.log('\n📋 Detailed Results:');
        console.log('Browser Support:', this.testResults.browserSupport?.hasFileSystemAPI ? '✅' : '❌');
        console.log('Initial State:', this.testResults.initialState ? '✅ Checked' : '❌ Failed');
        console.log('Issues Count:', this.testResults.issues.length);
        
        // Recommendations
        console.log('\n💡 Recommendations:');
        if (this.testResults.issues.includes('Browser does not support File System Access API')) {
            console.log('   - Use Chrome, Edge, or Brave browser');
        }
        if (this.testResults.issues.includes('Running in iframe prevents folder access')) {
            console.log('   - Open app in new tab (not in preview iframe)');
        }
        if (this.testResults.issues.some(issue => issue.includes('persistence failed'))) {
            console.log('   - Check Landing.js checkExistingStorage function (lines 32-116)');
            console.log('   - Verify IndexedDB handle storage in StorageContext.js');
            console.log('   - Check browser console for permission errors');
        }
    }
}

// Run the test
if (require.main === module) {
    const test = new FolderPersistenceTest();
    test.runFullTest().then(success => {
        process.exit(success ? 0 : 1);
    });
}

module.exports = FolderPersistenceTest;