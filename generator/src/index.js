(function () {
    "use strict";

    const { createRuntime } = require("./runtime");
    const runtime = createRuntime();

    exports.init = runtime.init;
}())
