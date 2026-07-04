const assert = require("assert");
const Mutex = require("../src/mutex");

(async () => {
    const mutex = new Mutex();
    const events = [];

    const firstUnlock = await mutex.lock();
    events.push("first-locked");

    let secondResolved = false;
    let thirdResolved = false;

    const secondLock = mutex.lock().then(unlock => {
        secondResolved = true;
        events.push("second-locked");
        return unlock;
    });
    const thirdLock = mutex.lock().then(unlock => {
        thirdResolved = true;
        events.push("third-locked");
        return unlock;
    });

    await Promise.resolve();
    assert.strictEqual(secondResolved, false);
    assert.strictEqual(thirdResolved, false);

    firstUnlock();
    const secondUnlock = await secondLock;
    assert.strictEqual(secondResolved, true);
    assert.strictEqual(thirdResolved, false);
    assert.deepStrictEqual(events, ["first-locked", "second-locked"]);

    secondUnlock();
    const thirdUnlock = await thirdLock;
    assert.strictEqual(thirdResolved, true);
    assert.deepStrictEqual(events, ["first-locked", "second-locked", "third-locked"]);

    thirdUnlock();
    const fourthUnlock = await mutex.lock();
    events.push("fourth-locked");
    fourthUnlock();
    assert.deepStrictEqual(events, [
        "first-locked",
        "second-locked",
        "third-locked",
        "fourth-locked",
    ]);
})().catch(error => {
    console.error(error);
    process.exit(1);
});
