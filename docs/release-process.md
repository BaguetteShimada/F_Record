# F_Record 发布流程

这份流程用于从 `photoshop-2025-compat` 分支发布 `3.2.0`。推送版本标签后，GitHub Actions 会自动检查、构建并创建 GitHub Release；不要再手工上传本机构建的压缩包。

## 发布门槛

发布前必须满足：

1. `photoshop-2025-compat` 分支已同步到 `origin`，工作树干净。
2. 所有版本信息一致：
   - `package.json`
   - `cep/package.json`
   - `generator/package.json`
   - `cep/src/package.json`
   - `cep/src/CSXS/manifest.xml` 中的 bundle 与扩展版本
   - `README.md` 和 `README_EN.md` 中的当前版本与 Release 下载链接
   - `docs/releases/3.2.0.md` 的文件名和标题
3. 本地自动化检查通过：

   ```powershell
   pnpm install --frozen-lockfile
   pnpm run check
   ```

4. `dist/F_Record.zip` 已生成，且顶层包含：
   - `installPhotoshopPlugin.ps1`
   - `com.f_know.f_record.cep`
   - `com.f_know.f_record.generator`
5. 构建检查确认压缩包包含必要的 CEP/Generator 入口文件，且不包含 `ffmpeg`、`ffmpeg.exe`、`ffprobe`、`ffprobe.exe` 或原生 `.node` 模块。
6. [手动验证清单](./manual-validation.md) 中的关键场景已完成：
   - Photoshop 2022–2025 至少覆盖计划发布支持的版本。
   - 开启/关闭记录、过程图片保存和计数正常。
   - 设置项可保存并在重启后恢复。
   - 系统 `ffmpeg/ffprobe` 的 PATH、环境变量和缺失错误提示均已验证。
   - 系统 `node` 的 PATH、`F_RECORD_NODE_PATH` 和缺失错误提示均已验证。
   - 导出 mp4 成功，损坏 JPG 不会导致序列编号空洞。
   - 旧版 `%APPDATA%\F_Record` 数据可读取。

## 版本信息

本次正式版本为 `3.2.0`。Tag 不带 `v` 前缀，Release 标题为 `F_Record 3.2.0`，唯一发布资产为 `F_Record.zip`。发布工作流会在构建前强制核对所有 package、manifest、README 和 release notes 的版本；任何一项不一致都会终止发布。

## 发布步骤

1. 确认分支、远端和工作区状态：

   ```powershell
   git switch photoshop-2025-compat
   git status --short --branch
   git remote -v
   ```

2. 安装锁定依赖并运行完整检查：

   ```powershell
   pnpm install --frozen-lockfile
   pnpm run check
   ```

3. 提交版本、代码、工作流和文档，然后推送分支：

   ```powershell
   git add --all
   git commit -m "Release F_Record 3.2.0"
   git push --set-upstream origin photoshop-2025-compat
   ```

4. 在已经包含发布工作流的提交上创建带说明的标签，并推送标签：

   ```powershell
   git tag -a 3.2.0 -m "F_Record 3.2.0"
   git push origin 3.2.0
   ```

5. 推送 `3.2.0` 标签后，GitHub Actions 的 Release 工作流会自动：
   - 检出标签对应的提交。
   - 按锁文件安装 pnpm 依赖。
   - 运行完整检查并验证所有版本信息一致。
   - 生成 `dist/F_Record.zip`。
   - 使用 `docs/releases/3.2.0.md` 作为说明，创建标题为 `F_Record 3.2.0` 的 GitHub Release，并上传 `F_Record.zip`。

6. 在 GitHub 上确认 Release 工作流成功，并检查：
   - Tag 为 `3.2.0`，标题为 `F_Record 3.2.0`。
   - Release 不是草稿或预发布版本。
   - 可安装资产为 [F_Record.zip](https://github.com/BaguetteShimada/F_Record/releases/download/3.2.0/F_Record.zip)；GitHub 自动显示的 `Source code` 不属于安装包。
   - 下载并解压资产后，顶层包含安装脚本和两个插件目录。

## 安装冒烟验证

关闭 Photoshop，在 Release 资产的解压目录中打开管理员 PowerShell。默认 Photoshop 2025 路径可直接运行：

```powershell
powershell -NoProfile -ExecutionPolicy Bypass -File .\installPhotoshopPlugin.ps1
```

自定义安装位置时追加参数：

```powershell
powershell -NoProfile -ExecutionPolicy Bypass -File .\installPhotoshopPlugin.ps1 -PhotoshopRoot "D:\Adobe Photoshop 2025"
```

可先追加 `-WhatIf` 做只读预检。若脚本不可用，按 Photoshop 2022 包的布局手工复制 `com.f_know.f_record.cep` 与 `com.f_know.f_record.generator` 两个目录，具体目标位置见项目 README。

## 回滚策略

如果发布后发现兼容性问题：

1. 暂停分发并在 Release 页面清楚标记已知问题；不要静默移动已有的 `3.2.0` 标签。
2. 保留失败机器上的 `%APPDATA%\F_Record` 副本，并记录 Photoshop、Windows、ffmpeg 和 Node.js 配置及失败步骤。
3. 从修复提交发布新的补丁版本标签，不复用已经发布的版本号。
4. 在修复完成前，引导用户回退到上一稳定 Release，并把失败场景补入自动化或手动验证清单。
