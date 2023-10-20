var con = require('../config/database');
var GLOBALS = require('../config/constants');
var cryptoLib = require('cryptlib');
var shaKey = cryptoLib.getHashSha256(GLOBALS.KEY, 32);
const {default: localizify} = require('localizify');
const en = require('../languages/en.js');
const {
    t
} = require('localizify');

var bypassMethod = new Array("adminlogin","verifyuser","changepassword","vendorlogin","getstorevendor","regisrervendor","getsublist","resetpassmail","resetpassword");

var bypassHeaderKey = new Array();

var headerValidator = {

    /**
     * Function to extract the header language and set language environment
     * @param {Request Object} req
     * @param {Response Object} res
     * @param {Function} callback
     */
    extractHeaderLanguage: function (req, res, callback) {

        var language = (req.headers['accept-language'] != undefined && req.headers['accept-language'] != '') ? req.headers['accept-language'] : "en";
        req.language = en;
        req.lang = language;
        localizify.add(language, en).setLocale('en');
        callback();
    },

    /**
     * Function to validate API key of header (Note : Header keys are encrypted)
     * @param {Request Object} req
     * @param {Response Object} res
     * @param {Function} callback
     */
    validateHeaderApiKey: function (req, res, callback) {

        var api_key = (req.headers['api-key'] != undefined && req.headers['api-key'] != '') ? req.headers['api-key'] : "";

        var path_data = req.path.split("/");

        if (bypassHeaderKey.indexOf(path_data[2]) === -1) {
            if (api_key == process.env.API_KEY) {
                callback();
            } else {
                headerValidator.sendresponse(req, res, 401, '-1', {keyword: 'rest_keywords_invalid_api_key',components: {}}, null);
            }
        } else {
            callback();
        }
    },

    validateHeaderToken: function (req, res, callback) {
        var path_data = req.path.split("/");
        if(path_data[3] == 'admin'){
        if (bypassMethod.indexOf(path_data[4]) === -1) {
            if (req.headers['token'] && req.headers['token'] != '') {
                var headtoken = req.headers['token'].replace(/\s/g, '');
                if (headtoken !== '') {
                    con.query("SELECT * FROM tbl_admin_device WHERE token = ? ",[headtoken], function (err, result) {
                        if (!err && result[0] != undefined) {
                            req.user_id = result[0].user_id;
                            callback();
                        } else {
                            headerValidator.sendresponse(req, res, 401, '-1', {keyword: 'rest_keywords_tokeninvalid',components: {}}, null);
                        }
                    });
                } else {
                    headerValidator.sendresponse(req, res, 401, '-1', {keyword: 'rest_keywords_tokeninvalid',components: {}}, null);
                }
            } else {
                headerValidator.sendresponse(req, res, 401, '-1', {keyword: 'rest_keywords_tokeninvalid',components: {}}, null);
            }
        } else {
            if (req.headers['token'] && req.headers['token'] != '') {
                var headtoken = req.headers['token'].replace(/\s/g, '');
                if (headtoken !== '') {
                    con.query("SELECT * FROM tbl_admin_device WHERE token = ? ",[headtoken], function (err, result) {
                        if (!err && result[0] != undefined) {
                            req.user_id = result[0].user_id;
                            callback();
                        } else {
                            callback();
                        }
                    });
                } else {
                    callback();
                }
            } else {
                // var app = cryptoLib.decrypt(req.headers['app'], shaKey, GLOBALS.IV);
                // req.user_type = app;
                callback();
            }
        }
    } else{
        if (bypassMethod.indexOf(path_data[4]) === -1) {
            if (req.headers['token'] && req.headers['token'] != '') {
                var headtoken = req.headers['token'].replace(/\s/g, '');
                if (headtoken !== '') {
                    con.query("SELECT * FROM tbl_vendor WHERE token = ? ",[headtoken], function (err, result) {
                        if (!err && result[0] != undefined) {
                            req.user_id = result[0].user_id;
                            callback();
                        } else {
                            headerValidator.sendresponse(req, res, 401, '-1', {keyword: 'rest_keywords_tokeninvalid',components: {}}, null);
                        }
                    });
                } else {
                    headerValidator.sendresponse(req, res, 401, '-1', {keyword: 'rest_keywords_tokeninvalid',components: {}}, null);
                }
            } else {
                headerValidator.sendresponse(req, res, 401, '-1', {keyword: 'rest_keywords_tokeninvalid',components: {}}, null);
            }
        } else {
            if (req.headers['token'] && req.headers['token'] != '') {
                var headtoken = req.headers['token'].replace(/\s/g, '');
                if (headtoken !== '') {
                    con.query("SELECT * FROM tbl_vendor WHERE token = ? ",[headtoken], function (err, result) {
                        if (!err && result[0] != undefined) {
                            req.user_id = result[0].user_id;
                            callback();
                        } else {
                            callback();
                        }
                    });
                } else {
                    callback();
                }
            } else {
                callback();
            }
        }
    }
    },

    checkValidationRules: function (request, response, rules, messages, keywords) {

        var v = require('Validator').make(request, rules, messages, keywords);
        console.log("🚀 ~ v:", v)
        if (v.fails()) {
            var Validator_errors = v.getErrors();
            for (var key in Validator_errors) {
                error = Validator_errors[key][0];
                break;
            }
            response_data = {
                code: '0',
                message: error
            };
            headerValidator.encryption(response_data, function (responseData) {
                response.status(200);
                response.json(responseData);
            });
            return false;
        } else {
            return true;
        }
    },
    


    sendresponse: function (req, res, statuscode, responsecode, responsemessage, responsedata) {
        headerValidator.getMessage(req.lang, responsemessage.keyword, responsemessage.components, function(formedmsg) {
            if (responsedata != null) {
                response_data = {code: responsecode, message: formedmsg, data: responsedata};
                headerValidator.encryption(response_data, function (response) {
                    res.status(200);
                    res.json(response);
                });
            } else {
                response_data = {code: responsecode, message: formedmsg};
                headerValidator.encryption(response_data, function (response) {
                    res.status(200);
                    res.json(response);
                });
            }
        });
    },
    

    decryption: function (request1, callback) {
        var req = request1.body;
        if (req != undefined && Object.keys(req).length !== 0) {
            // var request = JSON.parse(cryptoLib.decrypt(req, shaKey, GLOBALS.IV));
            var request = JSON.parse(req);
            request.lang = request1.lang;
            // request.user_type = request1.user_type;
            callback(request);
        } else {
            callback({});
        }
    },
    

    encryption: function (req, callback) {
        var cryptoLib = require('cryptlib');
        var shaKey = cryptoLib.getHashSha256(GLOBALS.KEY, 32);
        // var response = cryptoLib.encrypt(JSON.stringify(response_data), shaKey, GLOBALS.IV);
        var response = response_data;
        callback(response);
    },
    

    /*
    ** Function to send users language from any place
    ** 03-09-2019
    */
    getMessage: function(requestLanguage,keywords,components,callback){
        localizify
            .add('en', en)
            .setLocale(requestLanguage);
        var returnmessage = t(keywords,components);
        callback(returnmessage);
    },
}
module.exports = headerValidator;
