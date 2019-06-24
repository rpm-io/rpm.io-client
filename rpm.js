let Client = require('./src/client');
const proxy = require('./src/proxy2');

function require_remote(uri){
    let client = new Client(uri);
    return client.start().then((self) => {
        return proxy(self, client)
    })
}

module.exports = { require_remote };