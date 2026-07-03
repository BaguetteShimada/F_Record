function createLogger(generatorLogger) {
    return {
        error: (context, error) => {
            if (!generatorLogger || typeof generatorLogger.error !== "function") {
                return;
            }
            generatorLogger.error(`${context} error: `, getErrorDetails(error));
        },
    };
}

function getErrorDetails(error) {
    if (error && error.stack) {
        return error.stack;
    }
    return error;
}

module.exports = {
    createLogger,
    getErrorDetails,
};
