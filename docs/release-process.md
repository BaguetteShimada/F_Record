# F_Record 发布流程

这份流程用于从 `refactor` 分支发布 GitHub Release。不要在未完成手动验证前发布正式版本。

## 发布门槛

发布前必须满足：

1. `refactor` 分支已同步远端，工作树干净。
2. 自动化检查通过：
   ```powershell
   pnpm install
   pnpm run test
   pnpm run build
   ```
3. `dist/F_Record.zip` 已生成。
4. 构建脚本确认 zip 内没有 `ffmpeg`、`ffmpeg.exe`、`ffprobe`、`ffprobe.exe`。
5. [手动验证清单](./manual-validation.md) 中的关键场景已完成：
   - Photoshop 2022-2025 至少覆盖计划发布支持的版本。
   - 开启/关闭记录正常。
   - 过程图片保存和计数正常。
   - 设置项可保存并在重启后恢复。
   - 系统 `ffmpeg/ffprobe` 的 PATH、环境变量、缺失错误提示都已验证。
   - 导出 mp4 成功，且损坏 JPG 不会导致序列编号空洞。
   - 旧版 `%APPDATA%\F_Record` 数据可读取。

## 版本号建议

当前已发布版本为 `3.0`，仓库 package 版本为 `3.0.0`。

`refactor` 分支移除了随包附带的 ffmpeg/ffprobe，改为依赖系统 ffmpeg。核心功能保持不变，但安装前置条件发生变化。建议发布为：

- `3.1.0`：如果确认这是向后兼容的安装说明更新。
- `4.0.0`：如果希望把“不再内置 ffmpeg”视为安装兼容性破坏。

发布前需要同步更新：

- `package.json`
- `cep/package.json`
- `generator/package.json`
- `README.md` 中的当前版本和下载链接
- `README_EN.md` 中的当前版本和下载链接

## 发布步骤

1. 确认分支和状态：
   ```powershell
   git checkout refactor
   git pull
   git status --short --branch
   ```

2. 更新版本号并提交：
   ```powershell
   git add package.json cep/package.json generator/package.json README.md README_EN.md
   git commit -m "Release 3.1.0"
   git push
   ```

3. 创建 tag：
   ```powershell
   git tag 3.1.0
   git push fork 3.1.0
   ```

4. 生成发布包：
   ```powershell
   pnpm run build
   ```

5. 在 GitHub 创建 Release：
   - 仓库：`https://github.com/BaguetteShimada/F_Record`
   - Tag：`3.1.0`
   - Title：`F_Record 3.1.0`
   - Asset：上传 `dist/F_Record.zip`

6. Release notes 至少说明：
   - 重构 CEP 面板和 Generator 录制核心。
   - 增加类型模型、存储层、错误处理和测试。
   - 导出改为使用系统 `ffmpeg/ffprobe`。
   - 安装前需要将 ffmpeg 加入 PATH，或设置 `F_RECORD_FFMPEG_PATH` 和 `F_RECORD_FFPROBE_PATH`。
   - 保持现有 `%APPDATA%\F_Record` 数据格式。

## 回滚策略

如果发布后发现 Photoshop 兼容性问题：

1. 保留失败机器上的 `%APPDATA%\F_Record` 副本。
2. 记录 Photoshop 版本、Windows 版本、ffmpeg 配置方式、失败步骤。
3. 在 GitHub Release 中标记该版本为 prerelease 或撤下资产。
4. 回退到上一稳定 release，并用失败数据补自动化或手动验证用例。
