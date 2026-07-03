function createCaptureGate() {
    let isActive = false;

    function tryStart() {
        if (isActive) {
            return false;
        }
        isActive = true;
        return true;
    }

    function finish() {
        isActive = false;
    }

    async function run(task) {
        if (!tryStart()) {
            return { started: false };
        }

        try {
            const value = await task();
            return { started: true, value };
        } finally {
            finish();
        }
    }

    return {
        finish,
        isActive: () => isActive,
        run,
        tryStart,
    };
}

module.exports = {
    createCaptureGate,
};
