const amqp = require('amqplib/callback_api')


var sendDataToQueue = (queue, message) => {
    amqp.connect('amqp://localhost', function(error0, connection) {
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

module.exports = {
    sendDataToQueue
}






// var sendData = (message) => {            //kann man auch als eigene methode machen, ist aber nicht notwendig
//     channelConst.sendToQueue(queue, Buffer.from(message))
//     return 'sent';
// }

