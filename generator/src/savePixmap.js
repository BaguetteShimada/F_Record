const fs = require('fs');
const path = require('path');
const Jimp = require('jimp');
const {
    clampJpgQuality,
    getSavePixmapFormatType,
    getTargetImageSize,
    normalizeSavePixmapSettings,
} = require("./savePixmapSettings");
const { createInitialSavePixmapBuffer } = require("./savePixmapBuffer");
const { copyPixmapPixelsToRgbaBuffer } = require("./savePixmapCopy");
const { assertValidSavePixmapInput } = require("./savePixmapValidation");

/**
 * 将Photoshop像素数据保存为图像文件
 * @param {Object} pixmap - Photoshop生成的pixmap数据对象
 * @param {string} filePath - 要保存的文件路径
 * @param {Object} saveSettings - 保存设置
 * @returns {Promise<boolean>} - 保存成功返回true
 */
async function savePixmap(pixmap, filePath, saveSettings) {
    try {
        // 参数验证
        assertValidSavePixmapInput(pixmap, filePath, saveSettings);
        
        // 确保saveSettings包含所需属性
        saveSettings = normalizeSavePixmapSettings(pixmap, saveSettings);
        
        // 确保目标目录存在
        const targetDir = path.dirname(filePath);
        if (!fs.existsSync(targetDir)) {
            fs.mkdirSync(targetDir, { recursive: true });
        }

        // 从saveSettings中获取参数
        const { format, quality, extract, padding, backgroundColor } = saveSettings;
        
        // 创建目标图像宽高
        const targetSize = getTargetImageSize(extract, padding);
        const targetWidth = targetSize.width;
        const targetHeight = targetSize.height;
        
        if (targetWidth <= 0 || targetHeight <= 0) {
            throw new Error('目标图像尺寸无效');
        }
        
        // 创建一个新的Jimp图像
        const image = new Jimp(targetWidth, targetHeight);
        
        // 根据格式决定填充颜色
        const formatType = getSavePixmapFormatType(format);
        // 创建一个临时buffer来存储图像数据
        const buffer = createInitialSavePixmapBuffer(targetWidth, targetHeight, formatType, backgroundColor);
        
        // 批量处理图像数据，调整像素顺序
        copyPixmapPixelsToRgbaBuffer({
            backgroundColor,
            buffer,
            extract,
            formatType,
            padding,
            pixmap,
            targetHeight,
            targetWidth,
        });
        
        // 将buffer数据加载到Jimp图像
        image.bitmap.data = buffer;
        image.bitmap.width = targetWidth;
        image.bitmap.height = targetHeight;
        
        // 设置图像质量 (Jimp质量范围是0-100，Photoshop也是0-100)
        const jpgQuality = clampJpgQuality(quality);
        
        // 保存图像
        if (formatType === 'png') {
            await image.writeAsync(filePath);
        } else {
            // 默认为JPEG
            await image.quality(jpgQuality).writeAsync(filePath);
        }
        
        return true;
    } catch (error) {
        console.error('保存图像失败:', error);
        throw error;
    }
}

module.exports = savePixmap;
