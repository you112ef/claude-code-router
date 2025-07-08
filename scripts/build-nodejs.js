const fs = require('fs');
const path = require('path');

console.log('🔨 Building Node.js project for React Native...');

const nodejsProjectPath = path.join(__dirname, '../nodejs-assets/nodejs-project');
const packageJsonPath = path.join(nodejsProjectPath, 'package.json');

// التحقق من وجود package.json
if (!fs.existsSync(packageJsonPath)) {
  console.error('❌ package.json not found in nodejs-project');
  process.exit(1);
}

// قراءة package.json
const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));

console.log(`📦 Project: ${packageJson.name} v${packageJson.version}`);
console.log('✅ Node.js project structure validated');

// التحقق من وجود الملفات المطلوبة
const requiredFiles = [
  'main.js',
  'server.js',
  'middlewares/formatRequest.js',
  'middlewares/rewriteBody.js',
  'middlewares/router.js',
  'utils/log.js',
  'utils/stream.js',
  'utils/localai.js'
];

let allFilesExist = true;

requiredFiles.forEach(file => {
  const filePath = path.join(nodejsProjectPath, file);
  if (fs.existsSync(filePath)) {
    console.log(`✅ ${file}`);
  } else {
    console.log(`❌ ${file} - Missing!`);
    allFilesExist = false;
  }
});

if (!allFilesExist) {
  console.error('❌ Some required files are missing');
  process.exit(1);
}

// التحقق من وجود plugins
const pluginsPath = path.join(nodejsProjectPath, 'plugins');
if (fs.existsSync(pluginsPath)) {
  const plugins = fs.readdirSync(pluginsPath);
  console.log(`🔌 Found ${plugins.length} plugins:`);
  plugins.forEach(plugin => {
    console.log(`   - ${plugin}`);
  });
} else {
  console.log('⚠️  No plugins directory found');
}

// إنشاء config.json افتراضي إذا لم يكن موجوداً
const configPath = path.join(nodejsProjectPath, 'config.json');
if (!fs.existsSync(configPath)) {
  const defaultConfig = {
    log: true,
    OPENAI_API_KEY: "",
    OPENAI_BASE_URL: "",
    OPENAI_MODEL: "",
    Providers: [],
    Router: {
      background: "",
      think: "",
      longContext: ""
    },
    usePlugins: []
  };
  
  fs.writeFileSync(configPath, JSON.stringify(defaultConfig, null, 2));
  console.log('✅ Created default config.json');
} else {
  console.log('✅ config.json exists');
}

console.log('');
console.log('🎉 Node.js project build completed successfully!');
console.log('');
console.log('📋 Project Summary:');
console.log(`   📂 Project Path: ${nodejsProjectPath}`);
console.log(`   📄 Main Entry: ${packageJson.main || 'main.js'}`);
console.log(`   🔧 Dependencies: ${Object.keys(packageJson.dependencies || {}).length}`);
console.log(`   🔌 Plugins: ${fs.existsSync(pluginsPath) ? fs.readdirSync(pluginsPath).length : 0}`);
console.log('');
console.log('🚀 Ready for React Native build!');