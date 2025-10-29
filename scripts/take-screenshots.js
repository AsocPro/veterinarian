const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

// Sample test data for screenshots
// Must match the format that state-persistence.js expects
const testSnippetData = {
  openFiles: [
    {
      name: 'my-snippets.toml',
      dirty: false,
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
        },
        {
          description: 'List running processes',
          command: 'ps aux | grep <process_name>',
          tag: ['system', 'monitoring'],
          output: ''
        }
      ]
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
    viewport: { width: 1600, height: 900 },
  });

  const page = await context.newPage();

  try {
    // Get URL from environment or default to localhost
    const targetUrl = process.env.SCREENSHOT_URL || 'http://localhost:8000';

    // Navigate to the app
    console.log(`📍 Navigating to ${targetUrl}...`);
    await page.goto(targetUrl, { waitUntil: 'networkidle' });

    // Inject test data into localStorage using the correct key
    console.log('💉 Injecting test data...');
    await page.evaluate((data) => {
      // Use the same key as state-persistence.js: 'veterinarian-state'
      localStorage.setItem('veterinarian-state', JSON.stringify(data));
    }, testSnippetData);

    // Reload to apply the data
    await page.reload({ waitUntil: 'networkidle' });
    await page.waitForTimeout(2000); // Give components time to render and load state

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

    // Find the Docker snippet (3rd snippet, index 2) which has list variables
    const allSnippets = await page.$$('snippet-item');
    const dockerSnippet = allSnippets.length > 2 ? allSnippets[2] : allSnippets[0];

    if (dockerSnippet) {
      // Scroll into view
      await dockerSnippet.evaluate(el => el.scrollIntoView({ block: 'center' }));
      await page.waitForTimeout(300);

      // Expand the variables section by clicking the toggle
      const expanded = await dockerSnippet.evaluate((el) => {
        const shadowRoot = el.shadowRoot;
        if (!shadowRoot) return false;

        // Find the variables toggle button
        const variablesToggle = shadowRoot.getElementById('variables-toggle');
        if (!variablesToggle) return false;

        // Check if already expanded
        const variablesSection = shadowRoot.getElementById('variables-section');
        const isExpanded = variablesSection?.classList.contains('expanded');

        // Click to expand if not already expanded
        if (!isExpanded) {
          variablesToggle.click();
          return true;
        }
        return false;
      });

      if (expanded) {
        console.log('   📂 Expanded variables section');
        await page.waitForTimeout(500); // Wait for expansion animation
      } else {
        console.log('   📂 Variables section already expanded');
      }

      // Take screenshot of just the snippet with variables expanded
      await dockerSnippet.screenshot({
        path: path.join(screenshotsDir, 'variables-section.png')
      });
      console.log('   ✅ Saved\n');
    }

    // Screenshot 3: Test Dialog
    console.log('📸 Taking screenshot 3: test-dialog.png');

    // Use the first snippet for test dialog (find command)
    const firstSnippet = allSnippets.length > 0 ? allSnippets[0] : null;
    if (firstSnippet) {
      // Scroll first snippet into view
      await firstSnippet.evaluate(el => el.scrollIntoView({ block: 'center' }));
      await page.waitForTimeout(300);

      // Click the test button in the shadow root
      const testButtonClicked = await firstSnippet.evaluate((el) => {
        const shadowRoot = el.shadowRoot;
        if (!shadowRoot) return false;

        const testButton = shadowRoot.getElementById('test-btn');
        if (testButton) {
          testButton.click();
          return true;
        }
        return false;
      });

      if (testButtonClicked) {
        console.log('   🔘 Clicked Test button');
        await page.waitForTimeout(1000); // Wait for dialog to appear

        // The modal is added to the main document body, not in shadow root
        const dialog = await page.$('.modal-dialog');
        if (dialog) {
          console.log('   📋 Found test dialog');

          // Fill in some test values to make the preview interesting
          const inputs = await dialog.$$('input');
          if (inputs.length > 0) {
            await inputs[0].fill('/home/user/projects');
            console.log('   ✍️  Filled first input');
            await page.waitForTimeout(300);
          }
          if (inputs.length > 1) {
            await inputs[1].fill('*.js');
            console.log('   ✍️  Filled second input');
            await page.waitForTimeout(300);
          }

          // Screenshot the dialog
          await dialog.screenshot({
            path: path.join(screenshotsDir, 'test-dialog.png')
          });
          console.log('   ✅ Saved\n');

          // Close the dialog by clicking the overlay
          const overlay = await page.$('.modal-overlay');
          if (overlay) {
            const closeButton = await dialog.$('button');
            if (closeButton) {
              await closeButton.click();
            } else {
              await overlay.click();
            }
            await page.waitForTimeout(500);
          }
        } else {
          console.log('   ⚠️  Could not find test dialog\n');
        }
      } else {
        console.log('   ⚠️  Could not find test button\n');
      }
    }

    // Screenshot 4: Dark Mode
    console.log('📸 Taking screenshot 4: dark-mode.png');

    // Click the dark theme button in the header
    const darkThemeButton = await page.$('#theme-dark');
    if (darkThemeButton) {
      await darkThemeButton.click();
      console.log('   🌙 Switched to dark mode');
      await page.waitForTimeout(800); // Wait for theme transition

      await page.screenshot({
        path: path.join(screenshotsDir, 'dark-mode.png'),
        fullPage: false
      });
      console.log('   ✅ Saved\n');
    } else {
      console.log('   ⚠️  Could not find dark theme button\n');
    }

    console.log('✨ All screenshots completed successfully!\n');
    console.log('📁 Screenshots saved to: ' + screenshotsDir);

  } catch (error) {
    console.error('❌ Error taking screenshots:', error);
    throw error;
  } finally {
    await context.close();
    await browser.close();
  }
}

/**
 * Record a video of variable editing in action
 */
async function recordVariableEditingDemo() {
  console.log('\n🎬 Starting variable editing demo recording...\n');

  const projectRoot = path.join(__dirname, '..');
  const screenshotsDir = path.join(projectRoot, 'screenshots');
  const videosDir = path.join(screenshotsDir, 'videos');
  let videoCropInfo = null;

  // Clean up videos directory before starting
  if (fs.existsSync(videosDir)) {
    console.log('🧹 Cleaning up old videos...');
    const files = fs.readdirSync(videosDir);
    files.forEach(file => {
      fs.unlinkSync(path.join(videosDir, file));
    });
  } else {
    fs.mkdirSync(videosDir, { recursive: true });
  }

  const browser = await chromium.launch({
    headless: true
  });

  // Use a taller viewport to fit the entire snippet with variables
  const context = await browser.newContext({
    viewport: { width: 1000, height: 1000 },
    recordVideo: {
      dir: videosDir,
      size: { width: 1000, height: 1000 }
    }
  });

  const page = await context.newPage();

  try {
    const targetUrl = process.env.SCREENSHOT_URL || 'http://localhost:8000';

    console.log(`📍 Navigating to ${targetUrl}...`);
    await page.goto(targetUrl, { waitUntil: 'networkidle' });

    // Inject test data
    console.log('💉 Injecting test data...');
    await page.evaluate((data) => {
      localStorage.setItem('veterinarian-state', JSON.stringify(data));
    }, testSnippetData);

    await page.reload({ waitUntil: 'networkidle' });
    await page.waitForTimeout(2000);
    await page.waitForSelector('snippet-list', { timeout: 5000 });
    console.log('✅ App loaded\n');

    // Use the first snippet (find command) which is simpler
    const allSnippets = await page.$$('snippet-item');
    const targetSnippet = allSnippets.length > 0 ? allSnippets[0] : null;

    if (!targetSnippet) {
      throw new Error('Could not find snippet');
    }

    // Scroll snippet to fill the viewport
//    await targetSnippet.evaluate(el => el.scrollIntoView({ block: 'start' }));
  //  await page.waitForTimeout(800);

    // Expand variables section
    await targetSnippet.evaluate((el) => {
      const shadowRoot = el.shadowRoot;
      const variablesToggle = shadowRoot?.getElementById('variables-toggle');
      if (variablesToggle) variablesToggle.click();
    });
    await page.waitForTimeout(1500); // Wait for expansion animation

    console.log('🎬 Everything loaded, pausing before actions start...');

    // Record the timestamp when we're ready to start (for trimming later)
    const recordingStartTime = Date.now();

    // Wait a bit longer so the GIF starts clean
    await page.waitForTimeout(2000);

    // Action 1: Type in the path field
    console.log('   ✍️  Typing in path field...');

    // Click and clear the first text input (path)
    const inputInfo = await targetSnippet.evaluate((el) => {
      const shadowRoot = el.shadowRoot;
      // The inputs have class .variable-input
      const inputs = shadowRoot.querySelectorAll('input.variable-input[type="text"]');

      // Debug: log what we found
      console.log('Found inputs:', inputs.length);
      if (inputs[0]) {
        console.log('First input data-var-idx:', inputs[0].dataset.varIdx);
        console.log('First input data-val-idx:', inputs[0].dataset.valIdx);

        inputs[0].focus();
        inputs[0].value = '';
        // Trigger input event to clear the command
        const event = new Event('input', { bubbles: true });
        inputs[0].dispatchEvent(event);

        return { found: true, count: inputs.length };
      }
      return { found: false, count: inputs.length };
    });

    console.log(`   Found ${inputInfo.count} inputs, first input ${inputInfo.found ? 'processed' : 'not found'}`);
    await page.waitForTimeout(800);

    // Type slowly to show real-time updates
    const pathToType = '/home/user/projects';
    for (const char of pathToType) {
      await targetSnippet.evaluate((el, character) => {
        const shadowRoot = el.shadowRoot;
        const inputs = shadowRoot.querySelectorAll('input.variable-input[type="text"]');
        if (inputs[0]) {
          inputs[0].value += character;
          // Trigger input event to update the command
          const event = new Event('input', { bubbles: true });
          inputs[0].dispatchEvent(event);
        }
      }, char);
      await page.waitForTimeout(250); // Slower typing to show real-time update
    }
    await page.waitForTimeout(1500);

    // Action 2: Type in filename field
    console.log('   ✍️  Typing in filename field...');

    // Click and clear the second text input (filename)
    await targetSnippet.evaluate((el) => {
      const shadowRoot = el.shadowRoot;
      const inputs = shadowRoot.querySelectorAll('input.variable-input[type="text"]');
      if (inputs.length > 1) {
        inputs[1].focus();
        inputs[1].value = '';
        // Trigger input event to clear
        const event = new Event('input', { bubbles: true });
        inputs[1].dispatchEvent(event);
      }
    });
    await page.waitForTimeout(800);

    // Type slowly
    const filename = '*.js';
    for (const char of filename) {
      await targetSnippet.evaluate((el, character) => {
        const shadowRoot = el.shadowRoot;
        const inputs = shadowRoot.querySelectorAll('input.variable-input[type="text"]');
        if (inputs.length > 1) {
          inputs[1].value += character;
          // Trigger input event
          const event = new Event('input', { bubbles: true });
          inputs[1].dispatchEvent(event);
        }
      }, char);
      await page.waitForTimeout(250);
    }
    await page.waitForTimeout(2000); // Longer pause to show final result

    console.log('✅ Recording complete!\n');

    // Get the bounding box of the snippet for cropping
    const boundingBox = await targetSnippet.boundingBox();
    if (!boundingBox) {
      throw new Error('Could not get snippet bounding box');
    }

    console.log(`📐 Snippet bounds: ${Math.round(boundingBox.width)}x${Math.round(boundingBox.height)} at (${Math.round(boundingBox.x)}, ${Math.round(boundingBox.y)})`);

    // Store the crop dimensions for later use
    videoCropInfo = {
      x: Math.round(boundingBox.x),
      y: Math.round(boundingBox.y),
      width: Math.round(boundingBox.width),
      height: Math.round(boundingBox.height),
      trimStart: 4 // Trim first 4 seconds (loading + expansion time)
    };

  } catch (error) {
    console.error('❌ Error recording demo:', error);
    throw error;
  } finally {
    await context.close();
    await browser.close();
  }

  // Find the generated video file
  const videoFiles = fs.readdirSync(videosDir).filter(f => f.endsWith('.webm'));
  if (videoFiles.length > 0) {
    const videoPath = path.join(videosDir, videoFiles[videoFiles.length - 1]);
    console.log('🎥 Video saved to: ' + videoPath);
    console.log('📹 Converting to GIF...\n');

    // Convert to GIF using ffmpeg with crop
    const success = await convertVideoToGif(videoPath, path.join(screenshotsDir, 'variable-editing-demo.gif'), videoCropInfo);

    // Clean up videos directory after successful conversion
    if (success) {
      console.log('🧹 Cleaning up temporary files...');
      const remainingFiles = fs.readdirSync(videosDir);
      remainingFiles.forEach(file => {
        fs.unlinkSync(path.join(videosDir, file));
      });
      // Remove the videos directory if empty
      if (fs.readdirSync(videosDir).length === 0) {
        fs.rmdirSync(videosDir);
      }
    }

    return success;
  } else {
    throw new Error('No video file was generated');
  }
}

/**
 * Convert video to GIF using ffmpeg
 * @param {string} videoPath - Path to the input video
 * @param {string} outputPath - Path to the output GIF
 * @param {object} cropInfo - Optional crop information {x, y, width, height}
 */
async function convertVideoToGif(videoPath, outputPath, cropInfo = null) {
  const { exec } = require('child_process');
  const util = require('util');
  const execPromise = util.promisify(exec);

  // Check if ffmpeg is available
  try {
    await execPromise('ffmpeg -version');
  } catch (error) {
    console.log('⚠️  ffmpeg not found. Please install ffmpeg to generate GIF:');
    console.log('   - macOS: brew install ffmpeg');
    console.log('   - Ubuntu/Debian: sudo apt-get install ffmpeg');
    console.log('   - Fedora: sudo dnf install ffmpeg');
    console.log('\n📹 Video file available at: ' + videoPath);
    console.log('   You can convert it manually with:');
    console.log(`   ffmpeg -i "${videoPath}" -vf "fps=15,scale=1000:-1:flags=lanczos,split[s0][s1];[s0]palettegen=max_colors=256[p];[s1][p]paletteuse=dither=bayer" -loop 0 "${outputPath}"`);
    return false;
  }

  // Generate palette for better quality GIF
  const paletteFile = path.join(path.dirname(videoPath), 'palette.png');

  try {
    // Build input options for trimming
    let inputOptions = '';
    if (cropInfo && cropInfo.trimStart) {
      console.log(`⏭️  Trimming first ${cropInfo.trimStart} seconds...`);
      inputOptions = `-ss ${cropInfo.trimStart} `;
    }

    // Build crop filter if crop info provided
    let cropFilter = '';
    if (cropInfo) {
      console.log(`✂️  Cropping to snippet area: ${cropInfo.width}x${cropInfo.height} at (${cropInfo.x}, ${cropInfo.y})`);
      cropFilter = `crop=${cropInfo.width}:${cropInfo.height}:${cropInfo.x}:${cropInfo.y},`;
    }

    console.log('🎨 Generating optimized color palette...');
    // Use palettegen with stats_mode to optimize for the actual colors used
    await execPromise(`ffmpeg ${inputOptions}-i "${videoPath}" -vf "${cropFilter}fps=15,scale=-1:-1:flags=lanczos,palettegen=max_colors=128:stats_mode=diff" -y "${paletteFile}"`);

    console.log('🎞️  Converting to optimized GIF...');
    // Use paletteuse with optimized dithering for smaller file size
    await execPromise(`ffmpeg ${inputOptions}-i "${videoPath}" -i "${paletteFile}" -filter_complex "${cropFilter}fps=15,scale=-1:-1:flags=lanczos[x];[x][1:v]paletteuse=dither=bayer:bayer_scale=2:diff_mode=rectangle" -loop 0 -y "${outputPath}"`);

    const originalSize = fs.statSync(outputPath).size;
    console.log(`✅ GIF created: ${(originalSize / 1024 / 1024).toFixed(2)} MB`);

    // Further optimize with gifsicle if available
    try {
      await execPromise('gifsicle --version');
      console.log('🗜️  Optimizing with gifsicle...');

      const tempOptimized = outputPath + '.tmp';
      await execPromise(`gifsicle -O3 --lossy=80 "${outputPath}" -o "${tempOptimized}"`);

      const optimizedSize = fs.statSync(tempOptimized).size;
      const savings = ((originalSize - optimizedSize) / originalSize * 100).toFixed(1);

      // Replace original with optimized version
      fs.unlinkSync(outputPath);
      fs.renameSync(tempOptimized, outputPath);

      console.log(`   Reduced by ${savings}% → ${(optimizedSize / 1024 / 1024).toFixed(2)} MB`);
    } catch (error) {
      console.log('   ℹ️  gifsicle not found - install for better compression:');
      console.log('      - macOS: brew install gifsicle');
      console.log('      - Ubuntu/Debian: sudo apt-get install gifsicle');
      console.log('      - Fedora: sudo dnf install gifsicle');
    }

    // Clean up
    fs.unlinkSync(paletteFile);
    fs.unlinkSync(videoPath);

    console.log('✅ GIF created: ' + outputPath + '\n');
    return true;
  } catch (error) {
    console.error('❌ Error converting to GIF:', error.message);
    console.log('📹 Original video available at: ' + videoPath);
    return false;
  }
}

// Run the script
if (require.main === module) {
  (async () => {
    try {
      // Take screenshots
      await takeScreenshots();

      // Record variable editing demo
      await recordVariableEditingDemo();

      console.log('\n✅ All media generation completed!');
      process.exit(0);
    } catch (error) {
      console.error('\n❌ Script failed:', error);
      process.exit(1);
    }
  })();
}

module.exports = { takeScreenshots, recordVariableEditingDemo };
