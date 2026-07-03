function createPollingTask(options) {
    const run = options.run;
    const intervalMs = options.intervalMs;
    const onError = options.onError;
    const runImmediately = options.runImmediately !== false;
    let isActive = false;
    let timer = null;

    function start() {
        if (isActive) {
            return;
        }
        isActive = true;
        if (runImmediately) {
            execute();
        } else {
            schedule(intervalMs);
        }
    }

    function stop() {
        isActive = false;
        if (timer !== null) {
            clearTimeout(timer);
            timer = null;
        }
    }

    function schedule(delayMs) {
        if (!isActive) {
            return;
        }
        timer = setTimeout(execute, delayMs);
    }

    async function execute() {
        timer = null;
        if (!isActive) {
            return;
        }
        try {
            await run();
        } catch (error) {
            if (onError) {
                onError(error);
            } else {
                throw error;
            }
        }
        schedule(intervalMs);
    }

    return {
        isActive: () => isActive,
        start,
        stop,
    };
}

module.exports = {
    createPollingTask,
};
