# F_Record介绍

[README_EN.md](./README_EN.md)

一款用来录制绘画过程的轻量级PS插件。

**GitHub**: https://github.com/BaguetteShimada/F_Record

https://github.com/user-attachments/assets/0221cee9-ac70-48d1-b85a-b85667813b90

**插件原理**：调用PS生成器的接口，当画布发生变化时截取过程图片，最后将图片连起来生成录像。

**当前插件版本**：3.2.0

**支持系统**：Windows

**支持PS版本**：PS 2022 ~ 2025

**手动验证清单**：[docs/manual-validation.md](./docs/manual-validation.md)

**发布流程**：[docs/release-process.md](./docs/release-process.md)

## 安装方法

1. 安装 ffmpeg，并确认系统环境中可以直接运行 `ffmpeg` 和 `ffprobe`。
   推荐将 ffmpeg 的 `bin` 目录加入 Windows 的 `PATH`。如果不想改 PATH，也可以分别设置环境变量 `F_RECORD_FFMPEG_PATH` 和 `F_RECORD_FFPROBE_PATH`，指向 `ffmpeg.exe` 和 `ffprobe.exe` 的完整路径。

2. 导出视频时会启动一个独立的 Node.js worker。请确认系统环境中可以直接运行 `node`，或设置环境变量 `F_RECORD_NODE_PATH`，指向 `node.exe` 的完整路径。

3. 从 GitHub Release 下载发布资产 [F_Record.zip](https://github.com/BaguetteShimada/F_Record/releases/download/3.2.0/F_Record.zip) 并解压。请勿下载 GitHub 自动生成的 `Source code` 压缩包，它不是可安装的插件包。

4. 关闭 Photoshop，在解压目录中打开**管理员 PowerShell**，运行：

   ```powershell
   powershell -NoProfile -ExecutionPolicy Bypass -File .\installPhotoshopPlugin.ps1
   ```

   脚本默认安装到 `C:\Program Files\Adobe\Adobe Photoshop 2025`，并会检查 Photoshop 版本、插件清单和目标目录。如果 Photoshop 安装在其他位置，请指定路径：

   ```powershell
   powershell -NoProfile -ExecutionPolicy Bypass -File .\installPhotoshopPlugin.ps1 -PhotoshopRoot "D:\Adobe Photoshop 2025"
   ```

5. 如果无法使用安装脚本，也可以沿用 Photoshop 2022 版本的手工安装方式：把解压目录中的两个插件文件夹复制到 Photoshop 主目录下的对应位置。Photoshop 主目录形如 `D:\Adobe Photoshop 2025`（其他支持版本替换对应年份），并应包含真正的 `Photoshop.exe`，而不是快捷方式。

   - 将 `com.f_know.f_record.cep` 复制到 `D:\Adobe Photoshop 2025\Required\CEP\extensions`。
   - 将 `com.f_know.f_record.generator` 复制到 `D:\Adobe Photoshop 2025\Plug-ins\Generator`。

   如果 `extensions` 或 `Generator` 目录不存在，请手动创建。

6. 打开PS，依次点开"编辑-首选项-增效工具"，看看"启用生成器"和"载入扩展面板"是否勾选。
   如果没有勾选，则需要勾上后重启PS，如果已经勾选，则不需要重启。

7. 最后，在PS的"窗口-扩展（旧版）"中就能找到插件，点开后即可正常使用。

## 使用说明

1. 第一次使用，把开启插件的开关打开，然后插件就会自动记录你的绘画过程了。对于不同文档的绘画过程，会自动存储在不同的文件夹中。插件面板可以关闭或隐藏，重启PS后，插件也会在后台自动启动保持记录。

2. 建议去设置中设置一下存放过程图片的文件夹，默认是C盘下的一个路径，可以根据自己电脑的情况改成一个有足够空间的路径。不建议一张图画到一半去改这个路径，如果真的要改就得把原路径下的过程图片全部转移到新路径去。

3. 分辨率和质量用默认的基本够用，调得越高最后生成的视频质量越高，过程图片占用的空间也越大，要是电脑空间足够大的话也可以直接调成最高的。友情提醒一下，在估算图片占用空间时，不要用空白的画布去估算，因为jpg的占用空间不光与分辨率有关，还与图片本身内容的复杂程度有关。
