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
    `This tool helps you create a production-ready Next.js app with:
    
    ${chalk.cyan('•')} ${chalk.bold('Next.js 14')} with App Router
    ${chalk.cyan('•')} ${chalk.bold('TypeScript')} for type safety
    ${chalk.cyan('•')} ${chalk.bold('TailwindCSS')} for styling
    ${chalk.cyan('•')} ${chalk.bold('Shadcn UI')} components
    ${chalk.cyan('•')} ${chalk.bold('Dark mode')} support
    ${chalk.cyan('•')} ${chalk.bold('ESLint')} configuration`,
    { 
      padding: 1, 
      margin: 1, 
      borderStyle: 'round', 
      borderColor: currentTheme.secondary,
      title: '✨ Welcome',
      titleAlignment: 'center',
      float: 'center'
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
    const pageContent = templates.pageContent(projectName);
    
    await fs.writeFile(path.join(projectDir, 'app', 'page.tsx'), pageContent);
    
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
    
    // Create .gitignore file
    const gitignoreContent = templates.gitignoreContent;
    await fs.writeFile(path.join(projectDir, '.gitignore'), gitignoreContent);
    
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
        { name: '⚡ Ultra-fast mode', value: 'fastMode', checked: true },
        { name: '🌓 Light/Dark theme switcher', value: 'themeSwitch', checked: true },
        { name: '💾 Prisma database setup', value: 'prisma', checked: false },
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
    // Create an array of all available components
    const allComponents = [
      'accordion', 'alert', 'alert-dialog', 'aspect-ratio', 'avatar', 'badge', 
      'button', 'calendar', 'card', 'carousel', 'checkbox', 'collapsible', 
      'command', 'context-menu', 'dialog', 'drawer', 'dropdown-menu', 'form', 
      'hover-card', 'input', 'label', 'menubar', 'navigation-menu', 'pagination', 
      'popover', 'progress', 'radio-group', 'scroll-area', 'select', 'separator', 
      'sheet', 'skeleton', 'slider', 'switch', 'table', 'tabs', 'textarea', 
      'toast', 'toggle', 'toggle-group', 'tooltip'
    ];
    
    // First, ask if the user wants to select all components
    const { componentSelection } = await inquirer.prompt([
      {
        type: 'list',
        name: 'componentSelection',
        message: 'How would you like to select components?',
        choices: [
          { name: '🔍 Custom selection (choose specific components)', value: 'custom' },
          { name: '✅ Select all components', value: 'all' },
          { name: '🧰 Essential components only (button, card, dialog, input, form)', value: 'essential' }
        ]
      }
    ]);
    
    if (componentSelection === 'all') {
      selectedComponents = allComponents;
      console.log(chalk.green(`\n✓ Selected all ${selectedComponents.length} components\n`));
    } else if (componentSelection === 'essential') {
      selectedComponents = ['button', 'card', 'dialog', 'input', 'form'];
      console.log(chalk.green(`\n✓ Selected essential components: ${selectedComponents.join(', ')}\n`));
    } else {
      // Show the component selection dialog for custom selection
      const componentPrompt = await inquirer.prompt([
        {
          type: 'search-checkbox',
          name: 'components',
          message: 'Select UI components to install:',
          choices: [
            { name: 'Accordion', value: 'accordion' },
            { name: 'Alert', value: 'alert' },
            { name: 'Alert Dialog', value: 'alert-dialog' },
            { name: 'Aspect Ratio', value: 'aspect-ratio' },
            { name: 'Avatar', value: 'avatar' },
            { name: 'Badge', value: 'badge' },
            { name: 'Button', value: 'button', checked: true },
            { name: 'Calendar', value: 'calendar' },
            { name: 'Card', value: 'card', checked: true },
            { name: 'Carousel', value: 'carousel' },
            { name: 'Checkbox', value: 'checkbox' },
            { name: 'Collapsible', value: 'collapsible' },
            { name: 'Command', value: 'command' },
            { name: 'Context Menu', value: 'context-menu' },
            { name: 'Dialog', value: 'dialog' },
            { name: 'Drawer', value: 'drawer' },
            { name: 'Dropdown Menu', value: 'dropdown-menu' },
            { name: 'Form', value: 'form' },
            { name: 'Hover Card', value: 'hover-card' },
            { name: 'Input', value: 'input' },
            { name: 'Label', value: 'label' },
            { name: 'Menubar', value: 'menubar' },
            { name: 'Navigation Menu', value: 'navigation-menu' },
            { name: 'Pagination', value: 'pagination' },
            { name: 'Popover', value: 'popover' },
            { name: 'Progress', value: 'progress' },
            { name: 'Radio Group', value: 'radio-group' },
            { name: 'Scroll Area', value: 'scroll-area' },
            { name: 'Select', value: 'select' },
            { name: 'Separator', value: 'separator' },
            { name: 'Sheet', value: 'sheet' },
            { name: 'Skeleton', value: 'skeleton' },
            { name: 'Slider', value: 'slider' },
            { name: 'Switch', value: 'switch' },
            { name: 'Table', value: 'table' },
            { name: 'Tabs', value: 'tabs' },
            { name: 'Textarea', value: 'textarea' },
            { name: 'Toast', value: 'toast' },
            { name: 'Toggle', value: 'toggle' },
            { name: 'Toggle Group', value: 'toggle-group' },
            { name: 'Tooltip', value: 'tooltip' }
          ],
          pageSize: 15
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
        const pageContent = templates.pageContent(appName);
        
        await fs.writeFile(path.join(appDir, 'app', 'page.tsx'), pageContent);
        
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
        
        // Create .gitignore file
        const gitignoreContent = templates.gitignoreContent;
        await fs.writeFile(path.join(appDir, '.gitignore'), gitignoreContent);
        
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
          const pageContent = templates.pageContent(appName);
          
          await fs.writeFile(path.join(appDir, 'app', 'page.tsx'), pageContent);
          
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
          
          // Create .gitignore file
          const gitignoreContent = templates.gitignoreContent;
          await fs.writeFile(path.join(appDir, '.gitignore'), gitignoreContent);
          
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
      
      // Install lucide-react separately (no longer needed as it's in coreDeps)
      // const lucidePromise = execa(installCmd, [addCmd, "lucide-react"], { stdio: "pipe" });
      
      // lucidePromise.stdout.on('data', (data) => {
      //   installOutput += data.toString();
      // });
      
      // lucidePromise.stderr.on('data', (data) => {
      //   installOutput += data.toString();
      // });
      
      // await lucidePromise;
      
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
    
    spinner.succeed(chalk[currentTheme.accent](`${steps[1]} complete`));

    // Step 3: Set up shadcn
    updateProgress(`${steps[2]}...`);
    
    try {
      // Use the official shadcn CLI initialization
      spinner.text = chalk[currentTheme.secondary]('Initializing shadcn UI...');
      
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
            title: '🧩 Components',
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
            title: '📋 Summary',
            titleAlignment: 'center'
          }
        ));
      }
    } catch (err) {
      spinner.warn(chalk.yellow(`Error setting up shadcn UI: ${err.message}. Will try to continue anyway.`));
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

run();
