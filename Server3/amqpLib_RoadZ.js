const amqp = require('amqplib/callback_api')


var sendDataToQueue = (queue, message) => {
    amqp.connect('amqp://roadz:HA77!ngs%23@localhost:5672/%2f', function(error0, connection) {      //localhost auf dem server
        if (error0) {
            throw error0;
        }

        connection.createChannel(function(error1, channel) {
            if (error1) {
            throw error1;
            }
            
            channel.sendToQueue(queue, Buffer.from(message));
            console.log(" [x] Sent %s", message);
        });
    });
};



var receiveDataFromQueue = (queue, callback) => {
    amqp.connect('amqp://roadz:HA77!ngs%23@localhost:5672/%2f', function(error0, connection) { //localhost auf dem server
        if (error0) {
            throw error0;
        }
        
        connection.createChannel(function(error1, channel) {
            if (error1) {
                throw error1;
            }
        
        channel.consume(queue, (message) => {
            //console.log(message.content.toString));
            callback(message.content);          //callback muss die message auffangen, muss im server gemacht werden.. 
                                        //bei der MQ wird immer das älteste (erste) element aus der queue
                                        //also muss man das programm so gestalten, dass alle nachrichten verwertet werden
                                        //oder wenigstens nicht verloren gehen
            console.log('ack now');                            
            channel.ack(message);
            console.log('ack done');
            },{noAck:false});
        });
    });
};



module.exports = {
    sendDataToQueue,
    receiveDataFromQueue
}






// var sendData = (message) => {            //kann man auch als eigene methode machen, ist aber nicht notwendig
//     channelConst.sendToQueue(queue, Buffer.from(message))
//     return 'sent';
// }

