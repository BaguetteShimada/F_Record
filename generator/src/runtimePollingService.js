const { createPollingTask } = require("./pollingTask");
const { createRuntimePollingTaskDefinitions } = require("./runtimePollingTasks");

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
        createRuntimePollingTaskDefinitions(options).forEach(taskDefinition => {
            tasks.push(createLoggedPollingTask(
                taskDefinition.name,
                taskDefinition.intervalMs,
                taskDefinition.run,
                taskDefinition.runImmediately,
            ));
        });
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
