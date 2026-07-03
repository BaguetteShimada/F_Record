# F_Record 手动验证清单

这份清单用于验证 `refactor` 分支在真实 Photoshop 环境中的兼容性。当前自动化测试只能覆盖纯逻辑、构建和打包，不能替代 Photoshop 2022-2025 的人工验证。

## 1. 构建产物

1. 在仓库根目录运行：
   ```powershell
   pnpm install
   pnpm run test
   pnpm run build
   ```
2. 确认生成 `dist/F_Record.zip`。
3. 确认 zip 内只有：
   - `com.f_know.f_record.cep`
   - `com.f_know.f_record.generator`
4. 确认 zip 内没有 `ffmpeg`、`ffmpeg.exe`、`ffprobe`、`ffprobe.exe`。

预期结果：测试和构建通过，构建脚本不会报出 bundled ffmpeg/ffprobe 错误。

## 2. Photoshop 安装矩阵

在可用机器上优先验证以下组合：

| Photoshop 版本 | Windows | 结果 |
| --- | --- | --- |
| Photoshop 2022 | Windows 10 或 11 | 待验证 |
| Photoshop 2023 | Windows 10 或 11 | 待验证 |
| Photoshop 2024 | Windows 10 或 11 | 待验证 |
| Photoshop 2025 | Windows 10 或 11 | 待验证 |

每个版本都按 README 安装：

1. 关闭 Photoshop。
2. 用管理员 PowerShell 运行安装脚本：
   ```powershell
   .\scripts\installPhotoshopPlugin.ps1 -PhotoshopRoot "C:\Program Files\Adobe\Adobe Photoshop 2022"
   ```
   如需验证其他版本，把 `PhotoshopRoot` 改成对应 Photoshop 主目录。
3. 在 Photoshop 首选项中启用 Generator 和旧版扩展面板。
4. 从 `窗口 -> 扩展(旧版)` 打开 F_Record。

预期结果：面板可打开，Generator 后台插件正常加载，Photoshop 启动时无插件错误弹窗。

## 3. 系统 ffmpeg

验证三种场景：

1. PATH 可用：
   ```powershell
   ffmpeg -version
   ffprobe -version
   ```
   导出视频应成功。

2. PATH 不可用，但设置环境变量：
   ```powershell
   setx F_RECORD_FFMPEG_PATH "D:\ffmpeg\bin\ffmpeg.exe"
   setx F_RECORD_FFPROBE_PATH "D:\ffmpeg\bin\ffprobe.exe"
   ```
   重启 Photoshop 后导出视频应成功。

3. PATH 和环境变量都不可用：
   导出时应出现明确提示：`ffmpeg` 或 `ffprobe` 不可用，并可点开详情查看错误信息。

预期结果：插件不再依赖自带 ffmpeg 二进制，缺失时错误可理解。

## 4. 录制流程

1. 新建文档。
2. 打开 F_Record 面板。
3. 开启记录。
4. 连续绘制几笔，等待过程图片生成。
5. 关闭面板，再继续绘制。
6. 重启 Photoshop，重新打开同一文档或新建文档继续绘制。

预期结果：

- 过程图片保存在配置的 process image folder 中。
- 不同文档使用不同的记录目录。
- 面板关闭后仍能后台记录。
- 重启 Photoshop 后配置仍保持。
- 计数、用时、当前文档信息能刷新。

## 5. 设置流程

逐项修改并重启 Photoshop 验证持久化：

- 过程图片文件夹
- 分辨率
- 质量
- 离开时间
- 语言

预期结果：设置保存到现有 `%APPDATA%\F_Record` JSON 文件，不需要迁移用户已有数据。

## 6. 导出流程

1. 对已有记录的文档点击导出。
2. 分别选择 16:9、4:3、1:1、3:4、9:16、画布比例。
3. 分别选择可用的时长选项和原始时长。
4. 导出到普通用户目录，比如 `Videos` 或 `Desktop`。
5. 打开导出后的 mp4。

预期结果：

- 导出进度能更新。
- 导出成功后可以打开视频。
- 视频尺寸为偶数宽高。
- 没有有效记录图片时显示明确错误。
- 损坏 JPG 被跳过后，仍能用连续编号生成视频。

## 7. 数据兼容

用旧版本已经生成过的 `%APPDATA%\F_Record` 数据验证：

1. 保留旧的 `configData.json`。
2. 保留旧的 `nowDocument.json`。
3. 保留旧的 `documentValues/*.json`。
4. 保留旧的过程图片目录。

预期结果：新版本能读取旧 JSON，缺失或新增字段会使用默认值，不要求用户手动迁移。

## 8. 回滚

如果验证失败：

1. 记录 Photoshop 版本、Windows 版本、失败步骤和错误详情。
2. 保留 `%APPDATA%\F_Record` 目录副本。
3. 回退到发布前安装包，确认是否为重构引入的回归。

预期结果：每个失败都能对应到可复现步骤和数据样本。
