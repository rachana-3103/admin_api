var con = require('./database');
var GLOBALS = require('./constants');
var cryptoLib = require('cryptlib');
var shaKey = cryptoLib.getHashSha256(GLOBALS.KEY, 32);
const localizify = require('localizify');
const en = require('../languages/en.js');
const {
    t
} = require('localizify');
const asyncLoop = require('node-async-loop');

var Validate = {

    generateSessionCode: function (user_id, callback) {

        var randtoken = require('rand-token').generator();
        var usersession = randtoken.generate(64, "0123456789abcdefghijklnmopqrstuvwxyz");

        Validate.checkDeviceInfo(user_id,  function (DeviceInfo, Error) {
            if (DeviceInfo != null) {
                var params = {
                    token: usersession
                };
           
                Validate.updateDeviceInfo(user_id, params, function () {
                    callback(usersession);
                });
            } else {
                var params = {
                    token: usersession,
                    user_id: user_id,
                };
                
                Validate.addDeviceInformation(params, function () {
                    callback(usersession);
                });
            }
        });
    },

    checkDeviceInfo: function (user_id,  callback) {

        con.query("SELECT * FROM tbl_admin_device WHERE user_id = '" + user_id + "'", function (err, result) {
            if (!err && result[0] != undefined) {
                callback(result[0]);
            } else {
                callback(null, err);
            }
        });
    },

    updateDeviceInfo: function (user_id, params, callback) {
        con.query("UPDATE tbl_admin_device SET ? WHERE user_id = '" + user_id + "'", params, function (err, result, fields) {
            console.log(err)
            callback(result);
        });
    },


    addDeviceInformation: function (params, callback) {

        con.query('INSERT INTO tbl_admin_device SET ?', params, function (err, result, fields) {
          console.log(err);
          console.log(result);
            callback(result.insertId);
        });
    },

   
    checkUpdateDeviceInfo: function (user_id, params, callback) {

        var upd_device = {
            uuid: (params.uuid != undefined) ? params.uuid : "",
            ip: (params.ip != undefined) ? params.ip : "",
            os_version: (params.os_version != undefined) ? params.os_version : "",
            model_name: (params.model_name != undefined) ? params.model_name : "",
            device_type: params.device_type,
            device_token: params.device_token,
        };

        Validate.checkDeviceInfo(user_id,  function (DeviceInfo, Error) {
           
            if (DeviceInfo != null) {
                Validate.updateDeviceInfo(user_id, upd_device, function (result, error) {
                    callback(result);
                });
            } else {
                upd_device.user_id = user_id;
        
                Validate.addDeviceInformation(upd_device, function (result, error) {
                    callback(result);
                });
            }
        });
    },
   
   
    isEmptyObject: function(obj){
        return !Object.keys(obj).length;
    },

    
    send_email: function (subject, to_email, message, callback) {

        var transporter = require('nodemailer').createTransport({
            host: 'smtp.gmail.com',
            port: 587,
            secure: false,
            auth: {
                user: GLOBALS.EMAIL_ID,
                pass: GLOBALS.EMAIL_PASSWORD
            }
        });
        var mailOptions = {
            from: GLOBALS.EMAIL_ID,
            to: to_email,
            subject: subject,
            html: message
        };
        transporter.sendMail(mailOptions, (error, info) => {
            console.log('error :', error);
            if (error) {
                callback(false);
            } else {
                callback(true);
            }
        });
    },

    

    send_push: function (registrationIds, device_type, push_params, callback) {
        const push_data = {
            topic: GLOBALS.BUNDLE,
            custom: {
                title: 'FITEXT',
                body: push_params.message,
                tag: push_params.tag,
                data: push_params
            },
            alert: {
                title: 'FITEXT',
                body: push_params.message,
                tag: push_params.tag
            }
            /*expiry: Math.floor(Date.now() / 1000) + 28 * 86400,
            retries: -1,*/
        };

        if (device_type === 'I') {
            push_data.sound = 'default';
            push_data.topic = GLOBALS.IOS_BUNDLE_ID;
        }


        const settings = {
            gcm: {
                id: GLOBALS.PUSH_KEY,
            },
            apn: {
                token: {
                    key: './pem/AuthKey_8V229962VP.p8', // optionally: fs.readFileSync('./certs/key.p8')
                    keyId: GLOBALS.KEY_ID,
                    teamId: GLOBALS.TEAM_ID,
                },
                production: true
            },
            isAlwaysUseFCM: false
        };
        const PushNotifications = require('node-pushnotifications');
        const push = new PushNotifications(settings);

        // console.log('=============push_data==========',push_data);
        // console.log(push_data.custom.data.params);

        push.send(registrationIds, push_data, (err, result) => {
            // console.log(result);
            if (err) {
                // console.log('error');
                callback(false)
            } else {
                // console.log('succ');
                // console.log(result[0].success);
                callback(true)
            }
        });

    },

    userdetails: function (user_id, callback) {
        // console.log("object", user_id)
        con.query("SELECT u.*,concat('" + GLOBALS.USER_IMAGE + "','',u.profile_image) as profile_image FROM tbl_user u WHERE u.id = '" + user_id + "' AND u.is_deleted='0'",
            function (err, result) {
                if (err) {
                    callback(undefined);
                } else {
                    callback(result[0]);
                }
            }
        );
    },
    admindetails: function (user_id, callback) {
        con.query("SELECT u.*,concat('" + GLOBALS.USER_IMAGE + "','',u.profile_image) as profile_image FROM tbl_admin u WHERE u.id = '" + user_id + "'",
            function (err, result) {
                if (!err && result.length > 0) {
                    callback(result[0]);
                } else {
                    callback(undefined);
                }
            }
        );
    },


}
module.exports = Validate;
