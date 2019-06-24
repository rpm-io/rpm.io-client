var socket = require('socket.io-client');

class Client {

    constructor(uri){
        this.messages = [];
        this.listeners = {};
        this.ok = true;
        this.io = socket(uri);
        this.time = 0;
    }

    start(){
        let response = this.wait('__self__').then((response)=> {
            let interval = setInterval(() => {
                if (!this.ok){
                    clearInterval(interval);
                } else {
                    if (this.messages.length) {
                        let message = this.messages.pop(0);
                        this.io.emit("message", message);
                    }
                }
            }, 1);
            return response;
        })
        
        this.io.on('message', (response) => {
            this.listeners[response.__id__](response);
        });
        
        this.io.on('error', (data) => {
            console.error("Err:", data.toString());
        });

        this.io.on('disconnect', (self) => {
            this.ok = false;
        });

        return response;
    }

    wait (__id__, cb){
        const wait = (done, code) => (response) =>{
            done(response)
        }

        if (cb){
            this.listeners[__id__] = wait(cb, "code");
            this.listeners[__id__].method = "cb";
        } else {
            return new Promise((done) => {
                this.listeners[__id__] = wait(done);
                this.listeners[__id__].method = "pm";
            })
        }
    }

    callback(cb) {
        const data = {
            __callback__: true,
            __id__: this.newId()
        }
        this.wait(data.__id__, (response) => {
            cb(...JSON.parse(response.value))
        })
        return data
    }

    newId(){
        return new Date().getTime() + '%' + (++this.time);
    }

    send(message, cb){
        message.__id__ = this.newId()
        this.messages.push(message);
        return this.wait(message.__id__, cb);
    }

    close(){
        return this.send({
            "com": "destroy"
        }).then((end) => {
            //console.log(end)
        });
    }

}

module.exports = Client ;