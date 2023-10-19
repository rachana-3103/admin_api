var node_push = require("node-pushnotifications");
var GLOBALS = require('./constants');


var notification = {
    /**
     * notification configuration
     */
    setting: {
        gcm: {
            id: '',
        },
        apn: {
            token: {
                key: './pem/AuthKey_57W6KD26X4.p8',
                keyId: GLOBALS.KEY_ID,
                teamId: GLOBALS.TEAM_ID,
            },
            production: false,
            isAlwaysUseFCM: false,
        }

    },

    /**
     * This function is used to send notification 
     */
    sendPush: function (device_id, device_type, message, callback) {
console.log(device_id, device_type)
        //if (device_type === 'A') {
            console.log('------------------GCM-----------------ANDROID-----------')
            var newpay = {
                topic: 'com.livecarts.app',//process.env.USER_BUNDLE_ID,
                alert: {
                    sender_id: message.sender_id,
                    receiver_id: message.receiver_id,
                    tag: message.tag,
                    title: 'Live Cart',
                    body: message.message,
                },
                sound: "default",
                image:'http://35.183.149.96/logo192.png',
                // priority: 'high',
                //contentAvailable: true,
                custom: {
                    sender_id: 0,
                    receiver_id: 0,
                    tag: message.tag,
                    title: 'Live Cart',
                    body: message.message,
                }
            }
            if (message.device_type == "A") {
                delete newpay.sound;
            }
        //} else {
            /*console.log('------------------APN-----------------IOS-----------')
            var newpay = {
                "action": "com.livecart",
                "badge": 0,
                "tag": message.tag,
                "data": {
                    "actionIdentifier": "com.apple.UNNotificationDefaultActionIdentifier",
                    "aps": {
                        "alert": {
                            "sender_id": 0,
                            "receiver_id": 0,
                            "tag": message.tag,
                            "title": 'Live Cart',
                            "body": message.message,
                        }
                    },
                    "gcm.message_id": "1691567278461053",
                    "google.c.a.e": "1",
                    "google.c.fid": "eIX6s4Jrf0fTqPWwIhAMHL",
                    "google.c.sender.id": "426458330677",
                    "userInteraction": 1,
                    "tag": message.tag
                },
                "finish": [
                ],
                "foreground": false,
                "id": undefined,
                "body": message.message,
                "reply_text": undefined,
                "sound": 'default',
                "tag": message.tag,
                "topic": 'com.livecart',
                "title": "Live Cart",
                "image":'http://35.183.149.96/logo192.png',
                "userInteraction": true
            }
        }*/
        var push = new node_push(this.setting);
        //console.log(push)
        console.log('++++++++++',newpay,'++++++++++');
        push.send(device_id, newpay, (error, result) => {
            console.log('=============',error, result, result[0].message)
            if (error) {
                callback(false);
            } else {
                //console.log('-------------',result)
                callback(true);
            }
        });
    },


    /*sendPush: function (registrationIds, device_type, push_params,callback) {


        const push_data = {
            topic: 'com.livecart.customer',
            custom: {
                title: 'Live Cart',
                body: push_params.message,
                tag: push_params.tag,
                data: push_params
            },
            alert : {
                title: 'Live Cart',
                body: push_params.message,
                tag: push_params.tag,
                sender_id: push_params.sender_id,
                receiver_id: push_params.receiver_id
            }
            
        };

        if (device_type === 'I') {
            push_data.sound = 'default';
        }


        const settings = {
            gcm: {
                id: 'AAAARUemcRg:APA91bH7vhKPz54sVnTUMQd088XElRil785kSQp4vzJICVvWcr3a2OcVgrh10aLtcHoEP2BLWqdP4LiRyPRvsuJH_o7A1q6X35Sa3DIHojUvoEGnUtVRP4Li7aFA8WX5iOv1cwZV7gQN',
            },
            apn: {
                token: {
	                key: './pem/AuthKey_34J4DYU6FP.p8',
	                keyId: '34J4DYU6FP',
	                teamId: 'GP47PC2NP7',
                },
                production: false
            },
            isAlwaysUseFCM: false
        };
        const PushNotifications = require('node-pushnotifications');
        const push = new PushNotifications(settings);

        //console.log(push_data.push_params.params);

        push.send(registrationIds, push_data, (err, result) => {
        	console.log(err);
             console.log(result);
            if (err) {
                console.log('error');
                 callback(false);
                //console.log(err);
            } else {
                console.log('succ');
                 callback(true);
                
            }
        });

    },*/




};

module.exports = notification;
