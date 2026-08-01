# Introduction to F_Record

A lightweight Photoshop plugin used to record drawing processes.

**GitHub**: https://github.com/BaguetteShimada/F_Record

https://github.com/user-attachments/assets/0221cee9-ac70-48d1-b85a-b85667813b90

**Plugin Principle**: It uses Photoshop's Generator interface. Whenever there is a change on the canvas, it captures a snapshot. In the end, these snapshots are combined into a single video.

**Current Plugin Version**: 3.2.0

**Supported Operating Systems**: Windows 

**Supported Photoshop Versions**: Photoshop 2022 ~ 2025

**Manual Validation Checklist**: [docs/manual-validation.md](./docs/manual-validation.md)

**Release Process**: [docs/release-process.md](./docs/release-process.md)

## Installation

1. Install ffmpeg, and make sure `ffmpeg` and `ffprobe` can be run from the system environment.
   The recommended setup is to add ffmpeg's `bin` directory to the Windows `PATH`. If you do not want to change `PATH`, set `F_RECORD_FFMPEG_PATH` and `F_RECORD_FFPROBE_PATH` to the full paths of `ffmpeg.exe` and `ffprobe.exe`.

2. Exporting video starts a separate Node.js worker. Make sure `node` can be run from the system environment, or set `F_RECORD_NODE_PATH` to the full path of `node.exe`.

3. Download the [F_Record.zip](https://github.com/BaguetteShimada/F_Record/releases/download/3.2.0/F_Record.zip) Release asset and extract it. Do not download GitHub's automatically generated `Source code` archives; they are not installable plugin packages.

4. Close Photoshop. Open an **administrator PowerShell** in the extracted directory and run:

   ```powershell
   powershell -NoProfile -ExecutionPolicy Bypass -File .\installPhotoshopPlugin.ps1
   ```

   The script installs to `C:\Program Files\Adobe\Adobe Photoshop 2025` by default and validates the Photoshop version, plugin manifest, and destination directories. If Photoshop is installed elsewhere, specify its path:

   ```powershell
   powershell -NoProfile -ExecutionPolicy Bypass -File .\installPhotoshopPlugin.ps1 -PhotoshopRoot "D:\Adobe Photoshop 2025"
   ```

5. If the installer script cannot be used, you can follow the same manual two-folder layout used by the Photoshop 2022 package. Copy the two plugin folders from the extracted directory into the matching locations under the Photoshop installation directory. The Photoshop directory typically looks like `D:\Adobe Photoshop 2025` (use the corresponding year for another supported version) and must contain the actual `Photoshop.exe`, not a shortcut.

   - Copy `com.f_know.f_record.cep` to `D:\Adobe Photoshop 2025\Required\CEP\extensions`.
   - Copy `com.f_know.f_record.generator` to `D:\Adobe Photoshop 2025\Plug-ins\Generator`.

   Create the `extensions` or `Generator` directory if it does not already exist.

6. Open Photoshop, then go to **Edit → Preferences → Plugins**. Check whether **Enable Generator** and **Load Extension Panels** are selected.
   - If they are not checked, select them and restart Photoshop.
   - If they are already checked, there’s no need to restart.

7. Finally, go to **Window → Extensions (legacy)** in Photoshop. You should see the plugin listed there. Click on it to start using it.

## Usage Instructions

1. For first-time use, toggle on the plugin. Once activated, it will automatically record your drawing process. For each different document, the process is saved in a separate folder. You can close or hide the plugin panel; when you restart Photoshop, the plugin automatically starts in the background to keep recording.

2. It’s recommended to set up a folder path for saving the process images in the Settings. The default path is on the C drive. You may want to change it to a location with sufficient space. It’s not recommended to change this path in the middle of a drawing process. If you really need to, you must manually move all snapshots from the old path to the new one.

3. The default resolution and quality settings are usually enough for basic needs. The higher you set them, the better the final video quality will be—but the more space the images will occupy. If your computer has plenty of free space, you can set them to the highest values. A friendly reminder: when estimating storage requirements for images, do not rely on an empty canvas for your calculations, because the size of a JPG file depends on both its resolution and the complexity of the image content.

---
