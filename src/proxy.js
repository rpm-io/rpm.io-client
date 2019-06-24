

function proxy(self, spawn) {
    let proxify = (response) => {
        if (response && !response.primitive){
            return proxy(response, spawn)
        } else{
            return response.value
        }
    }
    self.call = function() {
        return spawn.send({
            "com": "call",
            "var": self.data,
            "params": Array.prototype.slice.call(arguments)
        }).then(proxify)
    }

    self.close = function(){
        spawn.close();
    }
    
    self.newInstance = function() {
        return spawn.send({
            "com": "new",
            "var": self.data,
            "params": Array.prototype.slice.call(arguments)
        }).then(proxify)
    }

    self.subscribe = function(name, cb) {
        return spawn.send({
            "com": "subscribe",
            "var": name
        }, (response) => {
            cb(proxify(response))
        })
    }

    self.subscribeAll = function(all){
        for (let name in all){
            self.subscribe(name, all[name]);
        }
    }

    self.get = function(index) {
        return spawn.send({
            "com": "get",
            "var": self.data,
            "index": index
        }).then(proxify)
    }
    return new Proxy(self, {
        get(self, name) {
            if (!self[name]){
                return spawn.send({ 
                    "com": "attr", 
                    "var": self.data,
                    "attr": name 
                }).then(proxify);
            }
            return self[name];
        }
    });
 
}

module.exports = proxy;