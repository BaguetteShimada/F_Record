const RECENT_EXPORT_IGNORE_MS = 1000 * 2;

function shouldHandleImageChanged(changedEvent, configData, nowDocument, nowMs) {
    if (configData === null || !configData.isEnabled) {
        return false;
    }
    if (nowDocument === null || nowDocument.id !== changedEvent.id || nowDocument.createTime === null) {
        return false;
    }
    if (!hasPixelChanges(changedEvent)) {
        return false;
    }
    if (configData.lastExportTime !== null && nowMs - configData.lastExportTime < RECENT_EXPORT_IGNORE_MS) {
        return false;
    }
    return true;
}

function hasPixelChanges(changedEvent) {
    return Array.isArray(changedEvent.layers) && changedEvent.layers.some(layer => layer && layer.pixels === true);
}

function applyTimeSpentTick(documentValue, idleTimeoutValue, nowMs) {
    if (!shouldAddTimeSpent(documentValue.lastModifiedTime, parseInt(idleTimeoutValue), nowMs)) {
        return Object.assign({}, documentValue);
    }
    return Object.assign({}, documentValue, {
        timeSpent: documentValue.timeSpent + 1,
    });
}

function shouldAddTimeSpent(lastModifiedTime, idleTimeout, nowMs) {
    if (lastModifiedTime === null) {
        return false;
    }
    return idleTimeout === 0 || nowMs - lastModifiedTime <= idleTimeout * 60 * 1000;
}

function getNextImageName(currentCount) {
    return `${pad(currentCount + 1, 6)}.jpg`;
}

function markImageSaved(documentValue, nowMs) {
    return Object.assign({}, documentValue, {
        count: documentValue.count + 1,
        lastModifiedTime: nowMs,
    });
}

function pad(num, size) {
    let value = num.toString();
    while (value.length < size) {
        value = "0" + value;
    }
    return value;
}

module.exports = {
    RECENT_EXPORT_IGNORE_MS,
    applyTimeSpentTick,
    getNextImageName,
    hasPixelChanges,
    markImageSaved,
    shouldAddTimeSpent,
    shouldHandleImageChanged,
};
