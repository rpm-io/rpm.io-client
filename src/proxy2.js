
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

    obj.init = function(...args) {
        return spawn.send({
            "com": "new",
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

const newProxy = (obj, spawn, path, clazz = false) => {
    const mapCB = (...args) => args.map(arg => {
        if (arg instanceof Function){
            return spawn.callback(arg)
        }
        return arg
    })

    const fObj = async (...args) => {
        args = mapCB(...args)
        return await (await wait_for(obj, path, spawn)).call(...args)
    }

    class FObject extends Function{
        constructor(...args) {
            args = mapCB(...args)
            return wait_for(obj, path, spawn).then(resp => resp.init(...args))
        }
    }
    const fObject = clazz?FObject:fObj
    Object.assign(fObject, obj)
    return new Proxy(fObject, {
        get(target, name) {
            if (name == '__value__'){
                return wait_for(obj, path, spawn).then(obj => obj.value)
            }
            if (name == '__obj__'){
                return wait_for(obj, path, spawn).then(obj => JSON.parse(obj.value))
            }
            if (name == '__call__'){
                console.warn('WARN 1: this method is deprecate use simple call instead')
                return fObject
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
            if (name == 'then'){
                return obj['then']
            }console.log(name)
            return newProxy(obj, spawn, path?`${path}/${name.toString()}`: name, name && name[0] && name[0] === name[0].toUpperCase())
        }
    })
}

const proxy = (obj, spawn) => newProxy((obj), spawn)

module.exports = proxy