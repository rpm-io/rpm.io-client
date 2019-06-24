
const assert = require('assert');
const rpm = require('./rpm');

class A {
    constructor(){
        this.attr1 = 1
    }
}

//import remote object from client 1
rpm.require_remote('http://localhost:8000')
.then(async remote => {
    await remote.setAttr1.__call__(5)
    console.log("Result:", await remote.getAttr1.__call__())
    console.log("Result:", await remote.attr3.hhh.rrr.__value__)
    const  rrr  = await remote.attr3.hhh.__obj__
    console.log("Result:", rrr)
    const  attr2  = await remote.attr2.__obj__
    console.log("Result:", attr2)
    
    const elm1  = await remote.attr2[0].__obj__
    console.log("Result:", elm1)
    remote.__subscribe__({
        attr1: (newValue) => {
            console.log(newValue)
        }
    })
    remote.setAttr1.__call__(20)
    //callback
    remote.callbackable.__call__((message, message2) => {
        console.log(message, message2)
    })
    await new Promise(resolve => setTimeout(resolve, 2000))
    //const obj  = await remote.getObject.__call__()
    //console.log("Result:", await obj.__obj__)
    remote.close()
})

/*.then(async (remote) => {

    //call setAttr1 to set a new value
    console.log("Client 1: setting new value 'Hello word!'")
    await (await remote.setAttr1).call("Hello word!");

    //call getAttr1 to get current value
    console.log("Client 1: getting current value")
    let hello = await (await remote.getAttr1).call()
    console.log("Client 1: the current value is '" + hello + "'");

    //verify the value match
    console.log("Client 1: verifying value...")
    assert.equal(hello, "Hello word!")
    console.log("Client 1: value is correct!")

    //close conection
    remote.close()
}).catch(err => {
    console.log(err)
})
/*
//import remote object from client 2
rpm.require_remote('http://localhost:8000')
.then(async (remote) => {
    //wait for changes in client 1 
    console.log("waiting 2s...")
    await new Promise(resolve => setTimeout(resolve, 2000))

    //call getAttr1 to get current value
    console.log("Client 2: getting current value")
    let hello = await (await remote.getAttr1).call()
    console.log("Client 2: the current value is '" + hello + "'");


    //verify the value match
    console.log("Client 2: verifying value...")
    assert.equal(hello, "Hello word!")
    console.log("Client 2: value is correct!")
    
    for (let i = 0; i < 10; i++){
        //call setAttr1 to set a new value
        console.log("Client 1: setting new value 'Hello word!'")
        await (await remote.setAttr1).call("Hello word!" + i);
    }

    //close conection
    remote.close()
}).catch(err => {
    console.log(err)
})

//import remote object from client 3
rpm.require_remote('http://localhost:8000')
.then(async (remote) => {
    
    console.log("Client 3: ON")
    remote.subscribe('attr1', value => {
        console.log("Client 3: new value is ", value);
    });
    remote.subscribeAll({
        attr1: value => {
            console.log("Client 3: for All new value is ", value);
        }
    });
    console.log("waiting 5s...")
    await new Promise(resolve => setTimeout(resolve, 5000))
    let attr2 = await remote.attr2

    console.log(await attr2.length)

    console.log("Client 3: OFF")
    //close conection
    remote.close()
}).catch(err => {
    console.log(err)
})*/