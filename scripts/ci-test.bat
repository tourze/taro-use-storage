@echo off
echo 🚀 开始模拟 GitHub Actions CI 环境...

REM 设置 CI 环境变量
set CI=true
set NODE_ENV=test

echo 📦 安装依赖...
npm ci

echo 🔍 运行类型检查...
npm run type-check

echo 🧹 运行代码检查...
npm run lint

echo 🧪 运行测试...
npm run test

echo 🏗️ 构建项目...
npm run build

echo 📚 构建 Storybook...
npm run build-storybook

echo ✅ 所有检查通过！
pause