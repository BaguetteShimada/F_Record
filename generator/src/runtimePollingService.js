const { createPollingTask } = require("./pollingTask");

function createRuntimePollingService(options) {
    const createPollingTaskFn = options.createPollingTask || createPollingTask;
    const logger = options.logger;
    const tasks = [];

    function createLoggedPollingTask(name, intervalMs, run, runImmediately) {
        return createPollingTaskFn({
            intervalMs,
            run,
            runImmediately,
            onError: error => {
                logger.error(name, error);
            },
        });
    }

    function start() {
        stop();
        tasks.push(
            createLoggedPollingTask("loopUpdateConfigData", 500, options.updateConfigData, true),
            createLoggedPollingTask("loopUpdateDocument", 500, options.updateDocument, true),
            createLoggedPollingTask("loopUpdateDocumentTimeSpent", 1000, options.updateDocumentTimeSpent, false),
        );
        tasks.forEach(task => task.start());
    }

    function stop() {
        while (tasks.length > 0) {
            tasks.pop().stop();
        }
    }

    return {
        start,
        stop,
    };
}

module.exports = {
    createRuntimePollingService,
};
