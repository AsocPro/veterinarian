const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

// Sample test data for screenshots
const testSnippetData = {
  openFiles: [
    {
      name: 'my-snippets.toml',
      dirty: false,
      parsed: {
        snippets: [
          {
            description: 'Search for files by name',
            command: 'find <path=/home> -name <filename> -type f',
            tag: ['filesystem', 'search'],
            output: ''
          },
          {
            description: 'Git commit with custom message',
            command: 'git add . && git commit -m <message=Initial commit>',
            tag: ['git', 'version-control'],
            output: ''
          },
          {
            description: 'Docker run with environment variables',
            command: 'docker run -e <env_var=NODE_ENV> -p <port=|_3000_||_8080_||_5000_|>:<port> <image=node:latest>',
            tag: ['docker', 'containers'],
            output: ''
          },
          {
            description: 'SSH into remote server',
            command: 'ssh <user=root>@<host> -p <port=22>',
            tag: ['ssh', 'network'],
            output: ''
          },
          {
            description: 'Create compressed archive',
            command: 'tar -czf <archive_name>.tar.gz <directory>',
            tag: ['compression', 'filesystem'],
            output: ''
          }
        ]
      },
      content: '' // Will be generated from parsed
    }
  ],
  selectedFileIndex: 0
};

async function takeScreenshots() {
  console.log('🚀 Starting screenshot generation...\n');

  // Ensure screenshots directory exists (in project root)
  const projectRoot = path.join(__dirname, '..');
  const screenshotsDir = path.join(projectRoot, 'screenshots');
  if (!fs.existsSync(screenshotsDir)) {
    fs.mkdirSync(screenshotsDir, { recursive: true });
    console.log('📁 Created screenshots directory\n');
  }

  const browser = await chromium.launch({
    headless: true
  });

  const context = await browser.newContext({
    viewport: { width: 1600, height: 900 }
  });

  const page = await context.newPage();

  try {
    // Get URL from environment or default to localhost
    const targetUrl = process.env.SCREENSHOT_URL || 'http://localhost:8000';

    // Navigate to the app
    console.log(`📍 Navigating to ${targetUrl}...`);
    await page.goto(targetUrl, { waitUntil: 'networkidle' });

    // Inject test data into localStorage
    console.log('💉 Injecting test data...');
    await page.evaluate((data) => {
      localStorage.setItem('veterinarian-state', JSON.stringify(data));
    }, testSnippetData);

    // Reload to apply the data
    await page.reload({ waitUntil: 'networkidle' });
    await page.waitForTimeout(1000); // Give components time to render

    // Wait for the app to be ready
    await page.waitForSelector('snippet-list', { timeout: 5000 });
    console.log('✅ App loaded successfully\n');

    // Screenshot 1: Main Interface (Light Mode)
    console.log('📸 Taking screenshot 1: main-interface.png');
    await page.screenshot({
      path: path.join(screenshotsDir, 'main-interface.png'),
      fullPage: false
    });
    console.log('   ✅ Saved\n');

    // Screenshot 2: Variables Section Expanded
    console.log('📸 Taking screenshot 2: variables-section.png');

    // Click on the first snippet to select it and expand variables
    const firstSnippet = await page.$('snippet-item');
    if (firstSnippet) {
      // Scroll into view
      await firstSnippet.evaluate(el => el.scrollIntoView({ block: 'center' }));
      await page.waitForTimeout(300);

      // Click the variables toggle to expand (if collapsed)
      const shadowRoot = await firstSnippet.evaluateHandle(el => el.shadowRoot);
      const variablesToggle = await shadowRoot.$('.variables-header');
      if (variablesToggle) {
        await variablesToggle.click();
        await page.waitForTimeout(500);
      }

      // Take screenshot of just the snippet with variables expanded
      await firstSnippet.screenshot({
        path: path.join(screenshotsDir, 'variables-section.png')
      });
      console.log('   ✅ Saved\n');
    }

    // Screenshot 3: Test Dialog
    console.log('📸 Taking screenshot 3: test-dialog.png');

    // Find and click the Test button in the first snippet
    if (firstSnippet) {
      const shadowRoot = await firstSnippet.evaluateHandle(el => el.shadowRoot);
      const testButton = await shadowRoot.$('button[title="Test snippet"]');

      if (testButton) {
        await testButton.click();
        await page.waitForTimeout(800); // Wait for dialog to appear

        // Fill in some test values to make the preview interesting
        const dialog = await page.$('.test-dialog');
        if (dialog) {
          // Try to fill in first input
          const shadowDialog = await dialog.evaluateHandle(el => el.shadowRoot);
          const inputs = await shadowDialog.$$('input');
          if (inputs.length > 0) {
            await inputs[0].fill('/home/user/projects');
            await page.waitForTimeout(200);
          }
          if (inputs.length > 1) {
            await inputs[1].fill('*.js');
            await page.waitForTimeout(200);
          }

          // Screenshot the dialog
          await dialog.screenshot({
            path: path.join(screenshotsDir, 'test-dialog.png')
          });
          console.log('   ✅ Saved\n');

          // Close the dialog
          const closeButton = await shadowDialog.$('button:has-text("Close")');
          if (closeButton) {
            await closeButton.click();
            await page.waitForTimeout(500);
          }
        }
      }
    }

    // Screenshot 4: Dark Mode
    console.log('📸 Taking screenshot 4: dark-mode.png');

    // Find and click the theme toggle in the header
    const themeToggle = await page.$('button[title*="theme"], button[aria-label*="theme"]');
    if (themeToggle) {
      await themeToggle.click();
      await page.waitForTimeout(800); // Wait for theme transition

      await page.screenshot({
        path: path.join(screenshotsDir, 'dark-mode.png'),
        fullPage: false
      });
      console.log('   ✅ Saved\n');
    } else {
      console.log('   ⚠️  Could not find theme toggle button\n');
    }

    console.log('✨ All screenshots completed successfully!\n');
    console.log('📁 Screenshots saved to: ' + screenshotsDir);

  } catch (error) {
    console.error('❌ Error taking screenshots:', error);
    throw error;
  } finally {
    await browser.close();
  }
}

// Run the script
if (require.main === module) {
  takeScreenshots()
    .then(() => {
      console.log('\n✅ Screenshot script completed');
      process.exit(0);
    })
    .catch((error) => {
      console.error('\n❌ Screenshot script failed:', error);
      process.exit(1);
    });
}

module.exports = { takeScreenshots };
