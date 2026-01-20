// asyncLocalStorage.js
const { AsyncLocalStorage } = require('async_hooks');

const asyncLocalStorage = new AsyncLocalStorage();

function getNamespace() {
    return asyncLocalStorage.getStore();
}

module.exports = {
    asyncLocalStorage,
    getNamespace,
};
