const fs = require("fs");
const path = require('path');
const ffmpeg = require('fluent-ffmpeg');
const {
    calculateExportProgress,
    calculateExportVideoSize,
    copyValidReplayImages,
    createExportError,
    listReplayImageFiles,
    resolveExportBinaries,
    serializeError,
} = require('./exportReplayUtils');

const FPS = 25;

process.on('message', (exportParams) => {
    _exportReplay(exportParams)
        .then(() => {
            process.send({
                type: "exportReplaySuccess",
                data: null
            });
        })
        .catch(error => {
            process.send({
                type: "exportReplayError",
                data: serializeError(error)
            });
        });
})

const statusInfo = [
    {
        status: "loading image...",
        ratio: 0.1
    },
    {
        status: "generating video...",
        ratio: 0.8
    },
    {
        status: "saving video...",
        ratio: 0.05
    },
    {
        status: "saving video...",
        ratio: 0.05
    },
]

async function _exportReplay(exportParams) {
    const exportBinaries = resolveExportBinaries();
    ffmpeg.setFfmpegPath(exportBinaries.ffmpeg);
    ffmpeg.setFfprobePath(exportBinaries.ffprobe);

    const { configData, documentValue, exportSettings, exportTempFolderPath } = exportParams;
    const imageFolderPath = path.join(configData.processImageFolderPath, documentValue.createTime);
    const imageFiles = listReplayImageFiles(imageFolderPath);

    if (imageFiles.length === 0) {  
        throw createExportError("EXPORT_IMAGE_FILES_EMPTY", 'No image files found');
    }


    let lastProgressTime = 0;

    const postNowProgress = (index, percent, force = false) => {
        const now = Date.now();
        if (now - lastProgressTime >= 2000 || force) {
            process.send({
                type: "exportReplayProgress", 
                data: calculateExportProgress(statusInfo, index, percent)
            });
            lastProgressTime = now;
        }
    }

    postNowProgress(0, 0, true)

    const copiedImageCount = copyValidReplayImages(imageFolderPath, imageFiles, exportTempFolderPath, {
        onFile: (_file, index) => {
            postNowProgress(0, index / imageFiles.length);
        },
    });
    postNowProgress(0, 1, true);
    if (copiedImageCount === 0) {
        throw createExportError("EXPORT_VALID_IMAGE_FILES_EMPTY", 'No valid image files found');
    }

    postNowProgress(1, 0, true)

    const { width, height } = calculateExportVideoSize(configData, documentValue, exportSettings);

    await new Promise((resolve, reject) => {
        const input = `${path.join(exportTempFolderPath, '%06d.jpg').replace(/\\/g, '/')}`;
        const output = path.join(exportTempFolderPath, 'mainVideo.ts');
        
        let baseFfmpeg = ffmpeg()
                            .input(input)
                            .inputOptions(['-f image2'])
                            .inputFPS(FPS)
                            .videoCodec('libx264')
        if (exportSettings.duration !== "0") {
            const duration = parseFloat(exportSettings.duration);
            let k = (duration - 3) / (copiedImageCount / FPS);
            k = Math.round(Math.min(Math.max(k, 0.001), 1) * 1000) / 1000;
            baseFfmpeg = baseFfmpeg.videoFilters('setpts=' + k + '*PTS');
        }
        baseFfmpeg
            .size(`${width}x${height}`)
            .autopad()
            .format('mpegts')
            .outputOptions('-pix_fmt yuv420p')
            .output(output)
            .on('progress', (progress) => {
                postNowProgress(1, progress.percent / 100)
            })
            .on('end', () => {
                resolve();
            })
            .on('error', (err) => {
                reject(new Error("ffmpeg error: " + err.message));
            })
            .run();
    });

    postNowProgress(2, 0, true)

    await new Promise((resolve, reject) => {
        const input = path.join(exportTempFolderPath, 'finalJPG.jpg');
        const output = path.join(exportTempFolderPath, 'startVideo.ts');
        ffmpeg(input)
            .inputOptions('-loop 1')
            .inputFPS(FPS)
            .duration(1)
            .videoCodec('libx264')
            .size(`${width}x${height}`)
            .autopad()
            .format('mpegts')
            .outputOptions(['-shortest', '-pix_fmt yuv420p'])
            .output(output)
            .on('end', () => {
                resolve();
            })
            .on('error', (err) => {
                reject(new Error("ffmpeg error: " + err.message));
            })
            .run();
    });

    postNowProgress(3, 0, true)

    await new Promise((resolve, reject) => {
        const input = path.join(exportTempFolderPath, 'finalJPG.jpg');
        const output = path.join(exportTempFolderPath, 'endVideo.ts');
        ffmpeg(input)
            .inputOptions('-loop 1')
            .inputFPS(FPS)
            .duration(2)
            .videoFilters('fade=type=in:st=0:d=1')
            .videoCodec('libx264')
            .size(`${width}x${height}`)
            .autopad()
            .format('mpegts')
            .outputOptions(['-shortest', '-pix_fmt yuv420p'])
            .output(output)
            .on('end', () => {
                resolve();
            })
            .on('error', (err) => {
                reject(new Error("ffmpeg error: " + err.message));
            })
            .run();
    });

    await new Promise((resolve, reject) => {
        const input1 = path.join(exportTempFolderPath, 'startVideo.ts');
        const input2 = path.join(exportTempFolderPath, 'mainVideo.ts');
        const input3 = path.join(exportTempFolderPath, 'endVideo.ts');
        const output = path.join(exportTempFolderPath, 'outputVideo.mp4');
        ffmpeg()
            .input(`concat:${input1}|${input2}|${input3}`)
            .videoCodec('copy')
            .output(output)
            .on('end', () => {
                resolve();
            })
            .on('error', (err) => {
                reject(new Error("ffmpeg error: " + err.message));
            })
            .run();
    });

    
    const outputPath = path.join(exportTempFolderPath, 'outputVideo.mp4');
    try {
        fs.copyFileSync(outputPath, exportSettings.savePath);
    } catch (error) {
        throw new Error("copy file error: " + error.message);
    }

    
    postNowProgress(3, 1, true)

}
