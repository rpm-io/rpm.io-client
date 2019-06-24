
const decorate = (obj, spawn) => {
    
    const proxify = (response) => {
        if (response && !response.primitive) {
            return proxy(response, spawn)
        } else{
            return response.value
        }
    }

    obj.call = function(...args) {
        return spawn.send({
            "com": "call",
            "var": obj.data,
            "params": args
        }).then(proxify)
    }

    obj.close = function(){
        spawn.close();
    }

    obj.subscribe = function(name, cb) {
        return spawn.send({
            "com": "subscribe",
            "var": name
        }, (response) => {
            cb(proxify(response))
        })
    }

    obj.subscribeAll = function(all){
        for (let name in all){
            obj.subscribe(name, all[name]);
        }
    }

    return obj
}

const wait_for = async (obj, path, spawn) => {
    const elms =  path?path.split('/'):[]
    let result = obj
    for (let elm of elms){
        result = await spawn.send({ 
            "com": "attr", 
            "var": result.data,
            "attr": elm 
        })
    }
    return decorate(result, spawn)
}

const newProxy = (obj, spawn, path) => {
    return new Proxy(obj, {
        get(target, name) {
            if (name == '__value__'){
                return wait_for(obj, path, spawn).then(obj => obj.value)
            }
            if (name == '__obj__'){
                return wait_for(obj, path, spawn).then(obj => JSON.parse(obj.value))
            }
            if (name == '__call__'){
                return async function(...args) {
                    args = args.map(arg => {
                        if (arg instanceof Function){
                            return spawn.callback(arg)
                        }
                        return arg
                    })
                    return await (await wait_for(obj, path, spawn)).call(...args)
                }
            }
            if (name == '__subscribe__'){
                return async function(name, cb) {
                    const result = (await wait_for(obj, path, spawn))
                    if (name instanceof Object){
                        result.subscribeAll(name)
                    } 
                    return result.subscribe(name, cb)
                }
            }
            if (name == 'close'){
                return () => {
                    spawn.close();
                }
                
            }
            const path_name = path?`${path}/${name.toString()}`: name
            return newProxy(target, spawn, path_name)
        }
    })
}

const proxy = (obj, spawn) => newProxy((obj), spawn)

module.exports = proxy