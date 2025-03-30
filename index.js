#!/usr/bin/env node

import prompts from "prompts";
import { execa } from "execa";
import fs from "fs-extra";
import path from "path";
import ora from "ora";
import chalk from "chalk";
import cliProgress from "cli-progress";
import gradient from "gradient-string";
import boxen from "boxen";
import inquirer from "inquirer";
import inquirerSearchCheckbox from 'inquirer-search-checkbox';
import { spawn } from 'child_process';
import os from 'os';
import * as templates from './templates.js';

// Get package version from package.json
const packageJson = JSON.parse(await fs.readFile(new URL('./package.json', import.meta.url), 'utf8'));
const VERSION = packageJson.version || '0.0.0';

// Register checkbox search prompt
inquirer.registerPrompt('search-checkbox', inquirerSearchCheckbox);

// Theme configuration
const themes = {
  default: {
    primary: ['#FF5F6D', '#FFC371'],
    secondary: 'cyan',
    accent: 'green',
    error: 'red'
  },
  ocean: {
    primary: ['#2E3192', '#1BFFFF'],
    secondary: 'blue',
    accent: 'cyan',
    error: 'red'
  },
  forest: {
    primary: ['#134E5E', '#71B280'],
    secondary: 'green',
    accent: 'yellow',
    error: 'red'
  }
};

let currentTheme = themes.default;
const filip = gradient(currentTheme.primary);

function applyTheme(themeName) {
  currentTheme = themes[themeName] || themes.default;
  return gradient(currentTheme.primary);
}

function printBanner() {
  const gradientFn = gradient(currentTheme.primary);
  
  console.log(gradientFn(`
███████╗██╗██╗     ██╗██████╗ 
██╔════╝██║██║     ██║██╔══██╗
█████╗  ██║██║     ██║██████╔╝
██╔══╝  ██║██║     ██║██╔═══╝ 
██║     ██║███████╗██║██║     
╚═╝     ╚═╝╚══════╝╚═╝╚═╝     
`));
  console.log(`${gradientFn('🚀')} ${chalk.bold("Create Filip App")} ${chalk.dim(`v${VERSION}`)} ${gradientFn('✨')}\n`);
  console.log(chalk.dim("Modern Next.js setup with all the best practices\n"));
}

async function checkPackageManager() {
  try {
    await execa("pnpm", ["--version"]);
    return "pnpm";
  } catch (e) {
    try {
      await execa("yarn", ["--version"]);
      return "yarn";
    } catch (e) {
      return "npm";
    }
  }
}

async function showWelcomeScreen() {
  const gradientFn = gradient(currentTheme.primary);
  
  console.log(boxen(
    `${chalk.bold(gradientFn('Welcome to the Filip App Creator!'))}\n\n` +
    `${chalk.dim('This tool helps you create a production-ready Next.js app with:')}\n\n` +
    `    ${chalk.green('•')} Next.js 14 with App Router\n` +
    `    ${chalk.green('•')} TypeScript for type safety\n` +
    `    ${chalk.green('•')} TailwindCSS for styling\n` +
    `    ${chalk.green('•')} Components system (UI components)\n` +
    `    ${chalk.green('•')} Dark mode support\n` +
    `    ${chalk.green('•')} ESLint configuration\n`,
    { 
      padding: 1, 
      margin: 1,
      borderStyle: 'round', 
      borderColor: 'cyan',
      title: '✨ Welcome',
      titleAlignment: 'center'
    }
  ));
  
  const { action } = await inquirer.prompt([
    {
      type: 'list',
      name: 'action',
      message: 'What would you like to do?',
      prefix: gradientFn('?'),
      choices: [
        { name: `${chalk.bold('🔨 Create')} ${chalk.dim('a new Filip app')}`, value: 'create' },
        { name: `${chalk.bold('🎨 Theme')} ${chalk.dim('change the look')}`, value: 'theme' },
        { name: `${chalk.bold('📝 Version')} ${chalk.dim('check or update version')}`, value: 'version' },
        { name: `${chalk.bold('ℹ️ About')} ${chalk.dim('this tool')}`, value: 'about' },
        { name: `${chalk.bold('❌ Exit')}`, value: 'exit' }
      ]
    }
  ]);
  
  if (action === 'exit') {
    console.log(chalk.yellow("\nExiting. Goodbye! 👋"));
    process.exit(0);
  } else if (action === 'version') {
    const gradientFn = gradient(currentTheme.primary);
    console.log(boxen(
      `${chalk.bold(gradientFn('Current Version'))}\n\n` +
      `${chalk.bold(VERSION)}`,
      { 
        padding: 1, 
        margin: 1, 
        borderStyle: 'round', 
        borderColor: 'magenta',
        title: '🔢 Version',
        titleAlignment: 'center'
      }
    ));
    
    const { versionAction } = await inquirer.prompt([
      {
        type: 'list',
        name: 'versionAction',
        message: 'What would you like to do?',
        choices: [
          { name: 'Update version (semantic)', value: 'update' },
          { name: 'Back to main menu', value: 'back' }
        ]
      }
    ]);
    
    if (versionAction === 'update') {
      // Parse current version
      const [major, minor, patch] = VERSION.split('.').map(Number);
      
      const { updateType } = await inquirer.prompt([
        {
          type: 'list',
          name: 'updateType',
          message: 'Select version update type:',
          choices: [
            { name: `Major (${major + 1}.0.0)`, value: 'major' },
            { name: `Minor (${major}.${minor + 1}.0)`, value: 'minor' },
            { name: `Patch (${major}.${minor}.${patch + 1})`, value: 'patch' },
            { name: 'Custom version', value: 'custom' }
          ]
        }
      ]);
      
      let newVersion;
      
      if (updateType === 'major') {
        newVersion = `${major + 1}.0.0`;
      } else if (updateType === 'minor') {
        newVersion = `${major}.${minor + 1}.0`;
      } else if (updateType === 'patch') {
        newVersion = `${major}.${minor}.${patch + 1}`;
      } else {
        const { customVersion } = await inquirer.prompt([
          {
            type: 'input',
            name: 'customVersion',
            message: 'Enter new version (x.y.z format):',
            default: VERSION,
            validate: (input) => {
              return /^\d+\.\d+\.\d+$/.test(input) 
                ? true 
                : 'Please enter a valid version in x.y.z format';
            }
          }
        ]);
        newVersion = customVersion;
      }
      
      // Update the version
      const spinner = ora({
        text: `Updating version to ${newVersion}...`,
        color: 'magenta'
      }).start();
      
      const success = await updatePackageVersion(newVersion);
      
      if (success) {
        spinner.succeed(`Version updated to ${newVersion}`);
        console.log(chalk.yellow('\nPlease restart the CLI to apply the new version.\n'));
      } else {
        spinner.fail('Failed to update version');
      }
    }
    
    return showWelcomeScreen();
  } else if (action === 'about') {
    const gradientFn = gradient(currentTheme.primary);
    console.log(boxen(
      `${chalk.bold(gradientFn('Create Filip App'))}\n\n` +
      `A modern CLI tool for creating Next.js applications with best practices.\n\n` +
      `${chalk.bold('Author:')} Filip\n` +
      `${chalk.bold('Version:')} ${VERSION}\n` +
      `${chalk.bold('License:')} MIT`,
      { 
        padding: 1, 
        margin: 1, 
        borderStyle: 'round', 
        borderColor: 'blue',
        title: 'About',
        titleAlignment: 'center'
      }
    ));
    return showWelcomeScreen();
  } else if (action === 'theme') {
    const { selectedTheme } = await inquirer.prompt([
      {
        type: 'list',
        name: 'selectedTheme',
        message: 'Select a theme:',
        choices: [
          { name: '🔥 Default (Warm)', value: 'default' },
          { name: '🌊 Ocean Blue', value: 'ocean' },
          { name: '🌲 Forest Green', value: 'forest' }
        ]
      }
    ]);
    
    applyTheme(selectedTheme);
    console.log(chalk.green(`\nTheme changed to ${selectedTheme}!\n`));
    return showWelcomeScreen();
  }
  
  return action;
}

// Function to update the package.json version
async function updatePackageVersion(newVersion) {
  try {
    // Read the current package.json
    const packageJsonPath = new URL('./package.json', import.meta.url);
    const packageData = JSON.parse(await fs.readFile(packageJsonPath, 'utf8'));
    
    // Update the version
    packageData.version = newVersion;
    
    // Write back to package.json with proper formatting
    await fs.writeFile(
      packageJsonPath, 
      JSON.stringify(packageData, null, 2) + '\n', 
      'utf8'
    );
    
    console.log(chalk.green(`✓ Package version updated to ${newVersion}`));
    return true;
  } catch (error) {
    console.error(chalk.red(`Failed to update package version: ${error.message}`));
    return false;
  }
}

// Helper function to set up project manually
async function setupProjectManually(projectName, projectDir, pkgManager) {
  console.log(chalk.cyan(`Setting up project manually...`));
  
  try {
    // Create the base directory
    await fs.ensureDir(projectDir);
    
    // Create package.json
    const basePackageJson = {
      name: projectName,
      version: "0.1.0",
      private: true,
      scripts: {
        dev: "next dev",
        build: "next build",
        start: "next start",
        lint: "next lint"
      },
      dependencies: {
        next: "latest",
        react: "latest",
        "react-dom": "latest"
      },
      devDependencies: {
        typescript: "latest",
        "@types/node": "latest",
        "@types/react": "latest",
        "@types/react-dom": "latest",
        "@tailwindcss/postcss": "latest",
        "tailwindcss": "latest",
        "postcss": "latest",
        "autoprefixer": "latest",
        "eslint": "latest",
        "eslint-config-next": "latest"
      }
    };
    
    await fs.writeJson(path.join(projectDir, 'package.json'), basePackageJson, { spaces: 2 });
    
    // Create basic Next.js structure
    await fs.ensureDir(path.join(projectDir, 'app'));
    await fs.ensureDir(path.join(projectDir, 'public'));
    
    // Create a basic page.tsx
    // Choose page template based on whether components are being installed
    let pageTemplate;
    if (features && features.installComponents) {
      pageTemplate = templates.componentsShowcasePage;
    } else {
      pageTemplate = templates.pageContent(projectName);
    }
    
    await fs.writeFile(path.join(projectDir, 'app', 'page.tsx'), pageTemplate);
    
    // Create a basic layout.tsx
    const layoutContent = templates.layoutContent;
    
    await fs.writeFile(path.join(projectDir, 'app', 'layout.tsx'), layoutContent);
    
    // Create minimal config files
    const nextConfigContent = templates.nextConfigContent;
    
    await fs.writeFile(path.join(projectDir, 'next.config.js'), nextConfigContent);
    
    const tsConfigContent = templates.tsConfigContent;
    
    await fs.writeFile(path.join(projectDir, 'tsconfig.json'), tsConfigContent);
    
    // Create PostCSS config
    const postcssConfigContent = templates.postcssConfigContent;
    await fs.writeFile(path.join(projectDir, 'postcss.config.mjs'), postcssConfigContent);
    
    // Create the CSS file
    const globalCssContent = templates.globalCssContent;
    
    await fs.ensureDir(path.join(projectDir, 'app'));
    await fs.writeFile(path.join(projectDir, 'app', 'globals.css'), globalCssContent);
    
    console.log(chalk.green(`Created basic Next.js app structure manually`));
    
    console.log(boxen(
      `${chalk.bold(gradient(currentTheme.primary)('Manual Setup Complete'))}\n\n` +
      `${chalk.cyan('Basic Next.js app structure created. You may need to run:')} \n\n` +
      `${chalk.dim(`${pkgManager} install`)} \n\n` +
      `${chalk.cyan('to complete the setup after installation.')}`,
      { 
        padding: 1, 
        margin: 1, 
        borderStyle: 'round', 
        borderColor: 'yellow',
        title: '📦 Manual Setup',
        titleAlignment: 'center'
      }
    ));
    
    return true;
  } catch (manualError) {
    console.error(chalk.red(`Failed to set up project manually: ${manualError.message}`));
    return false;
  }
}

async function run() {
  // Define gradient function at the beginning to prevent reference errors
  const runGradient = text => gradient(currentTheme.primary)(text);
  
  printBanner();

  const action = await showWelcomeScreen();
  
  if (action !== 'create') return;

  // Project configuration
  const config = await inquirer.prompt([
    {
      type: 'input',
      name: 'appName',
      message: 'What is your project name?',
      default: 'filip-app',
      validate: input => {
        if (input.trim() === '') return 'Project name cannot be empty';
        
        // Check if directory already exists
        const dirPath = path.resolve(process.cwd(), input.trim());
        if (fs.existsSync(dirPath)) {
          const dirContents = fs.readdirSync(dirPath);
          if (dirContents.length > 0) {
            return `Directory "${input}" already exists and is not empty. Please choose a different name or use an empty directory.`;
          }
        }
        
        return true;
      }
    },
    {
      type: 'list',
      name: 'packageManager',
      message: 'Select preferred package manager:',
      choices: [
        { name: '🔍 Auto-detect (recommended)', value: 'auto' },
        { name: '📦 npm', value: 'npm' },
        { name: '🚀 pnpm', value: 'pnpm' },
        { name: '🧶 yarn', value: 'yarn' }
      ],
      default: 'auto'
    },
    {
      type: 'checkbox',
      name: 'features',
      message: 'Select additional features:',
      choices: [
        { name: '✅ Install UI components', value: 'components', checked: true },
        { name: '⚡ Ultra-fast mode (10x faster setup)', value: 'fastMode', checked: true },
        { name: '🌓 Light/Dark theme switcher', value: 'themeSwitch', checked: true },
        { name: '💾 MongoDB + Prisma setup', value: 'prisma', checked: false },
        { name: '🔐 Authentication (Next-Auth)', value: 'auth', checked: false },
        { name: '📄 Add documentation files', value: 'docs', checked: false },
        { name: '📱 Add responsive layouts', value: 'responsive', checked: false }
      ]
    }
  ]);
  
  // Extract config
  const { appName, packageManager: pmChoice } = config;
  const features = {
    installComponents: config.features.includes('components'),
    fastMode: config.features.includes('fastMode'),
    themeSwitch: config.features.includes('themeSwitch'),
    prisma: config.features.includes('prisma'),
    auth: config.features.includes('auth'),
    includeDocs: config.features.includes('docs'),
    responsive: config.features.includes('responsive')
  };

  const appDir = path.resolve(process.cwd(), appName);

  // Determine package manager
  let packageManager = pmChoice;
  if (packageManager === 'auto') {
    packageManager = await checkPackageManager();
  }
  
  // Show component selection if components are enabled
  let selectedComponents = ['button', 'card', 'sheet', 'dropdown-menu', 'tabs', 'input', 'label'];
  
  if (features.installComponents) {
    // Create arrays of available components - separated by type
    const shadcnComponents = [
      'accordion', 'alert', 'alert-dialog', 'aspect-ratio', 'avatar', 'badge', 
      'breadcrumb', 'button', 'calendar', 'card', 'carousel', 'chart', 'checkbox', 
      'collapsible', 'combobox', 'command', 'context-menu', 'data-table', 'date-picker', 
      'dialog', 'drawer', 'dropdown-menu', 'form', 'hover-card', 'input', 'input-otp', 
      'label', 'menubar', 'navigation-menu', 'pagination', 'popover', 'progress', 
      'radio-group', 'resizable', 'scroll-area', 'select', 'separator', 'sheet', 
      'sidebar', 'skeleton', 'slider', 'sonner', 'switch', 'table', 'tabs', 'textarea', 
      'toast', 'toggle', 'toggle-group', 'tooltip'
    ];
    
    const customComponents = [
      'file-uploader', 'video-player', 'timeline', 'rating', 'file-tree', 'copy-button'
    ];
    
    // Combine all components
    const allComponents = [...shadcnComponents, ...customComponents];
    
    // Define essential components with additional important ones
    const essentialComponents = [
      'button', 'card', 'dialog', 'dropdown-menu', 'form', 'input', 'label', 
      'sheet', 'tabs', 'separator', 'toast', 'accordion', 'slider'
    ];
    
    // First, ask if the user wants to select components
    const { componentSelection } = await inquirer.prompt([
      {
        type: 'list',
        name: 'componentSelection',
        message: 'How would you like to select Components?',
        choices: [
          { name: '🔍 Custom selection (choose specific components)', value: 'custom' },
          { name: '✅ Select all components', value: 'all' },
          { name: '🧰 Essential components only (common UI elements)', value: 'essential' }
        ]
      }
    ]);
    
    if (componentSelection === 'all') {
      selectedComponents = allComponents;
      console.log(chalk.green(`\n✓ Selected all ${selectedComponents.length} components\n`));
    } else if (componentSelection === 'essential') {
      selectedComponents = essentialComponents;
      console.log(chalk.green(`\n✓ Selected essential components: ${selectedComponents.join(', ')}\n`));
    } else {
      // Show the component selection dialog for custom selection with grouping
      const componentPrompt = await inquirer.prompt([
        {
          type: 'checkbox', // Change from search-checkbox to regular checkbox
          name: 'components',
          message: 'Select components to install:',
          choices: [
            new inquirer.Separator('--- UI Components ---'),
            { name: 'Accordion', value: 'accordion' },
            { name: 'Alert', value: 'alert' },
            { name: 'Alert Dialog', value: 'alert-dialog' },
            { name: 'Aspect Ratio', value: 'aspect-ratio' },
            { name: 'Avatar', value: 'avatar' },
            { name: 'Badge', value: 'badge' },
            { name: 'Breadcrumb', value: 'breadcrumb' },
            { name: 'Button', value: 'button', checked: true },
            { name: 'Calendar', value: 'calendar' },
            { name: 'Card', value: 'card', checked: true },
            { name: 'Carousel', value: 'carousel' },
            { name: 'Chart', value: 'chart' },
            { name: 'Checkbox', value: 'checkbox' },
            { name: 'Collapsible', value: 'collapsible' },
            { name: 'Combobox', value: 'combobox' },
            { name: 'Command', value: 'command' },
            { name: 'Context Menu', value: 'context-menu' },
            { name: 'Data Table', value: 'data-table' },
            { name: 'Date Picker', value: 'date-picker' },
            { name: 'Dialog', value: 'dialog', checked: true },
            { name: 'Drawer', value: 'drawer' },
            { name: 'Dropdown Menu', value: 'dropdown-menu', checked: true },
            { name: 'Form', value: 'form', checked: true },
            { name: 'Hover Card', value: 'hover-card' },
            { name: 'Input', value: 'input', checked: true },
            { name: 'Input OTP', value: 'input-otp' },
            { name: 'Label', value: 'label', checked: true },
            { name: 'Menubar', value: 'menubar' },
            { name: 'Navigation Menu', value: 'navigation-menu' },
            { name: 'Pagination', value: 'pagination' },
            { name: 'Popover', value: 'popover' },
            { name: 'Progress', value: 'progress' },
            { name: 'Radio Group', value: 'radio-group' },
            { name: 'Resizable', value: 'resizable' },
            { name: 'Scroll Area', value: 'scroll-area' },
            { name: 'Select', value: 'select' },
            { name: 'Separator', value: 'separator' },
            { name: 'Sheet', value: 'sheet' },
            { name: 'Sidebar', value: 'sidebar' },
            { name: 'Skeleton', value: 'skeleton' },
            { name: 'Slider', value: 'slider' },
            { name: 'Sonner', value: 'sonner' },
            { name: 'Switch', value: 'switch' },
            { name: 'Table', value: 'table' },
            { name: 'Tabs', value: 'tabs' },
            { name: 'Textarea', value: 'textarea' },
            { name: 'Toast', value: 'toast' },
            { name: 'Toggle', value: 'toggle' },
            { name: 'Toggle Group', value: 'toggle-group' },
            { name: 'Tooltip', value: 'tooltip' },
            new inquirer.Separator('--- Custom Components ---'),
            { name: 'File Uploader (Drag & Drop)', value: 'file-uploader', checked: true },
            { name: 'Video Player Interface', value: 'video-player' },
            { name: 'Timeline', value: 'timeline' },
            { name: 'Rating/Stars Input', value: 'rating' },
            { name: 'File Tree', value: 'file-tree' },
            { name: 'Copy to Clipboard Button', value: 'copy-button', checked: true }
          ],
          pageSize: 20
        }
      ]);
      
      if (componentPrompt.components.length > 0) {
        selectedComponents = componentPrompt.components;
      }
    }
  }
  
  // Show configuration summary
  console.log(boxen(
    `${chalk.bold(runGradient('✨ Project Configuration ✨'))}\n\n` +
    `${chalk.bold('Project:')} ${chalk.cyan(appName)}\n` +
    `${chalk.bold('Location:')} ${chalk.cyan(appDir)}\n` +
    `${chalk.bold('Package Manager:')} ${chalk.cyan(packageManager)}\n\n` +
    `${chalk.bold('Features:')}\n` +
    `  ${features.installComponents ? chalk.green('✓') : chalk.gray('○')} ${chalk.bold('UI Components:')} ${features.installComponents ? chalk.cyan(selectedComponents.length > 5 ? selectedComponents.slice(0, 5).join(', ') + ', ...' : selectedComponents.join(', ')) : chalk.gray('None')}\n` +
    `  ${features.fastMode ? chalk.green('✓') : chalk.gray('○')} ${chalk.bold('Fast Mode')}\n` +
    `  ${features.themeSwitch ? chalk.green('✓') : chalk.gray('○')} ${chalk.bold('Theme Switcher')}\n` +
    `  ${features.prisma ? chalk.green('✓') : chalk.gray('○')} ${chalk.bold('Prisma Database')}\n` +
    `  ${features.auth ? chalk.green('✓') : chalk.gray('○')} ${chalk.bold('Authentication')}\n` +
    `  ${features.includeDocs ? chalk.green('✓') : chalk.gray('○')} ${chalk.bold('Documentation')}\n` +
    `  ${features.responsive ? chalk.green('✓') : chalk.gray('○')} ${chalk.bold('Responsive Layout')}`,
    { 
      padding: 1, 
      margin: 1, 
      borderStyle: 'round', 
      borderColor: currentTheme.secondary, 
      title: '🛠️ Configuration',
      titleAlignment: 'center'
    }
  ));
  
  // Confirm and continue
  const { confirm } = await inquirer.prompt([
    {
      type: 'confirm',
      name: 'confirm',
      message: 'Create the application with these settings?',
      default: true
    }
  ]);
  
  if (!confirm) {
    console.log(chalk.yellow("\nCancelled. Let's start over!"));
    return run();
  }
  
  const spinner = ora({
    color: currentTheme.secondary,
    spinner: 'dots'
  });
  
  const steps = [
    "Creating Next.js app",
    "Installing dependencies",
    "Setting up shadcn components",
    "Creating .env file"
  ];

  if (features.themeSwitch) {
    steps.push("Setting up theme switcher");
  }

  if (features.prisma) {
    steps.push("Initializing Prisma");
  }
  
  if (features.auth) {
    steps.push("Setting up authentication");
  }

  if (features.installComponents) {
    steps.push("Installing UI components");
  }
  
  if (features.includeDocs) {
    steps.push("Adding documentation");
  }
  
  if (features.responsive) {
    steps.push("Setting up responsive layouts");
  }

  const progressBar = new cliProgress.SingleBar({
    format: runGradient("Installation") + " " + chalk.dim("|") + chalk[currentTheme.secondary]("{bar}") + chalk.dim("|") + " " + chalk.bold("{percentage}%") + chalk.dim(" •") + " " + chalk.white("{step}"),
    barCompleteChar: "█",
    barIncompleteChar: "░",
    hideCursor: true,
    clearOnComplete: true,
    barsize: 30
  });

  // Create a function to update progress with better visuals
  const updateProgress = (step, incrementBy = 1) => {
    currentStep += incrementBy;
    progressBar.update(currentStep, { step: chalk.cyan(step) });
    spinner.text = step;
  };

  // Initialize progress tracking
  let currentStep = 0;
  progressBar.start(steps.length, currentStep, { step: "Starting..." });

  try {
    // Step 1: Create Next.js app
    updateProgress(`${steps[0]}...`);
    spinner.stop();
    
    // Show a creating app box rather than plain text
    console.log(boxen(
      `${chalk.bold(runGradient('Creating Next.js App'))}\n\n` +
      `${chalk.cyan('•')} Project name: ${chalk.bold(appName)}\n` +
      `${chalk.cyan('•')} Directory: ${chalk.dim(appDir)}\n` +
      `${chalk.cyan('•')} Package manager: ${chalk.bold(packageManager)}\n` +
      `${chalk.cyan('•')} Features: ${chalk.dim('TypeScript, ESLint, Tailwind CSS')}\n`,
      { 
        padding: 1, 
        margin: 1, 
        borderStyle: 'round', 
        borderColor: currentTheme.secondary,
        title: '🚀 New Project',
        titleAlignment: 'center'
      }
    ));
    
    // Create a loader for the app creation process
    const createAppSpinner = ora({
      text: chalk.cyan('Initializing Next.js app (this might take a moment)...'),
      color: 'cyan',
      spinner: 'dots'
    }).start();
    
    // Check if directory exists and is not empty before running create-next-app
    const appDirExists = fs.existsSync(appDir);
    if (appDirExists) {
      const dirContents = fs.readdirSync(appDir);
      if (dirContents.length > 0) {
        const { handleExisting } = await inquirer.prompt([
          {
            type: 'list',
            name: 'handleExisting',
            message: `Directory "${appName}" already exists and contains files. What would you like to do?`,
            choices: [
              { name: 'Choose a different name', value: 'rename' },
              { name: 'Delete existing directory and start fresh', value: 'delete' },
              { name: 'Cancel installation', value: 'cancel' }
            ]
          }
        ]);
        
        if (handleExisting === 'rename') {
          const { newName } = await inquirer.prompt([
            {
              type: 'input',
              name: 'newName',
              message: 'Enter a new project name:',
              validate: input => {
                if (input.trim() === '') return 'Project name cannot be empty';
                
                const newDir = path.resolve(process.cwd(), input.trim());
                if (fs.existsSync(newDir)) {
                  const newDirContents = fs.readdirSync(newDir);
                  if (newDirContents.length > 0) {
                    return `Directory "${input}" also exists and is not empty. Please choose a different name.`;
                  }
                }
                
                return true;
              }
            }
          ]);
          
          // Update app name and directory
          appName = newName.trim();
          appDir = path.resolve(process.cwd(), appName);
        } else if (handleExisting === 'delete') {
          const { confirmDelete } = await inquirer.prompt([
            {
              type: 'confirm',
              name: 'confirmDelete',
              message: `Are you sure you want to delete the existing "${appName}" directory? This cannot be undone.`,
              default: false
            }
          ]);
          
          if (confirmDelete) {
            try {
              spinner.start(`Deleting existing directory ${appName}...`);
              await fs.remove(appDir);
              spinner.succeed(`Deleted existing directory ${appName}`);
            } catch (deleteError) {
              spinner.fail(`Failed to delete directory: ${deleteError.message}`);
              throw new Error(`Cannot proceed: failed to delete existing directory ${appName}`);
            }
          } else {
            throw new Error('Installation cancelled: directory already exists');
          }
        } else {
          throw new Error('Installation cancelled by user');
        }
      }
    }
    
    // Determine package manager flags for create-next-app
    const pmFlag = packageManager === "npm" ? "--use-npm" : 
                  packageManager === "pnpm" ? "--use-pnpm" : 
                  packageManager === "yarn" ? "--use-yarn" : "--use-npm";
    
    // After the create-next-app command is executed, capture the output but display it in a better format
    try {
      // Create a function to verify app creation success
      const verifyAppCreation = async () => {
        // Check if the directory was actually created
        if (!fs.existsSync(appDir)) {
          return false;
        }
        
        // Check if the directory contains basic Next.js files
        try {
          const dirContents = await fs.readdir(appDir);
          return dirContents.some(file => 
            ['package.json', 'next.config.js', 'app', 'tsconfig.json'].includes(file)
          );
        } catch (err) {
          return false;
        }
      };
      
      // Execute the create-next-app command but capture output instead of showing raw
      createAppSpinner.text = chalk.cyan(`Running create-next-app for ${chalk.bold(appName)}...`);
      
      try {
        const { stdout } = await execa("npx", [
          "create-next-app@latest",
          appName,
          "--ts",
          "--tailwind",
          "--eslint",
          "--app", 
          "--src-dir",
          "--import-alias", "@/*",
          pmFlag
        ], { 
          stdio: ["ignore", "pipe", "pipe"],
          timeout: 180000 // 3 minutes timeout
        });
        
        // Verify the app was created successfully
        const isCreated = await verifyAppCreation();
        
        if (!isCreated) {
          throw new Error("Next.js app directory wasn't created properly despite command succeeding");
        }
        
        createAppSpinner.succeed(chalk.green(`Next.js app created successfully`));
        
        // Parse the output to extract useful information
        const dependencies = stdout.match(/dependencies:\n([\s\S]*?)(?:\n\n|$)/);
        const devDependencies = stdout.match(/devDependencies:\n([\s\S]*?)(?:\n\n|$)/);
        
        // Display the dependencies in a nicely formatted box
        if (dependencies || devDependencies) {
          console.log(boxen(
            `${chalk.bold(runGradient('Packages Installed'))}\n\n` +
            `${dependencies ? `${chalk.cyan('Dependencies:')}\n${chalk.dim(dependencies[1])}\n` : ''}` +
            `${devDependencies ? `${chalk.cyan('Dev Dependencies:')}\n${chalk.dim(devDependencies[1])}` : ''}`,
            { 
              padding: 1, 
              margin: 1, 
              borderStyle: 'round', 
              borderColor: 'green',
              title: '📦 Dependencies',
              titleAlignment: 'center'
            }
          ));
        }
      } catch (cmdError) {
        // If the command failed, try a different approach with fs-extra
        createAppSpinner.text = chalk.cyan(`First approach failed. Trying alternative method for ${chalk.bold(appName)}...`);
        
        // Create the base directory
        await fs.ensureDir(appDir);
        
        // Create package.json
        const basePackageJson = {
          name: appName,
          version: "0.1.0",
          private: true,
          scripts: {
            dev: "next dev",
            build: "next build",
            start: "next start",
            lint: "next lint"
          },
          dependencies: {
            next: "latest",
            react: "latest",
            "react-dom": "latest"
          },
          devDependencies: {
            typescript: "latest",
            "@types/node": "latest",
            "@types/react": "latest",
            "@types/react-dom": "latest",
            "@tailwindcss/postcss": "latest",
            "tailwindcss": "latest",
            "postcss": "latest",
            "autoprefixer": "latest",
            "eslint": "latest",
            "eslint-config-next": "latest"
          }
        };
        
        await fs.writeJson(path.join(appDir, 'package.json'), basePackageJson, { spaces: 2 });
        
        // Create basic Next.js structure
        await fs.ensureDir(path.join(appDir, 'app'));
        await fs.ensureDir(path.join(appDir, 'public'));
        
        // Create a basic page.tsx
        // Create a basic page.tsx - use showcase page if components are selected
        let pageTemplate;
        if (features.installComponents) {
          pageTemplate = templates.componentsShowcasePage;
        } else {
          pageTemplate = templates.pageContent(appName);
        }
        
        await fs.writeFile(path.join(appDir, 'app', 'page.tsx'), pageTemplate);
        
        // Create a basic layout.tsx
        const layoutContent = templates.layoutContent;
        
        await fs.writeFile(path.join(appDir, 'app', 'layout.tsx'), layoutContent);
        
        // Create minimal config files
        const nextConfigContent = templates.nextConfigContent;
        
        await fs.writeFile(path.join(appDir, 'next.config.js'), nextConfigContent);
        
        const tsConfigContent = templates.tsConfigContent;
        
        await fs.writeFile(path.join(appDir, 'tsconfig.json'), tsConfigContent);
        
        // Create PostCSS config
        const postcssConfigContent = templates.postcssConfigContent;
        await fs.writeFile(path.join(appDir, 'postcss.config.mjs'), postcssConfigContent);
        
        // Create the CSS file
        const globalCssContent = templates.globalCssContent;
        
        await fs.ensureDir(path.join(appDir, 'app'));
        await fs.writeFile(path.join(appDir, 'app', 'globals.css'), globalCssContent);
        
        createAppSpinner.succeed(chalk.green(`Created basic Next.js app structure manually`));
        
        console.log(boxen(
          `${chalk.bold(runGradient('Manual Setup Complete'))}\n\n` +
          `${chalk.cyan('Basic Next.js app structure created. You may need to run:')} \n\n` +
          `${chalk.dim(`${packageManager} install`)} \n\n` +
          `${chalk.cyan('to complete the setup after installation.')}`,
          { 
            padding: 1, 
            margin: 1, 
            borderStyle: 'round', 
            borderColor: 'yellow',
            title: '📦 Manual Setup',
            titleAlignment: 'center'
          }
        ));
      }
      
    } catch (error) {
      createAppSpinner.fail(chalk.red(`Failed to create Next.js app: ${error.message}`));
      
      // Show error details in a box
      console.error(boxen(
        chalk.red(`Error creating Next.js app:\n\n${error.message}\n\n${error.stderr || ''}`),
        { 
          padding: 1, 
          margin: 1, 
          borderStyle: 'round', 
          borderColor: 'red',
          title: '❌ Error',
          titleAlignment: 'center'
        }
      ));
      
      // Ask if the user wants to try the manual approach instead
      const { manualSetup } = await inquirer.prompt([
        {
          type: 'confirm',
          name: 'manualSetup',
          message: 'Would you like to try setting up the project manually?',
          default: true
        }
      ]);
      
      if (manualSetup) {
        createAppSpinner.text = chalk.cyan(`Setting up project manually...`);
        
        try {
          // Create the base directory
          await fs.ensureDir(appDir);
          
          // Create package.json
          const basePackageJson = {
            name: appName,
            version: "0.1.0",
            private: true,
            scripts: {
              dev: "next dev",
              build: "next build",
              start: "next start",
              lint: "next lint"
            },
            dependencies: {
              next: "latest",
              react: "latest",
              "react-dom": "latest"
            },
            devDependencies: {
              typescript: "latest",
              "@types/node": "latest",
              "@types/react": "latest",
              "@types/react-dom": "latest",
              "@tailwindcss/postcss": "latest",
              "tailwindcss": "latest",
              "postcss": "latest",
              "autoprefixer": "latest",
              "eslint": "latest",
              "eslint-config-next": "latest"
            }
          };
          
          await fs.writeJson(path.join(appDir, 'package.json'), basePackageJson, { spaces: 2 });
          
          // Create basic Next.js structure
          await fs.ensureDir(path.join(appDir, 'app'));
          await fs.ensureDir(path.join(appDir, 'public'));
          
          // Create a basic page.tsx
          // Create a basic page.tsx - use showcase page if components are selected
          let pageTemplate;
          if (features.installComponents) {
            pageTemplate = templates.componentsShowcasePage;
          } else {
            pageTemplate = templates.pageContent(appName);
          }
          
          await fs.writeFile(path.join(appDir, 'app', 'page.tsx'), pageTemplate);
          
          // Create a basic layout.tsx
          const layoutContent = templates.layoutContent;
          
          await fs.writeFile(path.join(appDir, 'app', 'layout.tsx'), layoutContent);
          
          // Create minimal config files
          const nextConfigContent = templates.nextConfigContent;
          
          await fs.writeFile(path.join(appDir, 'next.config.js'), nextConfigContent);
          
          const tsConfigContent = templates.tsConfigContent;
          
          await fs.writeFile(path.join(appDir, 'tsconfig.json'), tsConfigContent);
          
          // Create PostCSS config
          const postcssConfigContent = templates.postcssConfigContent;
          await fs.writeFile(path.join(appDir, 'postcss.config.mjs'), postcssConfigContent);
          
          // Create the CSS file
          const globalCssContent = templates.globalCssContent;
          
          await fs.ensureDir(path.join(appDir, 'app'));
          await fs.writeFile(path.join(appDir, 'app', 'globals.css'), globalCssContent);
          
          createAppSpinner.succeed(chalk.green(`Created basic Next.js app structure manually`));
          
        } catch (manualError) {
          createAppSpinner.fail(chalk.red(`Failed to set up project manually: ${manualError.message}`));
          throw new Error("Failed to create Next.js app manually");
        }
      } else {
        throw new Error("Failed to create Next.js app");
      }
    }
    
    spinner.succeed(chalk[currentTheme.accent](`${steps[0]} complete`));

    // Check if the directory exists before trying to change into it
    try {
      // Verify the project directory exists before changing to it
      if (!fs.existsSync(appDir)) {
        throw new Error(`Project directory ${appDir} was not created properly. Cannot proceed.`);
      }
      
      // Check if critical files exist in the directory
      const requiredFiles = ['package.json'];
      const missingFiles = requiredFiles.filter(file => !fs.existsSync(path.join(appDir, file)));
      
      if (missingFiles.length > 0) {
        throw new Error(`Project directory ${appDir} is missing critical files: ${missingFiles.join(', ')}. Cannot proceed.`);
      }
      
      // Try to change to the project directory
      process.chdir(appDir);
      console.log(chalk.green(`✓ Changed to directory: ${appDir}`));
    } catch (dirError) {
      spinner.fail(chalk.red(`Failed to access project directory: ${dirError.message}`));
      console.error(boxen(
        chalk.red(`There was an error accessing the project directory at ${appDir}.\n\nThis could be due to permission issues or the directory wasn't created properly.`),
        { 
          padding: 1, 
          margin: 1, 
          borderStyle: 'round', 
          borderColor: 'red',
          title: '❌ Directory Error',
          titleAlignment: 'center'
        }
      ));
      
      // Ask the user what they want to do
      const { dirAction } = await inquirer.prompt([
        {
          type: 'list',
          name: 'dirAction',
          message: 'How would you like to proceed?',
          choices: [
            { name: 'Create directory manually and continue', value: 'create-manual' },
            { name: 'Try again from the beginning', value: 'retry' },
            { name: 'Exit', value: 'exit' }
          ]
        }
      ]);
      
      if (dirAction === 'create-manual') {
        try {
          // Call the manual setup function to create project structure
          const success = await setupProjectManually(appName, appDir, packageManager);
          
          if (success) {
            // Verify the directory exists again before attempting to change to it
            if (fs.existsSync(appDir)) {
              process.chdir(appDir);
              console.log(chalk.green(`✓ Changed to directory: ${appDir}`));
            } else {
              throw new Error(`Directory ${appDir} still cannot be accessed after manual creation.`);
            }
          } else {
            throw new Error(`Manual setup failed. Cannot continue.`);
          }
        } catch (createError) {
          console.error(chalk.red(`Failed to create directory: ${createError.message}`));
          throw new Error(`Cannot continue without a valid project directory.`);
        }
      } else if (dirAction === 'retry') {
        return run();
      } else {
        process.exit(1);
      }
    }

    // Add pnpm configuration to package.json
    if (packageManager === "pnpm") {
      try {
        const pkgJsonPath = path.join(process.cwd(), 'package.json');
        const pkgJson = await fs.readJSON(pkgJsonPath);
        
        // Add pnpm configuration with onlyBuiltDependencies directly in package.json
        pkgJson.pnpm = {
          ...pkgJson.pnpm,
          onlyBuiltDependencies: [
            "sharp",
            "@prisma/engines",
            "prisma",
            "@prisma/client",
            "esbuild",
            "next-auth", 
            "next-themes"
          ]
        };
        
        await fs.writeJSON(pkgJsonPath, pkgJson, { spaces: 2 });
      } catch (pkgJsonError) {
        spinner.warn(chalk.yellow(`Could not update package.json with pnpm configuration: ${pkgJsonError.message}`));
      }
    }

    // Create components and lib folders to speed up shadcn setup
    fs.mkdirSync("components/ui", { recursive: true });
    fs.mkdirSync("lib", { recursive: true });
    
    // Step 2: Install dependencies
    updateProgress(`${steps[1]}...`);
    
    const installCmd = packageManager;
    let installOutput = '';
    
    // Fast mode implementation
    if (features.fastMode) {
      try {
        // Enable performance optimizations
        const { 
          installDependenciesConcurrently,
          installShadcnComponentsBatch,
          setupFilesOptimized
        } = await optimizeSetup(packageManager);
        
        // Show a box to indicate fast mode installation
        console.log(boxen(
          `${chalk.bold(runGradient('Fast Mode Enabled'))}\n\n` +
          `${chalk.dim('Installing packages with')} ${chalk.cyan(packageManager)} ${chalk.dim('(10x faster)')}\n` +
          `${chalk.dim('Optimized for performance...')}`,
          { 
            padding: 1, 
            margin: 1, 
            borderStyle: 'round', 
            borderColor: currentTheme.secondary,
            title: '⚡ Fast Mode',
            titleAlignment: 'center'
          }
        ));
        
        // Use optimized functions for installation
        updateProgress(`Installing dependencies (fast mode)...`);
        await installDependenciesConcurrently(['react', 'react-dom', 'next', 'next-themes']);
        spinner.succeed(chalk[currentTheme.accent](`Core dependencies installed`));
        
        // Enhanced component installation if needed
        if (features.installComponents && selectedComponents && selectedComponents.length > 0) {
          updateProgress(`Installing Components System (fast mode)...`);
          
          console.log(boxen(
            `${chalk.bold(runGradient('Installing Components'))}\n\n` +
            `${chalk.dim('Installing:')} ${chalk.cyan(selectedComponents.length)} ${chalk.dim('components')}\n` +
            `${chalk.dim('Method:')} ${chalk.cyan('Optimized batch installation')}`,
            { 
              padding: 1, 
              margin: 1, 
              borderStyle: 'round', 
              borderColor: currentTheme.secondary,
              title: '🧩 Components',
              titleAlignment: 'center'
            }
          ));
          
          // First make sure lib and components directories exist
          await fs.ensureDir('lib');
          await fs.ensureDir('components/ui');
          
          // Create utils.ts if it doesn't exist
          if (!fs.existsSync('lib/utils.ts')) {
            const utilsContent = templates.utilsContent;
            await fs.writeFile('lib/utils.ts', utilsContent);
          }
          
          // Create components.json configuration
          const componentsJson = {
            "$schema": "https://ui.shadcn.com/schema.json",
            "style": "default",
            "rsc": true,
            "tsx": true,
            "tailwind": {
              "config": "tailwind.config.ts",
              "css": "app/globals.css",
              "baseColor": "slate",
              "cssVariables": true
            },
            "aliases": {
              "components": "@/components",
              "utils": "@/lib/utils"
            }
          };
          
          await fs.writeFile('components.json', JSON.stringify(componentsJson, null, 2));
          
          // Install components using the optimized batch function
          await installShadcnComponentsBatch(selectedComponents);
          spinner.succeed(chalk[currentTheme.accent](`Components installed successfully`));
        }
        
        // Display the fast installation results
        console.log(boxen(
          `${chalk.bold(runGradient('Fast Mode Installation Complete'))}\n\n` +
          `${chalk.green('✓')} ${chalk.bold('Installed with:')} ${chalk.cyan(packageManager)} (optimized)\n` +
          `${chalk.green('✓')} ${chalk.bold('Core dependencies:')} next, react, react-dom\n` +
          `${chalk.green('✓')} ${chalk.bold('UI dependencies:')} installed in batches\n`,
          { 
            padding: 1, 
            margin: 1, 
            borderStyle: 'round', 
            borderColor: 'green',
            title: '✅ Fast Installation Success',
            titleAlignment: 'center'
          }
        ));
        
        spinner.succeed(chalk[currentTheme.accent](`${steps[1]} complete (fast mode)`));
        
        // Skip to step 3 since we've handled dependencies
        updateProgress(`${steps[2]}...`);
        
      } catch (fastModeError) {
        spinner.warn(chalk.yellow(`Fast mode installation failed, falling back to standard installation: ${fastModeError.message}`));
        // Continue with standard installation below
      }
    } 
    
    // Only run standard installation if fast mode is disabled or failed
    if (!features.fastMode || installOutput === '') {
      try {
        // Show a box to indicate installation has started
        console.log(boxen(
          `${chalk.bold(runGradient('Installing Dependencies'))}\n\n` +
          `${chalk.dim('Installing packages with')} ${chalk.cyan(packageManager)}\n` +
          `${chalk.dim('This may take a moment...')}`,
          { 
            padding: 1, 
            margin: 1, 
            borderStyle: 'round', 
            borderColor: currentTheme.secondary,
            title: '📦 Dependencies',
            titleAlignment: 'center'
          }
        ));
        
        // ... rest of existing code ...
        
        // [The rest of the original installation code follows here]
        // Install core dependencies first
        const coreDeps = [
          "class-variance-authority",
          "clsx",
          "tailwind-merge",
          "lucide-react",
          "tailwindcss-animate"
        ];
        
        const addCmd = packageManager === "npm" ? "install" : "add";
        await execa(installCmd, [addCmd, ...coreDeps], { stdio: "inherit" });
        
        // Try installing with the selected package manager
        const mainDepsPromise = execa(installCmd, 
          packageManager === "pnpm" ? ["install", "--prefer-offline"] : 
          packageManager === "yarn" ? ["install", "--prefer-offline"] :
          ["install"], 
          { stdio: "pipe" }  // Capture the output instead of inheriting stdio
        );
        
        // Capture the installation output
        mainDepsPromise.stdout.on('data', (data) => {
          installOutput += data.toString();
        });
        
        mainDepsPromise.stderr.on('data', (data) => {
          installOutput += data.toString();
        });
        
        await mainDepsPromise;
        
        // Display the installation results in a boxen box
        console.log(boxen(
          `${chalk.bold(runGradient('Dependency Installation Complete'))}\n\n` +
          `${chalk.green('✓')} ${chalk.bold('Installed with:')} ${chalk.cyan(packageManager)}\n` +
          `${chalk.green('✓')} ${chalk.bold('Core dependencies:')} next, react, react-dom\n` +
          `${chalk.green('✓')} ${chalk.bold('Dev dependencies:')} typescript, tailwindcss, etc.\n` +
          `${chalk.green('✓')} ${chalk.bold('UI dependencies:')} lucide-react\n`,
          { 
            padding: 1, 
            margin: 1, 
            borderStyle: 'round', 
            borderColor: 'green',
            title: '✅ Installation Success',
            titleAlignment: 'center'
          }
        ));
      } catch (installError) {
        // ... existing error handling code ...
        // If pnpm fails, fallback to npm
        if (packageManager === "pnpm") {
          spinner.warn(chalk.yellow("pnpm installation failed, falling back to npm..."));
          
          try {
            // Capture npm installation output
            const npmInstallPromise = execa("npm", ["install"], { stdio: "pipe" });
            npmInstallPromise.stdout.on('data', (data) => {
              installOutput += data.toString();
            });
            
            npmInstallPromise.stderr.on('data', (data) => {
              installOutput += data.toString();
            });
            
            await npmInstallPromise;
            
            const npmLucidePromise = execa("npm", ["install", "lucide-react"], { stdio: "pipe" });
            npmLucidePromise.stdout.on('data', (data) => {
              installOutput += data.toString();
            });
            
            npmLucidePromise.stderr.on('data', (data) => {
              installOutput += data.toString();
            });
            
            await npmLucidePromise;
            
            packageManager = "npm"; // Switch to npm for the rest of the setup
            
            // Display the fallback installation results
            console.log(boxen(
              `${chalk.bold(runGradient('Dependency Installation Complete'))}\n\n` +
              `${chalk.yellow('!')} ${chalk.bold('Fallback to:')} ${chalk.cyan('npm')} (pnpm failed)\n` +
              `${chalk.green('✓')} ${chalk.bold('Core dependencies:')} next, react, react-dom\n` +
              `${chalk.green('✓')} ${chalk.bold('Dev dependencies:')} typescript, tailwindcss, etc.\n` +
              `${chalk.green('✓')} ${chalk.bold('UI dependencies:')} lucide-react\n`,
              { 
                padding: 1, 
                margin: 1, 
                borderStyle: 'round', 
                borderColor: 'yellow',
                title: '✅ Installation Success (Fallback)',
                titleAlignment: 'center'
              }
            ));
            
          } catch (npmError) {
            throw new Error(`Failed to install dependencies with pnpm and npm. Please try again later.\nOriginal error: ${installError.message}`);
          }
        } else {
          // Re-throw the error for other package managers
          throw installError;
        }
      }
    }
    
    // ... rest of the code ...
    
    // After Step 5 (around line 1460), add:
    
    // Step 6 (optional): Setup Next Auth with MongoDB
    if (features.auth) {
      updateProgress(`Setting up NextAuth with MongoDB...`);
      await setupNextAuth(appDir);
      spinner.succeed(chalk[currentTheme.accent](`NextAuth setup complete`));
    }
    
    // Step 7 (optional): Setup Prisma with MongoDB
    if (features.prisma) {
      updateProgress(`Setting up Prisma with MongoDB...`);
      await setupPrisma(appDir);
      spinner.succeed(chalk[currentTheme.accent](`Prisma setup complete`));
      
      // Create .env file with all required variables including DB_URL
      updateProgress(`Creating MongoDB environment variables...`);
      await createEnvFile(appDir);
      spinner.succeed(chalk[currentTheme.accent](`MongoDB environment files created`));
    }
    
    // Step 8: Fix TypeScript errors for compatibility
    updateProgress(`Fixing TypeScript configurations...`);
    await fixTypeScriptErrors(appDir);
    spinner.succeed(chalk[currentTheme.accent](`TypeScript configurations fixed`));
    
    spinner.succeed(chalk[currentTheme.accent](`${steps[1]} complete`));

    // Step 3: Set up shadcn
    updateProgress(`${steps[2]}...`);
    
    try {
      // Use the official shadcn CLI initialization for the core UI components
      spinner.text = chalk[currentTheme.secondary]('Initializing Components System...');
      
      // Create a components.json directly instead of running interactive prompt
      const componentsJson = {
        "$schema": "https://ui.shadcn.com/schema.json",
        "style": "default",
        "rsc": true,
        "tsx": true,
        "tailwind": {
          "config": "tailwind.config.ts",
          "css": "app/globals.css",
          "baseColor": "slate",
          "cssVariables": true
        },
        "aliases": {
          "components": "@/components",
          "utils": "@/lib/utils"
        }
      };
      
      await fs.writeFile('components.json', JSON.stringify(componentsJson, null, 2));
      
      // Create a unified box with progress bar for component installation
      if (features.installComponents && selectedComponents.length > 0) {
        // First install the utils
        await fs.ensureDir('lib');
        const utilsContent = templates.utilsContent;
        await fs.writeFile('lib/utils.ts', utilsContent);
        
        // Create a new progress bar just for components
        const componentProgressBar = new cliProgress.SingleBar({
          format: `${chalk.cyan('Component')} ${chalk.dim('|')} ${chalk[currentTheme.secondary]('{bar}')} ${chalk.dim('|')} ${chalk.bold('{percentage}%')} ${chalk.dim('•')} ${chalk.white('{value}/{total}')} ${chalk.cyan('{component}')}`,
          barCompleteChar: "█",
          barIncompleteChar: "░",
          hideCursor: true,
          clearOnComplete: true,
          barsize: 25
        });
        
        // Create a box for the component installation process
        console.log(boxen(
          `${chalk.bold(runGradient('Installing UI Components'))}\n\n` +
          `${chalk.dim('Installing the following components:')}\n` +
          `${chalk.cyan(selectedComponents.join(', '))}\n`,
          { 
            padding: 1, 
            margin: 1, 
            borderStyle: 'round', 
            borderColor: currentTheme.secondary,
            title: '🧩 Components System',
            titleAlignment: 'center'
          }
        ));
        
        // Start the component progress bar
        componentProgressBar.start(selectedComponents.length, 0, { component: 'Starting...' });
        
        // Install each component using shadcn add with non-interactive flags
        let installedCount = 0;
        let skippedComponents = [];
        let failedComponents = [];
        
        for (const component of selectedComponents) {
          componentProgressBar.update(installedCount, { component });
          
          try {
            // Capture the output instead of sending to stdout
            const { stdout, stderr } = await execa("npx", ["shadcn@latest", "add", component, "--yes", "--cwd", "."], { 
              stdio: "pipe",
              env: { ...process.env, FORCE_COLOR: "1", CI: "true" } // Force non-interactive mode
            });
            
            installedCount++;
            componentProgressBar.update(installedCount, { component: `${component} ✓` });
            
            // Check for skipped files
            if (stdout.includes('Skipped') || stderr.includes('Skipped')) {
              skippedComponents.push(component);
            }
            
            // Small delay to make progress visible
            await new Promise(resolve => setTimeout(resolve, 200));
            
          } catch (componentError) {
            try {
              // Alternative method with direct non-interactive options
              await execa("npx", ["shadcn@latest", "add", component, "--yes", "--cwd", "."], { 
                stdio: "pipe",
                env: { ...process.env, FORCE_COLOR: "1", CI: "true", NEXT_SHADCN_SKIP_QUESTIONS: "1" } // Set additional env vars to force non-interactive
              });
              
              installedCount++;
              componentProgressBar.update(installedCount, { component: `${component} ✓` });
              
            } catch (altError) {
              failedComponents.push(component);
              installedCount++;
              componentProgressBar.update(installedCount, { component: `${component} ✗` });
            }
          }
        }
        
        // Stop the component progress bar
        componentProgressBar.stop();
        
        // Show summary of installation
        console.log(boxen(
          `${chalk.bold(runGradient('Component Installation Summary'))}\n\n` +
          `${chalk.green('✓')} ${chalk.bold('Installed:')} ${selectedComponents.length - failedComponents.length} components\n` +
          `${failedComponents.length > 0 ? `${chalk.red('✗')} ${chalk.bold('Failed:')} ${failedComponents.join(', ')}\n` : ''}` +
          `${skippedComponents.length > 0 ? `${chalk.yellow('!')} ${chalk.bold('Skipped files:')} Some files were skipped (already exist)\n` : ''}`,
          { 
            padding: 1, 
            margin: 1, 
            borderStyle: 'round', 
            borderColor: failedComponents.length > 0 ? 'yellow' : 'green',
            title: '📋 Components System Summary',
            titleAlignment: 'center'
          }
        ));
      }
    } catch (err) {
      spinner.warn(chalk.yellow(`Error setting up Components System: ${err.message}. Will try to continue anyway.`));
    }
    
    spinner.succeed(chalk[currentTheme.accent](`${steps[2]} complete`));

    // Step 4: Create .env file
    updateProgress(`${steps[3]}...`);
    await fs.writeFile(".env", "NEXT_PUBLIC_EXAMPLE=filip-app\n");
    
    // Always create a README.md with the project's features
    const readmePath = path.join(process.cwd(), 'README.md');
    const readmeContent = templates.readmeContent(appName);
    await fs.writeFile(readmePath, readmeContent);
    spinner.succeed(chalk[currentTheme.accent](`${steps[3]} complete`));

    // Step 5 (optional): Setup theme switcher
    if (features.themeSwitch) {
      updateProgress(`${steps[4]}...`);
      
      try {
      // Create the ThemeProvider component
      const themeProviderDir = path.join(process.cwd(), 'components/theme');
      fs.mkdirSync(themeProviderDir, { recursive: true });
      
      // Create theme-provider.tsx directly
      const themeProviderPath = path.join(themeProviderDir, 'theme-provider.tsx');
        const themeProviderContent = templates.themeProviderContent;
        await fs.writeFile(themeProviderPath, themeProviderContent);

      // Create ThemeToggle component directly
      const themeTogglePath = path.join(themeProviderDir, 'theme-toggle.tsx');
        const themeToggleContent = templates.themeToggleContent;
      await fs.writeFile(themeTogglePath, themeToggleContent);
      
      // Update the layout.tsx file to include the ThemeProvider
      const layoutPath = path.join(process.cwd(), 'app/layout.tsx');
      try {
        let layoutContent = await fs.readFile(layoutPath, 'utf8');
        
          // Add the ThemeProvider import if it doesn't exist
        if (!layoutContent.includes('import { ThemeProvider }')) {
            layoutContent = `import { ThemeProvider } from "@/components/theme/theme-provider"\n${layoutContent}`;
          }
          
          // Update the body tag to include ThemeProvider
          if (!layoutContent.includes('<ThemeProvider')) {
            // Use a regex pattern that's more robust for finding the body tag
            const bodyPattern = /<body[^>]*>([\s\S]*?)<\/body>/;
            const bodyMatch = layoutContent.match(bodyPattern);
            
            if (bodyMatch) {
              const bodyTag = bodyMatch[0];
              const bodyContent = bodyMatch[1];
              
              // Extract class names if they exist
              const classNameMatch = bodyTag.match(/className=["']([^"']*)["']/);
              const className = classNameMatch ? classNameMatch[1] : '';
              
              // Create the replacement with ThemeProvider
              const newBodyTag = `<body${className ? ` className="${className}"` : ''}>
      <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>${bodyContent}</ThemeProvider>
    </body>`;
              
              // Replace the body tag in the layout content
              layoutContent = layoutContent.replace(bodyPattern, newBodyTag);
          } else {
              // If we can't find the body tag with regex, just insert at a safe position
              spinner.warn(chalk.yellow("Could not find body tag in layout.tsx. Theme provider might not be properly inserted."));
            }
          }
          
          await fs.writeFile(layoutPath, layoutContent);
          
          // Show success message
        console.log(boxen(
            `${chalk.bold(gradient(['#2E3192', '#1BFFFF'])('Theme Provider Added'))}\n\n` +
            `${chalk.green('✓')} Updated layout.tsx with ThemeProvider\n` +
            `${chalk.green('✓')} Dark mode is now available\n` +
            `${chalk.green('✓')} Theme will respect system preferences\n` +
            `${chalk.green('✓')} Use ThemeToggle component to allow users to switch themes`,
          { 
            padding: 1, 
            margin: 1, 
            borderStyle: 'round', 
              borderColor: 'blue',
              title: '🌙 Theme Ready',
            titleAlignment: 'center'
          }
        ));
      } catch (error) {
          spinner.warn(chalk.yellow(`Error updating layout file with ThemeProvider: ${error.message}`));
        }
        
        // Install next-themes
        spinner.text = chalk[currentTheme.secondary]('Installing next-themes package...');
        const addCmd = packageManager === "npm" ? "install" : "add";
        await execa(installCmd, [addCmd, "next-themes"], { stdio: "inherit" });
        
        spinner.succeed(chalk[currentTheme.accent](`${steps[currentStep]} complete`));
        updateProgress(features.installComponents || features.includeDocs || features.responsive ? steps[currentStep] : "Finishing up...");
      } catch (error) {
        spinner.fail(chalk.red(`Failed to set up theme switcher: ${error.message}`));
        console.error(boxen(
          chalk.red(`Error setting up theme switcher:\n\n${error.message}`),
        { 
          padding: 1, 
          margin: 1, 
          borderStyle: 'round', 
            borderColor: 'red',
            title: '❌ Error',
          titleAlignment: 'center'
        }
      ));
      }
    }

    // Step for Auth setup (if enabled)
    if (features.auth) {
      updateProgress(`${steps[currentStep]}...`);
      
      // Create auth directory structure
      const authDir = path.join(process.cwd(), 'components/auth');
      fs.mkdirSync(authDir, { recursive: true });
      
      // Create auth-provider component
      const authProviderContent = `"use client"

import { SessionProvider } from "next-auth/react"

export function AuthProvider({ children }) {
  return <SessionProvider>{children}</SessionProvider>
}`;
      
      await fs.writeFile(path.join(authDir, 'auth-provider.tsx'), authProviderContent);
      
      // Update layout to include AuthProvider
      try {
        const layoutPath = path.join(process.cwd(), 'app/layout.tsx');
        let layoutContent = await fs.readFile(layoutPath, 'utf8');
        
        // Add import for AuthProvider
        if (!layoutContent.includes('import { AuthProvider }')) {
          layoutContent = 
            `import { AuthProvider } from "@/components/auth/auth-provider"\n` + 
            layoutContent;
        }
        
        // Add AuthProvider inside ThemeProvider if it exists, otherwise directly in body
        const themeProviderPattern = /<ThemeProvider([^>]*?)>([\s\S]*?)<\/ThemeProvider>/;
        const bodyPattern = /<body[^>]*>([\s\S]*?)<\/body>/;
        
        if (layoutContent.includes('<ThemeProvider')) {
          const themeProviderMatch = layoutContent.match(themeProviderPattern);
          
          if (themeProviderMatch) {
            const themeProviderProps = themeProviderMatch[1];
            const themeProviderContent = themeProviderMatch[2];
            
            // Create the replacement with AuthProvider inside ThemeProvider
            const newThemeProvider = `<ThemeProvider${themeProviderProps}>
        <AuthProvider>${themeProviderContent}</AuthProvider>
      </ThemeProvider>`;
            
            // Replace the ThemeProvider in the layout content
            layoutContent = layoutContent.replace(themeProviderPattern, newThemeProvider);
          }
        } else {
          // If no ThemeProvider, add AuthProvider directly inside body
          const bodyMatch = layoutContent.match(bodyPattern);
          
          if (bodyMatch) {
            const bodyTag = bodyMatch[0];
            const bodyContent = bodyMatch[1];
            
            // Extract class names if they exist
            const classNameMatch = bodyTag.match(/className=["']([^"']*)["']/);
            const className = classNameMatch ? classNameMatch[1] : '';
            
            // Create the replacement with AuthProvider
            const newBodyTag = `<body${className ? ` className="${className}"` : ''}>
      <AuthProvider>${bodyContent}</AuthProvider>
    </body>`;
            
            // Replace the body tag in the layout content
            layoutContent = layoutContent.replace(bodyPattern, newBodyTag);
          } else {
            // If we can't find the body tag with regex, just insert at a safe position
            spinner.warn(chalk.yellow("Could not find body tag in layout.tsx. Auth provider might not be properly inserted."));
          }
        }
        
        await fs.writeFile(layoutPath, layoutContent);
        
        // Show success message
      console.log(boxen(
          `${chalk.bold(gradient(['#42a5f5', '#1976d2'])('Auth Provider Added'))}\n\n` +
          `${chalk.green('✓')} Updated layout.tsx with AuthProvider\n` +
          `${chalk.green('✓')} Next-Auth is now available\n` +
          `${chalk.green('✓')} Session management is ready\n` +
          `${chalk.green('✓')} See docs for login setup details`,
        { 
          padding: 1, 
          margin: 1, 
          borderStyle: 'round', 
            borderColor: 'blue',
            title: '🔒 Auth Ready',
          titleAlignment: 'center'
        }
      ));
      } catch (error) {
        spinner.warn(chalk.yellow(`Error updating layout file with AuthProvider: ${error.message}`));
      }
      
      // Install next-auth
      spinner.text = chalk[currentTheme.secondary]('Installing Next-Auth package...');
      const addCmd = packageManager === "npm" ? "install" : "add";
      await execa(installCmd, [addCmd, "next-auth"], { stdio: "inherit" });
      
      spinner.succeed(chalk[currentTheme.accent](`${steps[currentStep]} complete`));
      updateProgress(features.installComponents || features.includeDocs || features.responsive ? steps[currentStep] : "Finishing up...");
    }

    // ✅ Done
    // Ensure progress bar reaches 100% at the end
    updateProgress("Installation complete!", steps.length - currentStep);
    progressBar.stop();
    spinner.stop();
    
    const startCmd = packageManager === "npm" ? "npm run dev" : 
                    packageManager === "yarn" ? "yarn dev" : 
                    "pnpm dev";
    
    // Clear any lingering progress bar artifacts
    console.log("\n");
    
    // Create a more visually appealing success message
    console.log("\n");
    console.log(boxen(
      `${chalk.bold(runGradient('✨ Your Filip App is Ready! ✨'))}\n\n` +
      `${chalk.bold('Project:')} ${chalk.cyan(appName)}\n` +
      `${chalk.bold('Location:')} ${chalk.cyan(appDir)}\n` +
      `${chalk.bold('Package Manager:')} ${chalk.cyan(packageManager)}\n\n` +
      `${chalk.bold('✓ Features Installed:')}\n` +
      `${features.installComponents ? `  ${chalk.green('→')} ${chalk.bold('UI Components:')} ${chalk.dim(selectedComponents.length)} components\n` : ''}` +
      `${features.themeSwitch ? `  ${chalk.green('→')} ${chalk.bold('Theme Switcher')} ${chalk.dim('(try it at /theme-demo)')}\n` : ''}` +
      `${features.prisma ? `  ${chalk.green('→')} ${chalk.bold('Prisma Database')} ${chalk.dim('(check prisma/schema.prisma)')}\n` : ''}` +
      `${features.auth ? `  ${chalk.green('→')} ${chalk.bold('Authentication')} ${chalk.dim('(check /auth/signin)')}\n` : ''}` +
      `${features.responsive ? `  ${chalk.green('→')} ${chalk.bold('Responsive Layout')}\n` : ''}` +
      `\n${chalk.bold('To start developing:')}\n` +
      `  ${chalk.cyan('1.')} cd ${appName}\n` +
      `  ${chalk.cyan('2.')} ${startCmd}\n\n` +
      `${chalk.cyan('➜')} Your app will be available at: ${chalk.bold('http://localhost:3000')}`,
      { 
        padding: 1, 
        margin: 1, 
        borderStyle: 'round', 
        borderColor: 'green', 
        title: '🎉 Success',
        titleAlignment: 'center'
      }
    ));
    
    // Show the original three options
    const { nextAction } = await inquirer.prompt([
      {
        type: 'list',
        name: 'nextAction',
        message: 'What would you like to do next?',
        pageSize: 6, // Updated page size for the new option
        loop: true,  // Enable looping through options
        choices: [
          { 
            name: `${chalk.bold('🚀 Create another app')}`, 
            value: 'restart'
          },
          { 
            name: `${chalk.bold('📂 Open the project')}  ${chalk.dim('(and run dev server)')}`, 
            value: 'open-dir-dev'
          },
          { 
            name: `${chalk.bold('💻 Open in VS Code')}  ${chalk.dim('(in a new window)')}`, 
            value: 'vscode'
          },
          { 
            name: `${chalk.bold('🛠️ Try alternate VS Code')}  ${chalk.dim('(code-insiders, vscodium)')}`, 
            value: 'vscode-alt'
          },
          { 
            name: `${chalk.bold('🔨 VS Code + Dev Server')}  ${chalk.dim('(code and run)')}`, 
            value: 'vscode-dev'
          },
          { 
            name: `${chalk.bold('👋 Exit')}`, 
            value: 'exit'
          }
        ]
      }
    ]);
    
    if (nextAction === 'restart') {
      return run();
    } else if (nextAction === 'vscode-alt') {
      // Try alternate VS Code commands
      console.log(`\n${chalk.cyan('Trying alternative VS Code commands...')}`);
      
      const vscodeCommands = ['code', 'code-insiders', 'codium', 'vscodium'];
      let vsOpened = false;
      
      for (const cmd of vscodeCommands) {
        try {
          console.log(`${chalk.dim('Trying')} ${cmd}...`);
          await execa(cmd, ['--new-window', appDir]);
          console.log(`\n${chalk.green('✓')} Project opened with ${cmd}`);
          vsOpened = true;
          break;
        } catch (err) {
          continue;
        }
      }
      
      if (!vsOpened) {
        console.log(chalk.yellow(`\nUnable to open with any VS Code variant.`));
        
        // Offer alternative options if all VS Code variants fail
        const { fallbackAction } = await inquirer.prompt([
          {
            type: 'list',
            name: 'fallbackAction',
            message: 'Would you like to try something else?',
            choices: [
              { name: 'Open project directory', value: 'open-dir' },
              { name: 'Start development server', value: 'dev-only' },
              { name: 'Continue without opening', value: 'continue' }
            ]
          }
        ]);
        
        if (fallbackAction === 'open-dir') {
          openProjectDirectory(appDir);
        } else if (fallbackAction === 'dev-only') {
          startDevServer(appDir, startCmd);
        }
      } else {
        // Ask if they want to start the development server
        const { startDev } = await inquirer.prompt([
          {
            type: 'confirm',
            name: 'startDev',
            message: 'Would you like to start the development server?',
            default: true
          }
        ]);
        
        if (startDev) {
          startDevServer(appDir, startCmd);
        } else {
          console.log(`\n${chalk.cyan('➜')} To start the development server later, run:`);
          console.log(`  ${chalk.dim(`cd ${appName}`)}`);
          console.log(`  ${chalk.dim(`${startCmd}`)}\n`);
        }
      }
      
      console.log(runGradient('Happy coding! 🚀\n'));
    } else if (nextAction === 'vscode' || nextAction === 'vscode-dev') {
      // Keep the existing VS Code handling code
      try {
        console.log(`\n${chalk.cyan('Opening VS Code...')}`);
        
        // Use the --new-window flag to ensure it opens in a new window
        const command = os.platform() === 'win32' ? 'code.cmd' : 'code';
        spawn(command, ['--new-window', appDir], { stdio: 'ignore' });
        
        console.log(`\n${chalk.green('✓')} Project opened in VS Code`);
        
        // If vscode-dev option was selected, also start the dev server
        if (nextAction === 'vscode-dev') {
          // Start an animated loading spinner for the dev server
          const devSpinner = ora({
            text: chalk.cyan('Starting development server...'),
            color: 'cyan',
            spinner: 'dots'
          }).start();
          
          // Wait a moment for VS Code to open
          await new Promise(resolve => setTimeout(resolve, 1500));
          
          let serverStarted = false;
          
          // Start dev server in a new terminal
          try {
            if (os.platform() === 'win32') {
              // Windows approach with better shell settings
              spawn('cmd.exe', ['/c', 'start', 'cmd.exe', '/k', `cd /d "${appDir}" && ${startCmd}`], { 
                cwd: appDir,
                stdio: 'ignore',
                shell: true,
                windowsHide: false
              });
              serverStarted = true;
            } else if (os.platform() === 'darwin') {
              // macOS approach with proper path escaping
              spawn('osascript', [
                '-e', 
                `tell application "Terminal" to do script "cd '${appDir.replace(/'/g, "\\'")}' && ${startCmd}"`
              ], { stdio: 'ignore' });
              serverStarted = true;
            } else {
              // Linux approach with better terminal detection
              const terminals = ['gnome-terminal', 'konsole', 'xterm', 'xfce4-terminal', 'terminator'];
              for (const terminal of terminals) {
                try {
                  spawn(terminal, ['--', 'bash', '-c', `cd "${appDir.replace(/"/g, '\\"')}" && ${startCmd}; exec bash`], {
                    stdio: 'ignore',
                    cwd: appDir
                  });
                  serverStarted = true;
                  break;
  } catch (error) {
                  continue;
                }
              }
            }
          } catch (error) {
            console.error(chalk.red(`Error starting development server: ${error.message}`));
          }
          
          devSpinner.stop();
          
          if (serverStarted) {
            console.log(`${chalk.green('✓')} Development server started`);
            console.log(`\n${chalk.cyan('➜')} Your application will be available at: ${chalk.bold('http://localhost:3000')}\n`);
          } else {
            console.log(chalk.yellow(`\nCouldn't start development server automatically. To start it manually:`));
            console.log(`  ${chalk.dim(`cd ${appName}`)}`);
            console.log(`  ${chalk.dim(`${startCmd}`)}\n`);
            
            // Offer alternative options
            const { alternateAction } = await inquirer.prompt([
              {
                type: 'list',
                name: 'alternateAction',
                message: 'Would you like to try something else?',
                choices: [
                  { name: 'Open project directory', value: 'open-dir' },
                  { name: 'Try VS Code again', value: 'vscode-retry' },
                  { name: 'Continue without opening', value: 'continue' }
                ]
              }
            ]);
            
            if (alternateAction === 'open-dir') {
              openProjectDirectory(appDir);
            } else if (alternateAction === 'vscode-retry') {
              // Try a different approach to open VS Code
              try {
                await execa('code', [appDir], { stdio: 'inherit' });
                console.log(`\n${chalk.green('✓')} Project opened in VS Code using alternate method`);
              } catch (altError) {
                console.log(chalk.yellow(`\nStill unable to open VS Code. Please open it manually and then open the project at: ${appDir}`));
              }
            }
          }
        } else {
          console.log(`\n${chalk.cyan('➜')} To start the development server, run:`);
          console.log(`  ${chalk.dim(`cd ${appName}`)}`);
          console.log(`  ${chalk.dim(`${startCmd}`)}\n`);
        }
        
        console.log(runGradient('Happy coding! 🚀\n'));
      } catch (error) {
        console.log(chalk.yellow(`\nCouldn't open VS Code. Please make sure it's installed and in your PATH.`));
        console.log(`You can manually open the project at: ${chalk.cyan(appDir)}\n`);
        
        // Offer alternative options
        const { alternateAction } = await inquirer.prompt([
          {
            type: 'list',
            name: 'alternateAction',
            message: 'Would you like to try something else?',
            choices: [
              { name: 'Open project directory', value: 'open-dir' },
              { name: 'Try VS Code with different command', value: 'vscode-alt' },
              { name: 'Just start the development server', value: 'dev-only' },
              { name: 'Continue without opening', value: 'continue' }
            ]
          }
        ]);
        
        if (alternateAction === 'open-dir') {
          openProjectDirectory(appDir);
        } else if (alternateAction === 'vscode-alt') {
          // Try alternate VS Code commands
          const vscodeCommands = ['code', 'code-insiders', 'codium', 'vscodium'];
          let vsOpened = false;
          
          for (const cmd of vscodeCommands) {
            try {
              await execa(cmd, [appDir]);
              console.log(`\n${chalk.green('✓')} Project opened with ${cmd}`);
              vsOpened = true;
              break;
            } catch (err) {
              continue;
            }
          }
          
          if (!vsOpened) {
            console.log(chalk.yellow(`\nUnable to open with any VS Code variant. Please open it manually.`));
          }
        } else if (alternateAction === 'dev-only') {
          startDevServer(appDir, startCmd);
        }
      }
    } else if (nextAction === 'open-dir-dev') {
      openProjectDirectory(appDir);
      await new Promise(resolve => setTimeout(resolve, 1000));
      startDevServer(appDir, startCmd);
    } else {
      console.log(chalk.yellow("\nExiting. Goodbye! 👋"));
      process.exit(0);
    }
  } catch (error) {
    spinner.fail(chalk.red("Something went wrong."));
    progressBar.stop();
    console.error(boxen(
      chalk.red(`Error: ${error.message}`),
      { 
        padding: 1, 
        margin: 1, 
        borderStyle: 'round', 
        borderColor: 'red', 
        title: '❌ Error', 
        titleAlignment: 'center' 
      }
    ));
    
    const { action } = await inquirer.prompt([
      {
        type: 'list',
        name: 'action',
        message: 'What would you like to do?',
        choices: [
          { name: '🔄 Try again', value: 'retry' },
          { name: '🔍 Show detailed error', value: 'details' },
          { name: '👋 Exit', value: 'exit' }
        ]
      }
    ]);
    
    if (action === 'retry') {
      return run();
    } else if (action === 'details') {
      console.log(boxen(
        chalk.red(`${error.stack || error}`),
        { padding: 1, borderStyle: 'round', borderColor: 'red', title: 'Error Details' }
      ));
    }
    process.exit(1);
  }
}

// Add these helper functions just before the last closing brace of the run function

// Helper function to open project directory
function openProjectDirectory(dirPath) {
  let explorerOpened = false;
  
  try {
    if (os.platform() === 'win32') {
      spawn('explorer.exe', [dirPath], { stdio: 'ignore' });
      explorerOpened = true;
    } else if (os.platform() === 'darwin') {
      spawn('open', [dirPath], { stdio: 'ignore' });
      explorerOpened = true;
    } else {
      // Try common Linux file explorers
      const explorers = ['xdg-open', 'nautilus', 'dolphin', 'thunar', 'nemo', 'caja', 'pcmanfm'];
      for (const explorer of explorers) {
        try {
          spawn(explorer, [dirPath], { stdio: 'ignore' });
          explorerOpened = true;
          break;
        } catch (error) {
          continue;
        }
      }
    }
    
    if (explorerOpened) {
      // Use boxen to display directory opened message
      console.log(boxen(
        `${chalk.bold(gradient(['#42a5f5', '#1976d2'])('File Explorer Opened'))}\n\n` +
        `${chalk.green('✓')} Project directory: ${chalk.cyan(path.basename(dirPath))}\n` +
        `${chalk.green('✓')} Location: ${chalk.cyan(dirPath)}`,
        { 
          padding: 1, 
          margin: 1, 
          borderStyle: 'round', 
          borderColor: 'blue',
          title: '📂 Directory',
          titleAlignment: 'center'
        }
      ));
    } else {
      // Use boxen to display manual instructions
      console.log(boxen(
        `${chalk.bold(gradient(['#ffeb3b', '#ffc107'])('Directory Not Opened'))}\n\n` +
        `${chalk.yellow('Could not open file explorer automatically.')}\n\n` +
        `${chalk.dim('Your project is located at:')}\n` +
        `${chalk.bold(dirPath)}`,
        { 
          padding: 1, 
          margin: 1, 
          borderStyle: 'round', 
          borderColor: 'yellow',
          title: '📁 Project Location',
          titleAlignment: 'center'
        }
      ));
    }
  } catch (error) {
    // Use boxen to display error
    console.log(boxen(
      `${chalk.bold(gradient(['#ffeb3b', '#ffc107'])('Directory Not Opened'))}\n\n` +
      `${chalk.yellow(`Error: ${error.message}`)}\n\n` +
      `${chalk.dim('Your project is located at:')}\n` +
      `${chalk.bold(dirPath)}`,
      { 
        padding: 1, 
        margin: 1, 
        borderStyle: 'round', 
        borderColor: 'yellow',
        title: '📁 Project Location',
        titleAlignment: 'center'
      }
    ));
  }
  
  return explorerOpened;
}

// Helper function to start development server
function startDevServer(dirPath, command) {
  const devSpinner = ora({
    text: chalk.cyan('Starting development server...'),
    color: 'cyan',
    spinner: 'dots'
  }).start();
  
  let serverStarted = false;
  
  try {
    if (os.platform() === 'win32') {
      spawn('cmd.exe', ['/c', 'start', 'cmd.exe', '/k', `cd /d "${dirPath}" && ${command}`], { 
        stdio: 'ignore',
        shell: true,
        windowsHide: false
      });
      serverStarted = true;
    } else if (os.platform() === 'darwin') {
      spawn('osascript', [
        '-e', 
        `tell application "Terminal" to do script "cd '${dirPath.replace(/'/g, "\\'")}' && ${command}"`
      ], { stdio: 'ignore' });
      serverStarted = true;
    } else {
      const terminals = ['gnome-terminal', 'konsole', 'xterm', 'xfce4-terminal', 'terminator', 'alacritty', 'kitty'];
      for (const terminal of terminals) {
        try {
          spawn(terminal, ['--', 'bash', '-c', `cd "${dirPath.replace(/"/g, '\\"')}" && ${command}; exec bash`], {
            stdio: 'ignore'
          });
          serverStarted = true;
          break;
        } catch (error) {
          continue;
        }
      }
    }
  } catch (error) {
    console.error(chalk.red(`Error starting development server: ${error.message}`));
  }
  
  devSpinner.stop();
  
  if (serverStarted) {
    // Use boxen to display server started message
    console.log(boxen(
      `${chalk.bold(gradient(['#00c853', '#64dd17'])('Development Server Started'))}\n\n` +
      `${chalk.green('✓')} Server running with: ${chalk.cyan(command)}\n` +
      `${chalk.green('✓')} Project directory: ${chalk.cyan(path.basename(dirPath))}\n\n` +
      `${chalk.dim('Your application will be available at:')}\n` +
      `${chalk.bold('http://localhost:3000')}`,
      { 
        padding: 1, 
        margin: 1, 
        borderStyle: 'round', 
        borderColor: 'green',
        title: '🚀 Server Ready',
        titleAlignment: 'center'
      }
    ));
  } else {
    // Use boxen to display manual instructions
    console.log(boxen(
      `${chalk.bold(gradient(['#ff9800', '#ff5722'])('Server Not Started'))}\n\n` +
      `${chalk.yellow('To start the development server manually:')}\n\n` +
      `${chalk.bold('1.')} ${chalk.dim('Navigate to your project')}\n` +
      `   ${chalk.cyan(`cd ${path.basename(dirPath)}`)}\n\n` +
      `${chalk.bold('2.')} ${chalk.dim('Start the development server')}\n` +
      `   ${chalk.cyan(command)}`,
      { 
        padding: 1, 
        margin: 1, 
        borderStyle: 'round', 
        borderColor: 'yellow',
        title: '⚠️ Manual Steps Required',
        titleAlignment: 'center'
      }
    ));
  }
  
  return serverStarted;
}

// Performance optimizations for faster installations
async function optimizeSetup(packageManager) {
  // 1. Use concurrent downloads for faster dependency installation
  const installDependenciesConcurrently = async (dependencies, type = 'prod') => {
    const command = packageManager === 'npm' ? 'npm' : packageManager;
    const args = [
      packageManager === 'npm' ? 'install' : 'add',
      ...(type === 'dev' ? ['-D'] : []),
      ...dependencies
    ];
    
    // Use execa with increased buffer size and concurrency
    return execa(command, args, { 
      buffer: true,
      preferLocal: true,
      stdout: 'inherit',
      maxBuffer: 10 * 1024 * 1024,  // 10MB buffer 
      env: { 
        ...process.env, 
        // Force non-interactive mode and skip auto-install prompts
        CI: "true",
        ADBLOCK: "1", 
        // Skip compliance checks for faster installs
        DISABLE_OPENCOLLECTIVE: "1", 
        DISABLE_NOTIFIER: "1",
        NEXT_TELEMETRY_DISABLED: "1",
        NPM_CONFIG_FUND: "0"
      }
    });
  };
  
  // 2. Use batch component installation for Components system
  const installShadcnComponentsBatch = async (components) => {
    // Separate shadcn/ui components from custom components
    const shadcnComponents = components.filter(comp => 
      !['file-uploader', 'video-player', 'timeline', 'rating', 'file-tree', 'copy-button'].includes(comp)
    );
    
    const customComponents = components.filter(comp => 
      ['file-uploader', 'video-player', 'timeline', 'rating', 'file-tree', 'copy-button'].includes(comp)
    );
    
    // Process in parallel for maximum speed
    const promises = [];
    
    // Install shadcn/ui components in batches
    if (shadcnComponents.length > 0) {
      // Install in batches of 5 for better performance
      const batchSize = 5;
      const batches = [];
      
      for (let i = 0; i < shadcnComponents.length; i += batchSize) {
        batches.push(shadcnComponents.slice(i, i + batchSize));
      }
      
      // Install batches concurrently
      for (const batch of batches) {
        try {
          await execa('npx', [
            'shadcn@latest', 'add', ...batch, 
            '--yes', // Skip confirmation
            '--overwrite' // Overwrite existing components
          ], {
            env: { 
              ...process.env, 
              FORCE_COLOR: "1", 
              CI: "true", 
              NEXT_SHADCN_SKIP_QUESTIONS: "1"
            }
          });
        } catch (error) {
          // Try one by one if batch fails
          for (const component of batch) {
            try {
              await execa('npx', [
                'shadcn@latest', 'add', component, 
                '--yes', 
                '--overwrite'
              ], { 
                env: { 
                  ...process.env, 
                  FORCE_COLOR: "1", 
                  CI: "true",
                  NEXT_SHADCN_SKIP_QUESTIONS: "1"
                } 
              });
            } catch (componentError) {
              console.log(chalk.yellow(`Warning: Failed to install component ${component}: ${componentError.message}`));
            }
          }
        }
      }
    }
    
    // Install custom components
    if (customComponents.length > 0) {
      for (const comp of customComponents) {
        // Create the component file
        const componentContent = getCustomComponentTemplate(comp);
        const componentDir = path.join(process.cwd(), 'components');
        
        // Create directory if it doesn't exist
        await fs.ensureDir(componentDir);
        
        // Write component file
        const componentPath = path.join(componentDir, `${comp}.tsx`);
        await fs.writeFile(componentPath, componentContent);
      }
      
      // Install required dependencies for custom components
      if (customComponents.includes('file-uploader')) {
        // Install react-dropzone for the file uploader
        const depCommand = packageManager === 'npm' ? 'install' : 'add';
        try {
          await execa(packageManager, [depCommand, 'react-dropzone']);
        } catch (error) {
          console.log(chalk.yellow(`Warning: Failed to install react-dropzone: ${error.message}`));
        }
      }
    }
    
    // If we're installing components, also update the main page.tsx to showcase them
    const showcasePath = path.join(process.cwd(), 'app', 'page.tsx');
    try {
      await fs.writeFile(showcasePath, templates.componentsShowcasePage);
    } catch (error) {
      console.log(chalk.yellow(`Warning: Failed to update page.tsx: ${error.message}`));
    }
  };
  
  // 3. Function to get custom component templates
  const getCustomComponentTemplate = (componentName) => {
    const templates = {
      'file-uploader': `"use client"

import * as React from "react"
import { useDropzone } from "react-dropzone"
import { UploadCloud, File, X, Check } from "lucide-react"
import { cn } from "@/lib/utils"

type FileUploaderProps = {
  onFilesChange?: (files: File[]) => void;
  maxFiles?: number;
  maxSize?: number; // in bytes
  accept?: Record<string, string[]>;
  className?: string;
  disabled?: boolean;
}

type UploadedFile = File & {
  preview?: string;
  status?: 'uploading' | 'error' | 'success';
  progress?: number;
  id: string;
}

export function FileUploader({
  onFilesChange,
  maxFiles = 5,
  maxSize = 5 * 1024 * 1024, // 5MB default
  accept,
  className,
  disabled = false,
}: FileUploaderProps) {
  const [files, setFiles] = React.useState<UploadedFile[]>([])
  
  const onDrop = React.useCallback((acceptedFiles: File[]) => {
    const newFiles = acceptedFiles.map(file => 
      Object.assign(file, {
        preview: URL.createObjectURL(file),
        id: Math.random().toString(36).substring(2),
        status: 'uploading' as const,
        progress: 0
      })
    )
    
    // Simulate upload progress
    newFiles.forEach(file => {
      const interval = setInterval(() => {
        setFiles(prev => 
          prev.map(f => {
            if (f.id === file.id) {
              const progress = Math.min((f.progress || 0) + 10, 100)
              const status = progress === 100 ? 'success' as const : 'uploading' as const
              return { ...f, progress, status }
            }
            return f
          })
        )
        
        if ((file.progress || 0) >= 100) {
          clearInterval(interval)
        }
      }, 300)
    })
    
    // Add new files with existing ones (respecting maxFiles)
    setFiles(prev => {
      const combined = [...prev, ...newFiles]
      return combined.slice(0, maxFiles)
    })
    
    // Call the onChange callback
    onFilesChange?.(acceptedFiles)
  }, [maxFiles, onFilesChange])
  
  const removeFile = React.useCallback((id: string) => {
    setFiles(prev => {
      const newFiles = prev.filter(file => file.id !== id)
      onFilesChange?.(newFiles)
      return newFiles
    })
  }, [onFilesChange])
  
  const { getRootProps, getInputProps, isDragActive } = useDropzone({ 
    onDrop,
    maxSize,
    maxFiles,
    accept,
    disabled
  })
  
  // Clean up previews on unmount
  React.useEffect(() => {
    return () => {
      files.forEach(file => {
        if (file.preview) URL.revokeObjectURL(file.preview)
      })
    }
  }, [files])
  
  return (
    <div className={cn("space-y-4", className)}>
      <div 
        {...getRootProps()} 
        className={cn(
          "border-2 border-dashed rounded-lg p-6 transition-colors cursor-pointer",
          "flex flex-col items-center justify-center gap-2 text-center",
          isDragActive ? "border-primary bg-primary/5" : "border-muted-foreground/25",
          disabled && "opacity-50 cursor-not-allowed"
        )}
      >
        <input {...getInputProps()} />
        <UploadCloud className="h-10 w-10 text-muted-foreground" />
        <div>
          <p className="font-medium text-sm">
            {isDragActive ? "Drop the files here" : "Drag & drop files here"}
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            or click to browse files
          </p>
        </div>
        <div className="text-xs text-muted-foreground mt-2">
          <p>Max {maxFiles} file{maxFiles !== 1 ? 's' : ''}</p>
          <p>Up to {(maxSize / (1024 * 1024)).toFixed(0)}MB per file</p>
        </div>
      </div>
      
      {files.length > 0 && (
        <div className="space-y-2">
          {files.map(file => (
            <div 
              key={file.id} 
              className={cn(
                "flex items-center justify-between p-3 border rounded-md",
                file.status === 'error' && "border-destructive bg-destructive/5",
                file.status === 'success' && "border-green-500 bg-green-50 dark:bg-green-950/20"
              )}
            >
              <div className="flex items-center gap-3 overflow-hidden">
                <div className="shrink-0">
                  {file.type.startsWith('image/') && file.preview ? (
                    <div className="h-10 w-10 rounded-md overflow-hidden border">
                      <img 
                        src={file.preview} 
                        alt={file.name}
                        className="h-full w-full object-cover"
                        onLoad={() => { URL.revokeObjectURL(file.preview!) }}
                      />
                    </div>
                  ) : (
                    <File className="h-10 w-10 text-muted-foreground" />
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium truncate">{file.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {(file.size / 1024).toFixed(0)} KB
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3 pl-3">
                {file.status === 'uploading' && (
                  <div className="w-24">
                    <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-primary transition-all duration-300"
                        style={{ width: \`\${file.progress}%\` }}
                      />
                    </div>
                    <p className="text-xs text-muted-foreground mt-1 text-right">
                      {file.progress}%
                    </p>
                  </div>
                )}
                {file.status === 'success' && (
                  <Check className="h-5 w-5 text-green-500" />
                )}
                <button
                  type="button"
                  onClick={() => removeFile(file.id)}
                  className="rounded-md p-1 hover:bg-muted transition-colors"
                >
                  <X className="h-4 w-4 text-muted-foreground" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}`,
      'video-player': `"use client"

import * as React from "react"
import { Play, Pause, Volume2, VolumeX, Maximize, SkipForward, SkipBack } from "lucide-react"
import { cn } from "@/lib/utils"
import { Slider } from "@/components/ui/slider"
import { Button } from "@/components/ui/button"

type VideoPlayerProps = {
  src: string;
  poster?: string;
  title?: string;
  autoPlay?: boolean;
  className?: string;
  onPlay?: () => void;
  onPause?: () => void;
  onEnded?: () => void;
}

export function VideoPlayer({
  src,
  poster,
  title,
  autoPlay = false,
  className,
  onPlay,
  onPause,
  onEnded,
}: VideoPlayerProps) {
  const videoRef = React.useRef<HTMLVideoElement>(null)
  const [playing, setPlaying] = React.useState(autoPlay)
  const [currentTime, setCurrentTime] = React.useState(0)
  const [duration, setDuration] = React.useState(0)
  const [volume, setVolume] = React.useState(1)
  const [muted, setMuted] = React.useState(false)
  const [showControls, setShowControls] = React.useState(true)
  const controlsTimeout = React.useRef<NodeJS.Timeout>()
  
  // Hide controls after inactivity
  const resetControlsTimeout = React.useCallback(() => {
    if (controlsTimeout.current) {
      clearTimeout(controlsTimeout.current)
    }
    
    setShowControls(true)
    
    controlsTimeout.current = setTimeout(() => {
      if (playing) {
        setShowControls(false)
      }
    }, 3000)
  }, [playing])
  
  // Reset the timeout when playing state changes
  React.useEffect(() => {
    resetControlsTimeout()
  }, [playing, resetControlsTimeout])
  
  // Handle video events
  React.useEffect(() => {
    const video = videoRef.current
    if (!video) return
    
    const onTimeUpdate = () => setCurrentTime(video.currentTime)
    const onDurationChange = () => setDuration(video.duration)
    const onVolumeChange = () => {
      setVolume(video.volume)
      setMuted(video.muted)
    }
    
    const onVideoPlay = () => {
      setPlaying(true)
      onPlay?.()
    }
    
    const onVideoPause = () => {
      setPlaying(false)
      onPause?.()
    }
    
    const onVideoEnded = () => {
      setPlaying(false)
      onEnded?.()
    }
    
    video.addEventListener("timeupdate", onTimeUpdate)
    video.addEventListener("durationchange", onDurationChange)
    video.addEventListener("volumechange", onVolumeChange)
    video.addEventListener("play", onVideoPlay)
    video.addEventListener("pause", onVideoPause)
    video.addEventListener("ended", onVideoEnded)
    
    return () => {
      video.removeEventListener("timeupdate", onTimeUpdate)
      video.removeEventListener("durationchange", onDurationChange)
      video.removeEventListener("volumechange", onVolumeChange)
      video.removeEventListener("play", onVideoPlay)
      video.removeEventListener("pause", onVideoPause)
      video.removeEventListener("ended", onVideoEnded)
      
      if (controlsTimeout.current) {
        clearTimeout(controlsTimeout.current)
      }
    }
  }, [onPlay, onPause, onEnded])
  
  // Toggle play/pause
  const togglePlay = () => {
    if (!videoRef.current) return
    
    if (playing) {
      videoRef.current.pause()
    } else {
      videoRef.current.play()
    }
  }
  
  // Toggle mute
  const toggleMute = () => {
    if (!videoRef.current) return
    videoRef.current.muted = !muted
  }
  
  // Handle seeking
  const handleSeek = (value: number[]) => {
    if (!videoRef.current) return
    videoRef.current.currentTime = value[0]
  }
  
  // Handle volume change
  const handleVolumeChange = (value: number[]) => {
    if (!videoRef.current) return
    videoRef.current.volume = value[0]
  }
  
  // Toggle fullscreen
  const toggleFullscreen = () => {
    if (!videoRef.current) return
    
    if (document.fullscreenElement) {
      document.exitFullscreen()
    } else {
      videoRef.current.requestFullscreen()
    }
  }
  
  // Skip forward/backward
  const skip = (seconds: number) => {
    if (!videoRef.current) return
    videoRef.current.currentTime = Math.min(
      Math.max(currentTime + seconds, 0),
      duration
    )
  }
  
  // Format time as mm:ss
  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60)
    const seconds = Math.floor(time % 60)
    return \`\${minutes}:\${seconds < 10 ? '0' : ''}\${seconds}\`
  }
  
  return (
    <div 
      className={cn(
        "relative group overflow-hidden rounded-lg bg-black",
        className
      )}
      onMouseMove={resetControlsTimeout}
    >
      <video
        ref={videoRef}
        src={src}
        poster={poster}
        className="w-full h-full object-contain"
        autoPlay={autoPlay}
        onClick={togglePlay}
      />
      
      {/* Video Title */}
      {title && (
        <div 
          className={cn(
            "absolute top-0 left-0 right-0 p-4 bg-gradient-to-b from-black/70 to-transparent",
            "transition-opacity duration-300",
            !showControls && "opacity-0"
          )}
        >
          <h3 className="text-white font-medium truncate">{title}</h3>
        </div>
      )}
      
      {/* Video Controls */}
      <div 
        className={cn(
          "absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/70 to-transparent",
          "flex flex-col gap-2 transition-opacity duration-300",
          !showControls && "opacity-0"
        )}
      >
        {/* Progress bar */}
        <div className="flex items-center gap-2">
          <span className="text-white text-xs">{formatTime(currentTime)}</span>
          <Slider
            value={[currentTime]}
            min={0}
            max={duration || 100}
            step={0.01}
            onValueChange={handleSeek}
            className="flex-1"
          />
          <span className="text-white text-xs">{formatTime(duration)}</span>
        </div>
        
        {/* Controls row */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Button 
              variant="ghost" 
              size="icon" 
              className="text-white hover:bg-white/20"
              onClick={() => skip(-10)}
            >
              <SkipBack className="h-5 w-5" />
            </Button>
            
            <Button 
              variant="ghost" 
              size="icon" 
              className="text-white hover:bg-white/20"
              onClick={togglePlay}
            >
              {playing ? (
                <Pause className="h-5 w-5" />
              ) : (
                <Play className="h-5 w-5" />
              )}
            </Button>
            
            <Button 
              variant="ghost" 
              size="icon" 
              className="text-white hover:bg-white/20"
              onClick={() => skip(10)}
            >
              <SkipForward className="h-5 w-5" />
            </Button>
            
            <div className="flex items-center gap-2 ml-2">
              <Button 
                variant="ghost" 
                size="icon" 
                className="text-white hover:bg-white/20"
                onClick={toggleMute}
              >
                {muted || volume === 0 ? (
                  <VolumeX className="h-5 w-5" />
                ) : (
                  <Volume2 className="h-5 w-5" />
                )}
              </Button>
              
              <Slider
                value={[muted ? 0 : volume]}
                min={0}
                max={1}
                step={0.01}
                onValueChange={handleVolumeChange}
                className="w-24"
              />
            </div>
          </div>
          
          <Button 
            variant="ghost" 
            size="icon" 
            className="text-white hover:bg-white/20"
            onClick={toggleFullscreen}
          >
            <Maximize className="h-5 w-5" />
          </Button>
        </div>
      </div>
    </div>
  )
}`,
      'timeline': `"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

type TimelineProps = React.HTMLAttributes<HTMLDivElement> & {
  items: TimelineItem[];
  orientation?: "vertical" | "horizontal";
  alternating?: boolean;
}

type TimelineItem = {
  id: string;
  title: string;
  content: React.ReactNode;
  date?: string;
  icon?: React.ReactNode;
  status?: "past" | "current" | "future";
}

export function Timeline({
  items,
  orientation = "vertical",
  alternating = false,
  className,
  ...props
}: TimelineProps) {
  return (
    <div 
      className={cn(
        "relative",
        orientation === "horizontal" && "flex items-start gap-4 overflow-x-auto pb-4",
        className
      )}
      {...props}
    >
      {/* Timeline line */}
      {orientation === "vertical" && (
        <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-border" />
      )}
      {orientation === "horizontal" && (
        <div className="absolute left-0 right-0 top-4 h-0.5 bg-border" />
      )}
      
      {/* Timeline items */}
      {items.map((item, index) => (
        <div
          key={item.id}
          className={cn(
            "relative",
            orientation === "vertical" && "pl-10 pb-8 last:pb-0",
            orientation === "horizontal" && "pt-8 pr-8 last:pr-0 min-w-[200px]",
            alternating && orientation === "vertical" && index % 2 === 1 && "ml-auto pl-0 pr-10 text-right"
          )}
        >
          {/* Item connector & icon */}
          <div 
            className={cn(
              "absolute bg-background",
              orientation === "vertical" && "left-[9px] top-1 h-6 w-6 -translate-x-1/2 rounded-full border-4 border-background",
              orientation === "horizontal" && "left-0 top-[9px] h-6 w-6 -translate-y-1/2 rounded-full border-4 border-background",
              alternating && orientation === "vertical" && index % 2 === 1 && "left-auto right-[9px] translate-x-1/2",
              item.status === "past" && "bg-primary border-primary",
              item.status === "current" && "bg-primary border-primary ring-4 ring-primary/20",
              item.status === "future" && "bg-muted border-muted"
            )}
          >
            {item.icon && (
              <div className="flex h-full w-full items-center justify-center">
                {item.icon}
              </div>
            )}
          </div>
          
          {/* Item content */}
          <div className={cn(
            alternating && orientation === "vertical" && index % 2 === 1 && "flex flex-col items-end"
          )}>
            {item.date && (
              <p className="text-sm text-muted-foreground mb-1">{item.date}</p>
            )}
            <h3 className="font-medium">{item.title}</h3>
            <div className={cn(
              "mt-2",
              typeof item.content === "string" && "text-muted-foreground"
            )}>
              {item.content}
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}`,
      'rating': `"use client"

import * as React from "react"
import { Star } from "lucide-react"
import { cn } from "@/lib/utils"

type RatingProps = {
  value?: number;
  max?: number;
  size?: "sm" | "md" | "lg";
  readonly?: boolean;
  onChange?: (value: number) => void;
  className?: string;
}

export function Rating({
  value = 0,
  max = 5,
  size = "md",
  readonly = false,
  onChange,
  className
}: RatingProps) {
  const [rating, setRating] = React.useState(value)
  const [hoverRating, setHoverRating] = React.useState(0)
  
  // Update internal state when value prop changes
  React.useEffect(() => {
    setRating(value)
  }, [value])
  
  // Handle selecting a rating
  const handleSetRating = (newRating: number) => {
    if (readonly) return
    
    setRating(newRating)
    onChange?.(newRating)
  }
  
  const starSizes = {
    sm: "w-4 h-4",
    md: "w-5 h-5",
    lg: "w-6 h-6",
  }
  
  return (
    <div 
      className={cn(
        "flex items-center gap-1",
        !readonly && "cursor-pointer",
        className
      )}
      onMouseLeave={() => setHoverRating(0)}
    >
      {Array.from({ length: max }).map((_, i) => {
        const starValue = i + 1
        const isFilled = hoverRating ? starValue <= hoverRating : starValue <= rating
        
        return (
          <Star
            key={i}
            className={cn(
              starSizes[size],
              "transition-colors",
              isFilled 
                ? "text-yellow-400 fill-yellow-400" 
                : "text-muted stroke-muted-foreground fill-none",
              !readonly && "hover:stroke-yellow-400"
            )}
            onClick={() => handleSetRating(starValue)}
            onMouseEnter={() => !readonly && setHoverRating(starValue)}
          />
        )
      })}
    </div>
  )
}`,
      'file-tree': `"use client"

import * as React from "react"
import { ChevronRight, ChevronDown, Folder, File, FolderOpen } from "lucide-react"
import { cn } from "@/lib/utils"

type FileTreeProps = {
  data: TreeNode[];
  onSelect?: (node: TreeNode) => void;
  initialExpanded?: boolean;
  className?: string;
}

type TreeNode = {
  id: string;
  name: string;
  type: "file" | "folder";
  children?: TreeNode[];
  meta?: Record<string, any>;
}

export function FileTree({
  data,
  onSelect,
  initialExpanded = false,
  className
}: FileTreeProps) {
  return (
    <div className={cn("text-sm", className)}>
      <ul className="space-y-1">
        {data.map((node) => (
          <TreeNode
            key={node.id}
            node={node}
            onSelect={onSelect}
            initialExpanded={initialExpanded}
            level={0}
          />
        ))}
      </ul>
    </div>
  )
}

type TreeNodeProps = {
  node: TreeNode;
  onSelect?: (node: TreeNode) => void;
  initialExpanded: boolean;
  level: number;
}

function TreeNode({ node, onSelect, initialExpanded, level }: TreeNodeProps) {
  const [expanded, setExpanded] = React.useState(initialExpanded)
  const hasChildren = node.type === "folder" && node.children && node.children.length > 0
  
  const toggleExpand = (e: React.MouseEvent) => {
    e.stopPropagation()
    if (hasChildren) {
      setExpanded(!expanded)
    }
  }
  
  const handleSelect = () => {
    onSelect?.(node)
  }
  
  // File type icon mapping
  const getFileIcon = (fileName: string) => {
    const extension = fileName.split('.').pop()?.toLowerCase()
    
    if (!extension) return <File className="h-4 w-4 text-muted-foreground" />
    
    // Example file type mapping - extend as needed
    const iconMap: Record<string, React.ReactNode> = {
      js: <File className="h-4 w-4 text-yellow-400" />,
      ts: <File className="h-4 w-4 text-blue-400" />,
      jsx: <File className="h-4 w-4 text-cyan-400" />,
      tsx: <File className="h-4 w-4 text-blue-500" />,
      css: <File className="h-4 w-4 text-sky-400" />,
      html: <File className="h-4 w-4 text-orange-400" />,
      json: <File className="h-4 w-4 text-green-400" />,
      md: <File className="h-4 w-4 text-gray-400" />,
    }
    
    return iconMap[extension] || <File className="h-4 w-4 text-muted-foreground" />
  }
  
  return (
    <li>
      <div 
        className={cn(
          "flex items-center py-1 px-1 rounded-md",
          "hover:bg-muted cursor-pointer"
        )}
        style={{ paddingLeft: \`\${level * 12 + 4}px\` }}
        onClick={handleSelect}
      >
        {hasChildren ? (
          <div className="mr-1 p-0.5" onClick={toggleExpand}>
            {expanded ? (
              <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />
            ) : (
              <ChevronRight className="h-3.5 w-3.5 text-muted-foreground" />
            )}
          </div>
        ) : (
          <div className="w-5" />
        )}
        
        <div className="mr-1.5">
          {node.type === "folder" ? (
            expanded ? (
              <FolderOpen className="h-4 w-4 text-yellow-400" />
            ) : (
              <Folder className="h-4 w-4 text-yellow-400" />
            )
          ) : (
            getFileIcon(node.name)
          )}
        </div>
        
        <span className="truncate">{node.name}</span>
      </div>
      
      {hasChildren && expanded && (
        <ul className="space-y-1">
          {node.children!.map(childNode => (
            <TreeNode
              key={childNode.id}
              node={childNode}
              onSelect={onSelect}
              initialExpanded={initialExpanded}
              level={level + 1}
            />
          ))}
        </ul>
      )}
    </li>
  )
}`,
      'copy-button': `"use client"

import * as React from "react"
import { Copy, Check } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"

type CopyButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  value: string;
  variant?: "default" | "secondary" | "outline" | "ghost";
  size?: "default" | "sm" | "lg" | "icon";
  timeout?: number;
  label?: string;
  successLabel?: string;
  tooltipSide?: "top" | "right" | "bottom" | "left";
  showTooltip?: boolean;
  className?: string;
}

export function CopyButton({
  value,
  variant = "ghost",
  size = "icon",
  timeout = 2000,
  label = "Copy",
  successLabel = "Copied!",
  tooltipSide = "top",
  showTooltip = true,
  className,
  ...props
}: CopyButtonProps) {
  const [copied, setCopied] = React.useState(false)
  
  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(value)
      setCopied(true)
      
      setTimeout(() => {
        setCopied(false)
      }, timeout)
    } catch (error) {
      console.error("Failed to copy text:", error)
    }
  }
  
  const button = (
    <Button
      size={size}
      variant={variant}
      onClick={handleCopy}
      className={cn(className)}
      {...props}
    >
      {copied ? (
        <Check className="h-4 w-4" />
      ) : (
        <Copy className="h-4 w-4" />
      )}
      {size !== "icon" && (
        <span className="ml-2">
          {copied ? successLabel : label}
        </span>
      )}
    </Button>
  )
  
  if (!showTooltip) {
    return button
  }
  
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          {button}
        </TooltipTrigger>
        <TooltipContent side={tooltipSide}>
          <p>{copied ? successLabel : label}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}`
    };
    
    return templates[componentName] || '';
  };
  
  // 4. Optimize file operations with streaming and parallel writes
  const setupFilesOptimized = async (files) => {
    const promises = Object.entries(files).map(async ([filePath, content]) => {
      // Create directories if needed
      const dirPath = path.dirname(filePath);
      await fs.ensureDir(dirPath);
      
      // Write the file
      return fs.writeFile(filePath, content);
    });
    
    return Promise.all(promises);
  };
  
  return {
    installDependenciesConcurrently,
    installShadcnComponentsBatch,
    setupFilesOptimized
  };
}

// Function to set up Next Auth
async function setupNextAuth(projectDir) {
  // Import auth templates
  const authTemplatesModule = await import('./next-auth-setup.js');
  
  // Extract the exported templates
  const { authConfig, authRouteHandler, signInPage, authProviderContent } = authTemplatesModule;
  
  // Create auth directory structure
  await fs.ensureDir(path.join(projectDir, 'app/api/auth/[...nextauth]'));
  await fs.ensureDir(path.join(projectDir, 'lib'));
  await fs.ensureDir(path.join(projectDir, 'components/auth'));
  
  // Add route.ts file with proper NextAuth configuration
  await fs.writeFile(
    path.join(projectDir, 'app/api/auth/[...nextauth]', 'route.ts'), 
    authRouteHandler
  );
  
  // Add auth.ts configuration
  await fs.writeFile(
    path.join(projectDir, 'lib', 'auth.ts'),
    authConfig
  );
  
  // Add auth provider component
  await fs.writeFile(
    path.join(projectDir, 'components/auth', 'auth-provider.tsx'),
    authProviderContent
  );
  
  // Create signin page
  await fs.ensureDir(path.join(projectDir, 'app/auth/signin'));
  await fs.writeFile(
    path.join(projectDir, 'app/auth/signin', 'page.tsx'),
    signInPage
  );
  
  // Create a client-side auth session provider wrapper
  await fs.writeFile(
    path.join(projectDir, 'app', 'providers.tsx'),
    `"use client"

import { SessionProvider } from "next-auth/react"
import { ThemeProvider } from "@/components/theme-provider"
import { ReactNode } from "react"

export function Providers({ 
  children 
}: { 
  children: ReactNode 
}) {
  return (
    <SessionProvider>
      <ThemeProvider
        attribute="class"
        defaultTheme="system"
        enableSystem
        disableTransitionOnChange
      >
        {children}
      </ThemeProvider>
    </SessionProvider>
  )
}`
  );
  
  // Update layout to use the providers component
  try {
    const layoutPath = path.join(projectDir, 'app/layout.tsx');
    let layoutContent = await fs.readFile(layoutPath, 'utf8');
    
    // Add import for Providers
    if (!layoutContent.includes('import { Providers }')) {
      layoutContent = `import { Providers } from "./providers"\n` + layoutContent;
    }
    
    // Replace ThemeProvider with Providers if it exists
    if (layoutContent.includes('<ThemeProvider')) {
      const themeProviderPattern = /<ThemeProvider[\s\S]*?>([\s\S]*?)<\/ThemeProvider>/;
      const themeProviderMatch = layoutContent.match(themeProviderPattern);
      
      if (themeProviderMatch) {
        const themeProviderContent = themeProviderMatch[1];
        layoutContent = layoutContent.replace(
          themeProviderPattern, 
          `<Providers>${themeProviderContent}</Providers>`
        );
      }
    } else {
      // If no ThemeProvider, add Providers directly inside body
      const bodyPattern = /<body[^>]*>([\s\S]*?)<\/body>/;
      const bodyMatch = layoutContent.match(bodyPattern);
      
      if (bodyMatch) {
        const bodyContent = bodyMatch[1];
        const bodyStart = bodyMatch[0].split('>')[0] + '>';
        
        layoutContent = layoutContent.replace(
          bodyPattern, 
          `${bodyStart}\n      <Providers>${bodyContent}</Providers>\n    </body>`
        );
      }
    }
    
    await fs.writeFile(layoutPath, layoutContent);
  } catch (error) {
    console.log(chalk.yellow(`Warning: Could not update layout with auth provider: ${error.message}`));
  }
  
  // Update package.json to include NextAuth dependencies
  const pkgJsonPath = path.join(projectDir, 'package.json');
  const pkgJson = await fs.readJSON(pkgJsonPath);
  
  pkgJson.dependencies = {
    ...pkgJson.dependencies,
    "next-auth": "^4.24.5",
    "@auth/mongodb-adapter": "^2.0.0",
    "mongodb": "^6.3.0"
  };
  
  await fs.writeJSON(pkgJsonPath, pkgJson, { spaces: 2 });
}

// Function to set up Prisma with MongoDB
async function setupPrisma(projectDir) {
  // Import prisma templates
  const prismaTemplatesModule = await import('./prisma-setup.js');
  const prismaTemplates = prismaTemplatesModule.default || prismaTemplatesModule;
  
  // Create Prisma directory
  await fs.ensureDir(path.join(projectDir, 'prisma'));
  await fs.ensureDir(path.join(projectDir, 'lib'));
  
  // Create Prisma schema with MongoDB configuration
  await fs.writeFile(
    path.join(projectDir, 'prisma', 'schema.prisma'),
    prismaTemplates.prismaSchema
  );
  
  // Create MongoDB connection utility
  await fs.writeFile(
    path.join(projectDir, 'lib', 'mongodb.ts'),
    prismaTemplates.mongodbClientUtil
  );
  
  // Update package.json to include Prisma and MongoDB dependencies
  const pkgJsonPath = path.join(projectDir, 'package.json');
  const pkgJson = await fs.readJSON(pkgJsonPath);
  
  pkgJson.dependencies = {
    ...pkgJson.dependencies,
    "@prisma/client": "latest",
    "mongodb": "latest"
  };
  
  pkgJson.devDependencies = {
    ...pkgJson.devDependencies,
    "prisma": "latest"
  };
  
  await fs.writeJSON(pkgJsonPath, pkgJson, { spaces: 2 });
}

// Function to create environment variables file
async function createEnvFile(projectDir) {
  const envContent = `# Application
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Authentication
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=${Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15)}

# Database - MongoDB
DATABASE_URL="mongodb+srv://username:password@cluster.mongodb.net/mydb?retryWrites=true&w=majority"

# Example API keys (replace with your own)
# GITHUB_ID=your_github_client_id
# GITHUB_SECRET=your_github_client_secret
# GOOGLE_CLIENT_ID=your_google_client_id
# GOOGLE_CLIENT_SECRET=your_google_client_secret
`;
  
  await fs.writeFile(path.join(projectDir, '.env'), envContent);
  await fs.writeFile(path.join(projectDir, '.env.example'), envContent);
}

// Add the function to fix TypeScript errors
async function fixTypeScriptErrors(projectDir) {
  // Fix for next-themes type issue
  const themeProviderContent = `"use client"

import * as React from "react"
import { ThemeProvider as NextThemesProvider } from "next-themes"

type ThemeProviderProps = {
  children: React.ReactNode;
  attribute?: string;
  defaultTheme?: string;
  enableSystem?: boolean;
  disableTransitionOnChange?: boolean;
};

export function ThemeProvider({ 
  children,
  attribute = "class",
  defaultTheme = "system",
  enableSystem = true,
  disableTransitionOnChange = false,
}: ThemeProviderProps) {
  return (
    <NextThemesProvider
      attribute={attribute}
      defaultTheme={defaultTheme}
      enableSystem={enableSystem}
      disableTransitionOnChange={disableTransitionOnChange}
    >
      {children}
    </NextThemesProvider>
  );
}`;

  await fs.ensureDir(path.join(projectDir, 'components/theme'));
  await fs.writeFile(path.join(projectDir, 'components/theme/theme-provider.tsx'), themeProviderContent);
  
  // Fix for auth provider type issue
  const authProviderContent = `"use client"

import { SessionProvider } from "next-auth/react"
import { ReactNode } from "react"

type AuthProviderProps = {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  return <SessionProvider>{children}</SessionProvider>
}`;

  await fs.ensureDir(path.join(projectDir, 'components/auth'));
  await fs.writeFile(path.join(projectDir, 'components/auth/auth-provider.tsx'), authProviderContent);
  
  // Update layout.tsx to include providers correctly
  const layoutPath = path.join(projectDir, 'app/layout.tsx');
  let layoutContent = await fs.readFile(layoutPath, 'utf8');
  
  if (!layoutContent.includes('import { ThemeProvider }')) {
    layoutContent = `import { ThemeProvider } from "@/components/theme/theme-provider"\n${layoutContent}`;
  }
  
  if (!layoutContent.includes('import { AuthProvider }')) {
    layoutContent = `import { AuthProvider } from "@/components/auth/auth-provider"\n${layoutContent}`;
  }
  
  // Update the body tag to include providers
  if (!layoutContent.includes('<ThemeProvider') && !layoutContent.includes('<AuthProvider')) {
    const bodyPattern = /<body[^>]*>([\s\S]*?)<\/body>/;
    const bodyMatch = layoutContent.match(bodyPattern);
    
    if (bodyMatch) {
      const bodyTag = bodyMatch[0];
      const bodyContent = bodyMatch[1];
      
      // Extract class names if they exist
      const classNameMatch = bodyTag.match(/className=["']([^"']*)["']/);
      const className = classNameMatch ? classNameMatch[1] : '';
      
      // Create the replacement with providers
      const newBodyTag = `<body${className ? ` className="${className}"` : ''}>
      <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
        <AuthProvider>${bodyContent}</AuthProvider>
      </ThemeProvider>
    </body>`;
      
      // Replace the body tag in the layout content
      layoutContent = layoutContent.replace(bodyPattern, newBodyTag);
    }
  }
  
  await fs.writeFile(layoutPath, layoutContent);
}

run();
