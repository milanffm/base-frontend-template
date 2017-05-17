/**
 * Created by mpeters on 10.02.16.
 */

module.exports = (function() {
    "use strict";

    // First include polyfills
    require('./polyfills');

    // from here include everything else
    var factory = require('./factories/Demo.factory');
    var stuff = [1,2,3,4,5];


    factory.doSomeFactoryStuff(stuff);

    // from here include everything else
    var controller = require('./controller');

    for (var key in controller) {
        try {
            controller[key].init()
        }
        catch(err) {
            console.error(err,'controller ' + key +' cannot execute');
        }

    }

    
    console.log('new base project');
    
    
}());



