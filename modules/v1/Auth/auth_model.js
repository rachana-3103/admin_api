var con = require('../../../config/database');
var GLOBALS = require('../../../config/constants');
var common = require('../../../config/common');
const notify = require('../../../config/notification')
var cryptoLib = require('cryptlib');
var asyncLoop = require('node-async-loop');
var moment = require('moment');
var shaKey = cryptoLib.getHashSha256(GLOBALS.KEY, 32);
var emailTemplate = require('../../../config/template');


var Auth = {

    userdetails: function (user_id, callback) {
        con.query("SELECT u.*,concat('" + GLOBALS.S3_BUCKET_ROOT + GLOBALS.USER_IMAGE + "','',u.profile_image) as profile_image FROM tbl_user u  WHERE u.id = '" + user_id + "' AND u.is_deleted='0' GROUP BY u.id", function (err, result, fields) {
            if (!err && result.length > 0) {
                callback(result[0]);
            } else {
                console.log(err);
                callback(null);
            }
        });
    },

    admindetails: function (user_id, callback) {
        con.query("SELECT u.*,concat('" + GLOBALS.USER_IMAGE + "','',u.profile_image) as profile_image,IFNULL(ut.device_token,'') as device_token,IFNULL(ut.device_type,'') as device_type,IFNULL(ut.token,'') as token FROM tbl_admin u LEFT JOIN tbl_admin_device as ut ON u.id = ut.user_id WHERE u.id = '" + user_id + "' GROUP BY u.id", function (err, result, fields) {
            if (!err && result.length > 0) {
                callback(result[0]);
            } else {
                console.log(err);
                callback(null);
            }
        });
    },

    update_customer: function (user_id, upd_params, callback) {
        con.query("UPDATE tbl_admin SET ? WHERE id = ? ", [upd_params, user_id], function (err, result, fields) {
            if (!err) {
                Auth.admindetails(user_id, function (response, err) {
                    callback(response);
                });
            } else {
                callback(null, err);
            }
        });
    },

    adminLogin: function (request, callback) {
        con.query("SELECT * FROM tbl_admin WHERE email='" + request.email + "'", function (err, result, fields) {
            if (!err && result[0] != undefined) {
                Auth.admindetails(result[0].id, function (userprofile) {
                    if (userprofile.password !== request.password) {
                        callback('0', {
                            keyword: 'rest_keywords_invalid_password',
                            components: {}
                        }, null);
                    } else {
                        var updparams = {
                            is_active: 1
                        }
                        common.checkUpdateDeviceInfo(result[0].id, request, function () {
                            Auth.update_customer(result[0].id, updparams, function (userprofile, error) {
                                common.generateSessionCode(result[0].id, function (Token) {
                                    userprofile.token = Token;
                                    delete userprofile.password
                                    callback('1', {
                                        keyword: 'rest_keywords_user_login_success',
                                        components: {}
                                    }, userprofile);
                                });
                            });
                        });
                    }
                });
            } else {
                callback('0', {
                    keyword: 'Please Enter Valid Email Address',
                    components: {}
                }, null)
            }
        })
    },

    adminLogout: function (request, callback) {
        con.query("SELECT * FROM tbl_admin WHERE id='" + request.user_id + "' AND is_deleted = 0", function (err, result, fields) {
            if (!err) {
                var logout = {
                    token: "",
                    device_type: "",
                    device_token: "",
                }
                common.updateDeviceInfo(result[0].id, logout, function (result) {
                    callback('1', {
                        keyword: 'rest_keyword_logout_successfull',
                        components: {}
                    }, result)
                })
            } else {
                callback('0', {
                    keyword: 'rest_key_failed',
                    components: {}
                }, null)
            }
        })
    },

    faqsList: function (request, callback) {
        var condition = "";
        if (request.id != 0) {
            var condition = " AND id='" + request.id + "'";
        } else {
            var condition = "";
        }
        con.query("SELECT * FROM tbl_faqs WHERE is_active =1 AND is_deleted=0 " + condition + "", function (err, result, fields) {
            // console.log(result)
            if (!err && result.length > 0) {
                callback('1', {
                    keyword: 'Success',
                    components: {}
                }, result)
            } else {
                callback('0', {
                    keyword: 'NO Data Found',
                    components: {}
                }, [])
            }
        })
    },

    addFaqs: function (request, callback) {
        var faq = {
            question: request.question,
            answer: request.answer,
        }
        con.query("INSERT INTO tbl_faqs SET ?", faq, function (err, result, fields) {
            if (!err && result.affectedRows > 0) {
                callback('1', {
                    keyword: 'Add FAQs Successfully',
                    components: {}
                }, result)
            } else {
                callback('0', {
                    keyword: 'Failed To Add !',
                    components: {}
                }, null)
            }
        })
    },

    editFaqs: function (request, callback) {
        var faqs = {};
        if (request.question != undefined && request.question != '') {
            faqs.question = request.question
        }
        if (request.answer != undefined && request.answer != '') {
            faqs.answer = request.answer
        }
        con.query("UPDATE tbl_faqs SET ? WHERE id ='" + request.id + "' AND is_deleted = 0", faqs, function (err, result, fields) {
            if (!err && result.affectedRows > 0) {
                callback('1', {
                    keyword: 'Update FAQs Successfully',
                    components: {}
                }, result)
            } else {
                callback('0', {
                    keyword: 'Failed!',
                    components: {}
                }, null)
            }
        })
    },

    deleteFaqs: function (request, callback) {
        con.query("UPDATE tbl_faqs SET is_deleted = 1 WHERE id= '" + request.id + "'", function (err, result, fields) {
            if (!err && result.affectedRows > 0) {
                callback('1', {
                    keyword: 'FAQs Delete Successfully',
                    components: {}
                }, result)
            } else {
                callback('0', {
                    keyword: 'Failed to Delete, Retry Again',
                    components: {}
                }, null)
            }
        })
    },

    getAboutUs: function (request, callback) {
        con.query("SELECT * FROM tbl_content_page WHERE page_name = 'about' AND is_deleted = 0", function (err, result, fields) {
            // console.log(result)
            if (!err && result.length > 0) {
                callback('1', {
                    keyword: 'Success',
                    components: {}
                }, result)
            } else {
                callback('0', {
                    keyword: 'Failed!',
                    components: {}
                }, null)
            }
        })
    },

    updateAboutUs: function (request, callback) {
        con.query("UPDATE tbl_content_page SET content = '" + request.content + "' WHERE page_name = 'about' and is_deleted=0", function (err, result, fields) {
            if (!err && result.affectedRows > 0) {
                callback('1', {
                    keyword: 'AboutUs Update Success',
                    components: {}
                }, null)
            } else {
                callback('0', {
                    keyword: 'Failed To Update!',
                    components: {}
                }, null)
            }
        })
    },

    getPolicy: function (request, callback) {
        con.query("SELECT * FROM tbl_content_page WHERE page_name='privacy' AND is_deleted=0", function (err, result, fields) {
            if (!err && result.length > 0) {
                callback('1', {
                    keyword: 'Success',
                    components: {}
                }, result)
            } else {
                callback('0', {
                    keyword: 'Failed',
                    components: {}
                }, null)
            }
        })
    },

    updatePolicy: function (request, callback) {
        con.query("UPDATE tbl_content_page SET content= '" + request.content + "' WHERE page_name = 'privacy' AND is_deleted = 0", function (err, result, fields) {
            if (!err && result.affectedRows > 0) {
                callback('1', {
                    keyword: 'Privacy Policy Update Success',
                    components: {}
                }, null)
            } else {
                callback('0', {
                    keyword: 'Failed!',
                    components: {}
                }, null)
            }
        })
    },

    getTerms: function (request, callback) {
        con.query("SELECT * FROM tbl_content_page WHERE page_name='terms' AND is_deleted=0", function (err, result, fields) {
            if (!err && result.length > 0) {
                callback('1', {
                    keyword: 'Success',
                    components: {}
                }, result)
            } else {
                callback('0', {
                    keyword: 'Failed',
                    components: {}
                }, null)
            }
        })
    },

    updateTerms: function (request, callback) {
        con.query("UPDATE tbl_content_page SET content= '" + request.content + "' WHERE page_name = 'terms' AND is_deleted = 0", function (err, result, fields) {
            if (!err && result.affectedRows > 0) {
                callback('1', {
                    keyword: 'Terms And Condition Update Success',
                    components: {}
                }, null)
            } else {
                callback('0', {
                    keyword: 'Failed!',
                    components: {}
                }, null)
            }
        })
    },

    contactList: function (request, callback) { 
        var query = `SELECT c.* FROM tbl_contact_us c `

        if(request.id != 0){
            query += ` WHERE c.id = '${request.id}'`
        }
        con.query(query, function (err,result) { 
            if (!err && result.length > 0) {
                callback('1',{ keyword:'Success', components:{} },result)
            } else {
                callback('0',{ keyword:'Failed!', components:{} },null)
            }
        })
    },

    sendReplayMail: function (request, callback) { 
        common.send_email(request.subject, request.sendermail, request.messages, function (issend) {
            if (issend == true) {
                con.query(`UPDATE tbl_contact_us SET is_reply = 'D' WHERE id='${request.id}'`, function (err, result) {
                    callback('1', {
                        keyword: 'Send Mail Success',
                        components: {}
                    }, issend)
                })
            } else {
                callback('0', {
                    keyword: 'Mail Send Failed!',
                    components: {}
                }, null)
            }
        })
    },


    pushNoti: function (request, callback) { 
        con.query(`SELECT id, device_id, device_type FROM tbl_user WHERE user_type='User' AND is_active='active' AND is_deleted='0'`, function (err,result) { 
            if (!err && result[0] != undefined) {
                asyncLoop(result, function (item, next){
                    // console.log(item.id)
                    var push_params = {
                        message: request.message,
                        tag: request.title,
                        params: {
                            sender_id: 0,
                            notification_message: request.message,
                            notification_tag: request.title,
                        }
                    };
                    common.send_push(item.device_id, item.device_type, push_params, function (status) { 
                    if (status) {
                        next();
                    } else {  
                        next();
                    }
                    })
                }, function (){
                    callback('1', { keyword: 'Notification Send Success', components: {} }, null)
                });
            } else {
                callback('0',{ keyword:'Failed To Send Notification', components:{} },null)
            }
        })
    },


    dashBoard: function (request, callback) {        
        con.query(`SELECT count(id) as vendor, (select count(id) from tbl_order WHERE is_active=1 and date(inserted_at) = date(curdate())) as today_order,(select sum(total_payout) from tbl_order WHERE is_active=1 and date(inserted_at) = date(curdate())) as today_value ,(select count(id) from tbl_order where is_active=1) as total_order, (select sum(total_payout) from tbl_order where is_payment=1) as earning FROM tbl_user WHERE is_active=1 AND is_verify=1 AND is_deleted=0`, function (err, result) { 
            if (!err) {
                callback('1', { keyword: 'Success', components: {} }, result)
            } else {
                callback('0',{ keyword:'Failed', components:{} },null)
            }
        })
    },

    manageCustomer: function (request, callback) { 
        let query = `SELECT u.*, CONCAT('${GLOBALS.USER_IMAGE}', u.profile_image) as profile_image FROM tbl_user as u WHERE u.is_verify = 1 AND u.is_deleted = 0 `

        if(request.id != undefined && request.id != 0){
            query += ` AND u.id = '${request.id}'`
        } else {
            query += ` ORDER BY u.fname ASC`
        }
        con.query(query, function (err,result) { 
            if (!err) {
                if (result[0] != undefined) {
                    callback('1',{ keyword:'Success', components:{} },result)
                } else {
                    callback('2',{ keyword:'No Vendor Found', components:{} },[])
                }
            } else {
                callback('0',{ keyword:'Failed', components:{} },null)
            }
        })
    },

    customerStatus: function (request, callback) { 
        con.query(`SELECT * FROM tbl_user WHERE id='${request.id}'`, function (err,result) { 
            if (result[0].is_active == '1') {
                con.query(`UPDATE tbl_user SET is_active = '0' WHERE id='${result[0].id}'`, function (err2) { 
                    con.query(`UPDATE tbl_user_deviceinfo SET token='' WHERE user_id = '${result[0].id}'`, function (err3) { 
                        callback('1',{ keyword:'Vendor InActive Successfully', components:{} },null)
                    })
                })
            } else {
                con.query(`UPDATE tbl_user SET is_active = '1' WHERE id='${result[0].id}'`, function (err1) { 
                    callback('1',{ keyword:'Vendor Active Successfully', components:{} },null)
                })
            }
        })
    },

    customerDelete: function (request, callback) { 
        con.query(`UPDATE tbl_user SET is_deleted=1 WHERE id='${request.id}'`, function (err,result) { 
            if (!err && result.affectedRows > 0) {
                con.query(`UPDATE tbl_user_deviceinfo SET token='' WHERE user_id = '${request.id}'`, function (err1, res2) { 
                    callback('1',{ keyword:'Vendor Delete Successfully', components:{} },null)
                })
            } else {
                callback('0',{ keyword:'Something Went Wrong!', components:{} },null)
            }
        })
    },

    customerUpdate: function (request, callback) { 
        const upda = {
            fname : request.fname,
            lname : request.lname,
            address : request.address,
            email: request.email,
            phone: request.phone,
            business_name: request.business_name
        }
        if(request.profile_image != undefined && request.profile_image != ''){
            upda.profile_image = request.profile_image
        }
        con.query(`UPDATE tbl_user SET ? WHERE id='${request.id}'`, upda, function (err,result) { 
            if (!err && result.affectedRows > 0) {
                callback('1',{ keyword:'Vendor Details Uppdate Success', components:{} },result)
            } else {
                callback('0',{ keyword:'Failed', components:{} },null)
            }
        })
    },




    vendorRequestList: function (request, callback) { 
        let query = `select v.*, CONCAT('${GLOBALS.USER_IMAGE}', v.profile_image) as profile_image from tbl_user as v WHERE v.is_deleted=0 AND v.is_verify=0 and v.is_active=1`
        con.query(query, function (err,result) { 
            if (!err) {
                if (result[0] != undefined) {
                    callback('1',{ keyword:'Success', components:{} },result)
                } else {
                    callback('2',{ keyword:'No Vendor Request Found', components:{} },[])
                }
            } else {
                callback('0',{ keyword:'Failed', components:{} },null)
            }
        })
    },

    vendorDetails: function (request, callback) { 
        con.query(`SELECT tbl_store.*, (select category_name FROM tbl_store_category WHERE id=tbl_store.store_category_id) as store_category, (select count(id) from tbl_store_rating WHERE store_id = tbl_store.id) as total_review, (select avg(rating) from tbl_store_rating WHERE store_id = tbl_store.id) as avg_review FROM tbl_store WHERE vendor_id='${request.id}'`, function (err,result) { 
            if (!err) {
                if (result[0] != undefined) {
                con.query(`select CONCAT('${GLOBALS.STORE_IMAGE}', image) as image FROM tbl_store_image WHERE store_id='${result[0].id}'`, function (err1,result1) { 
                    result[0].image = result1
                    callback('1',{ keyword:'Success', components:{} },result)
                })
            } else {
                callback('2',{ keyword:'No Data Found', components:{} },[])
            }
            } else {
                callback('0',{ keyword:'Failed!', components:{} },null)
            }
        })
    },

    createVendor: function (request, callback) { 
        con.query(`select * from tbl_vendor WHERE email ='${request.email}' and is_deleted = 0`, function (err,result) { 
            if (!err && result.length == 0) {
                const randtoken = require('rand-token').generator();
                const usersession = randtoken.generate(12, "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklnmopqrstuvwxyz@#$%&");
                const vendcrea = {
                    name: request.name,
                    email: request.email,
                    phone: request.phone == '' ? '' : request.phone,
                    password: usersession,
                    is_admin_approve:1
                }
                con.query(`INSERT INTO tbl_vendor SET ?`, vendcrea, function (err1,result1) { 
                    if (!err1 && result1.insertId > 0) {
                        Auth.vendDetails(result1.insertId, function (userDate) { 
                            userDate.url = "http://3.25.153.70/vendor/signIn"
                                emailTemplate.verifyEmail(userDate, function (verifytemplate) {
                                    common.send_email("Ballians Vendor Credential", userDate.email, verifytemplate, function (isSend) {
                                        Auth.createStore(request, result1.insertId, function (storeDate) { 
                                            Auth.storeImage(request, storeDate.insertId, function (storeImage) {
                                                 callback('1', {keyword: 'Vendor Create Success',components: {}}, userDate);
                                            });
                                        })
                                    });
                                });
                        })
                    } else {
                        callback('0',{ keyword:'Failed To Create Vendor', components:{} },null)
                    }
                })
            } else {
                callback('0',{ keyword:'Vendor Already Register With this Email', components:{} },null)
            }
        })
    },


    vendDetails: function (user_id, callback) {
        con.query(`SELECT u.*,concat('${GLOBALS.USER_IMAGE}',u.profile_image) as profile_image FROM tbl_user u WHERE u.id = '${user_id}' GROUP BY u.id`, function (err, result, fields) {
            if (!err && result.length > 0) {
                callback(result[0]);
            } else {
                console.log(err);
                callback(null);
            }
        });
    },


    vendorReqAccept: function (request, callback) {
        con.query(`update tbl_user SET is_verify=1 WHERE id='${request.id}'`, function (err, result) {
            if (!err && result.affectedRows > 0) {
                Auth.vendDetails(request.id, function (userDate) {
                    userDate.url = "/"
                    emailTemplate.verifyEmail(userDate, function (verifytemplate) {
                        common.send_email("Ballina's Vendor Panel Credential", userDate.email, verifytemplate, function (isSend) {
                            callback('1', { keyword: 'Vendor Request Accept Success', components: {} }, res1)
                        });
                    });
                });
            } else {
                callback('0', { keyword: 'rest_key_failed', components: {} }, null)
            }
        })
    },

    vendorReqReject: function (request, callback) { 
        Auth.vendDetails(request.id, function (userDate) {
            emailTemplate.rejectVendorEmail(userDate, function (verifytemplate) {
                common.send_email("Ballina's  Vendor Request Rejected", userDate.email, verifytemplate, function (isSend) {
                    con.query(`delete from tbl_user where id='${request.id}'`, function (err,result) { 
                        if (!err && result.affectedRows > 0) {
                            con.query(`delete from tbl_user_deviceinfo where user_id='${request.id}'`, function (err1,res1) { 
                                if (!err1 && res1.affectedRows > 0) {
                                    callback('1', { keyword: 'Vendor Request Reject Success', components: {} }, res1)
                                } else {
                                    callback('0',{ keyword:'rest_key_failed', components:{} },null)
                                }
                            })
                        } else {
                            callback('0',{ keyword:'rest_key_failed', components:{} },null)
                        }
                    })
                });
            });
        });
    },

    getCategoryList: function (request, callback) { 
        let query = `SELECT tbl_category.*, CONCAT('${GLOBALS.CATEGORY}', image) as image FROM tbl_category WHERE is_deleted = 0 and is_active=1`

        if(request.id != undefined && request.id != 0){
            query += ` AND id = '${request.id}'`
        } else {
            query += ` ORDER BY name ASC`
        }
        con.query(query, function (err,result) { 
            if (!err) {
                if (result[0] != undefined) {
                    callback('1',{ keyword:'Success', components:{} },result)
                } else {
                    callback('2',{ keyword:'No Category Found', components:{} },[])
                }
            } else {
                callback('0',{ keyword:'Failed', components:{} },null)
            }
        })
    },

    createCategory: function (request, callback) { 
        con.query(`INSERT INTO tbl_category SET name='${request.name}', image='${request.image}'`, function (err,result) { 
            if (!err && result.insertId > 0) {
                callback('1',{ keyword:'Category Create Success', components:{} },result)
            } else {
                callback('0',{ keyword:'rest_key_failed', components:{} },null)
            }
        })
    },

    editCategory: function (request, callback) { 
        const updatecat= {
            name: request.name
        }
        if(request.image != undefined && request.image != ''){
            updatecat.image = request.image
        }

        con.query(`UPDATE tbl_category SET ? WHERE id ='${request.id}'`,updatecat, function (err,result) { 
            if (!err && result.affectedRows > 0) {
                callback('1',{ keyword:'Category Name Change Success', components:{} },result)
            } else {
                callback('0',{ keyword:'rest_key_failed', components:{} },null)
            }
        })
    },

    deleteCategory: function (request, callback) { 
        con.query(`UPDATE tbl_category SET is_active=0, is_deleted=1 WHERE id ='${request.id}'`, function (err,result) { 
            if (!err && result.affectedRows > 0) {
                callback('1',{ keyword:'Category delete Success', components:{} },result)
            } else {
                callback('0',{ keyword:'rest_key_failed', components:{} },null)
            }
        })
    },

    getProductList: function (request, callback) { 
        let query = `SELECT p.*, CONCAT('${GLOBALS.PRODUCT_IMAGE}', p.image) as image, c.name as category_name FROM tbl_product p join tbl_category c ON p.category_id = c.id WHERE p.is_deleted = 0 AND p.is_active=1`

        if(request.id != undefined && request.id != 0){
            query += ` AND p.id = '${request.id}'`
        } else {
            query += ` ORDER BY p.name ASC`
        }
        con.query(query, function (err,result) { 
            if (!err) {
                if (result[0] != undefined) {
                    callback('1',{ keyword:'Success', components:{} },result)
                } else {
                    callback('2',{ keyword:'No Product Found', components:{} },[])
                }
            } else {
                callback('0',{ keyword:'Failed', components:{} },null)
            }
        })
    },

    createProduct: function (request, callback) { 
        const insetr = {
            category_id: request.category_id,
            name: request.name,
            price: request.price,
            qty: request.qty,
            details: request.details,
            image: request.image,
            unit: request.unit,
        }

        con.query(`INSERT INTO tbl_product SET ?`,insetr, function (err,result) { 
            if (!err && result.insertId > 0) {
                callback('1',{ keyword:'Product Create Success', components:{} },result)
            } else {
                callback('0',{ keyword:'rest_key_failed', components:{} },null)
            }
        })
    },

    editProduct: function (request, callback) { 
        const upda = {
            category_id: request.category_id,
            name: request.name,
            price: request.price,
            qty: request.qty,
            details: request.details,
            unit: request.unit
        }
        if (request.image != undefined && request.image != '') {
            upda.image = request.image
        }
        con.query(`UPDATE tbl_product SET ? WHERE id='${request.id}'`, upda, function (err,result) { 
            if (!err && result.affectedRows > 0) {
                callback('1',{ keyword:'Product Details Update Success', components:{} },result)
            } else {
                callback('0',{ keyword:'rest_key_failed', components:{} },null)
            }
        })
    },

    deleteProduct: function (request, callback) { 
        con.query(`UPDATE tbl_product SET is_active=0, is_deleted=1 WHERE id ='${request.id}'`, function (err,result) { 
            if (!err && result.affectedRows > 0) {
                callback('1',{ keyword:'Product delete Success', components:{} },result)
            } else {
                callback('0',{ keyword:'rest_key_failed', components:{} },null)
            }
        })
    },

    isSellOutStock: function (request, callback) { 
        con.query(`select * FROM tbl_product WHERE id ='${request.id}'`, function (err,result) { 
            if (!err && result[0] != undefined) {
                if (result[0].is_sell == 1) {
                    con.query(`UPDATE tbl_product SET is_sell = 0 WHERE id='${request.id}'`, function (err1,result1) { 
                        callback('1',{ keyword:'Product is Out of Stock', components:{} },[])
                    })
                } else {
                    con.query(`UPDATE tbl_product SET is_sell = 1 WHERE id='${request.id}'`, function (err1,result1) { 
                        callback('1',{ keyword:'Product is In Stock', components:{} },[])
                    })
                }
            } else {
                callback('0',{ keyword:'rest_key_failed', components:{} },null)
            }
        })
    },

    changePassword: function(request, callback){
        con.query(`select * from tbl_admin where email='${request.email}' AND password='${request.opassword}'`, function(err, result){
        if (!err && result[0] != undefined) {
                if(result[0].password === request.npassword){
                callback('0',{ keyword:'Sorry, Your New Password cannot be the same as Old Password', components:{} },[])
                } else {
                    con.query(`update tbl_admin SET password='${request.npassword}' WHERE email='${request.email}'`, ()=>{
                        callback('1',{ keyword:'Password Changed Successfully', components:{} },[])
                    })
                }
        } else {
            callback('0',{ keyword:'Sorry! Old Password Does Not Match', components:{} },null)
        }
        })
    },

    userCreate : function (request, callback) { 
        con.query(`SELECT * from tbl_user WHERE email = '${request.email}' and is_deleted='0'`, function (err,result) { 
            if (!err) {
                if (result[0] != undefined) {
                    callback('0',{ keyword:'Customer Already Registed with this email', components:{} },null)
                } else {
                    var randtoken = require('rand-token').generator();
                    var randgen = randtoken.generate(8, "0123456789abcdefghijklnmopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ");
                    const inersat = {
                        fname: request.fname,
                        lname: request.lname,
                        email: request.email,
                        phone: request.phone,
                        address: request.address,
                        password: randgen,
                        business_name: request.business_name,
                        is_verify:1
                    }
                    con.query(`INSERT INTO tbl_user set ?`, inersat, function (err1,res1) { 
                        if (!err1 && res1.insertId > 0) {
                            const deviceinfo= {
                                user_id: res1.insertId,
                                token: 'gkuygkuyfgywugf',
                                device_type:'A',
                                device_token:'dasdasda4234234'
                            }
                            con.query(`INSERT INTO tbl_user_deviceinfo SET ?`,deviceinfo,  function (err2,res2) { 
                                if (!err2 && res2.insertId > 0) {
                                    Auth.userdetails(res1.insertId, function (DataUser) { 
                                        emailTemplate.registerEmail(DataUser, function (verifytemplate) {
                                            common.send_email("Ballina's Customer Credential", DataUser.email, verifytemplate, function (isSend) {
                                                callback('1',{ keyword:'rest_success', components:{} },[])
                                            })
                                        })
                                    })
                                } else {
                                    callback('0',{ keyword:'rest_key_failed', components:{} },null)
                                }
                            })
                        } else {
                            callback('0',{ keyword:'rest_key_failed', components:{} },null)
                        }
                    })
                }
            } else {
                callback('0',{ keyword:'rest_key_failed', components:{} },null)
            }
        })
    },

    acceptRejectOrder: function (request, callback) { 
        con.query(`select o.id, CONCAT(fname,' ', lname) as name, o.order_id,o.total_payout, o.address, DATE_FORMAT(o.deliver_datetime, '%d %b, %Y - %l:%i %p') as deliver_datetime from tbl_order o JOIN tbl_user u ON u.id = o.user_id WHERE o.status = 'Order Placed'`, function (err,result) { 
            if (!err) {
                if (result[0] != undefined) {
                        callback('1',{ keyword:'Success', components:{} },result)
                } else {
                    callback('2',{ keyword:'No data Found', components:{} },[])
                }
            } else {
                callback('0',{ keyword:'rest_key_failed', components:{} },null)
            }
        })
    },

    accpetRejectOrder: function (request, callback) { 
        if (request.tag == 'accept') {
            con.query(`UPDATE tbl_order SET status = 'Order Accepted' WHERE order_id = '${request.id}'`, function (err,result) { 
                if (!err && result.affectedRows > 0) {
                    callback('1',{ keyword:'Order Accepted Success', components:{} },result)
                } else {
                    callback('0',{ keyword:'rest_key_failed', components:{} },null)
                }
            })
        } else {
            con.query(`UPDATE tbl_order SET status = 'Rejected' WHERE order_id = '${request.id}'`, function (err,result) { 
                if (!err && result.affectedRows > 0) {
                    callback('1',{ keyword:'Order Reject Success', components:{} },result)
                } else {
                    callback('0',{ keyword:'rest_key_failed', components:{} },null)
                }
            })
        }
    },

    orderItemData: function (request, callback) { 
        con.query(`select p.id, p.name, CONCAT('${GLOBALS.PRODUCT_IMAGE}', p.image) as image, d.price, p.qty, d.qty as quantity from tbl_order_detail d JOIN tbl_product p ON d.product_id = p.id WHERE d.order_id = '${request.id}'`, function (err1,res1) { 
            console.log("🚀 ~ res1:", res1)
            if (!err1 && res1[0] != undefined) {
                callback('1',{ keyword:'rest_success', components:{} },res1)
            } else {
                console.log("🚀 ~ err1:", err1)

                callback('0',{ keyword:'rest_key_failed', components:{} },null)
            }
        })
    },

    manageOrder: function (request, callback) { 
        let query = `select o.id, CONCAT(fname,' ', lname) as name,u.phone,u.business_name, o.order_id,o.total_payout,
        o.tax,o.shipping, o.payment_surcharge, o.address,
        DATE_FORMAT(o.deliver_datetime, '%d %b, %Y %h:%i %p') as deliver_datetime
        , DATE_FORMAT(o.inserted_at, '%d %b, %Y %h:%i %p') as inserted_at ,o.status,o.cancel_reason from tbl_order o JOIN tbl_user u ON u.id = o.user_id  `

        if(request.tag == 'received'){
            query += ` WHERE o.status NOT IN ('Rejected', 'Order Cancelled', 'Delivered') ORDER BY inserted_at DESC`
        } else if(request.tag == 'completed'){
            query += ` WHERE o.status = 'Delivered' ORDER BY inserted_at DESC`
        } else if (request.tag == 'cancelled'){
            query += ` WHERE o.status IN ('Order Cancelled', 'Rejected') ORDER BY inserted_at DESC`
        } else {
            query += ` ORDER BY inserted_at DESC`
        }
        
        con.query(query, function (err,result) { 
            if (!err) {
                if (result[0] != undefined) {
                    callback('1',{ keyword:'rest_success', components:{} },result)
                } else {
                    callback('2',{ keyword:'No Order Found', components:{} },[])
                }
            } else {
                callback('0',{ keyword:'rest_key_failed', components:{} },null)
            }
        })
    },

    manageProduct: function (request, callback) { 
        try {
            let query = `SELECT p.*, CONCAT('${GLOBALS.PRODUCT_IMAGE}', p.image) as image, c.name as category_name from tbl_product p JOIN tbl_category c ON c.id = p.category_id `
           
            if(request.tag == 'Fruits'){
                console.log("🚀 ~ request.tag:", request.tag)
                query += ` WHERE p.is_deleted = 0 AND p.is_active=1 AND c.name = 'Fruits'`
            } 
            else if(request.tag == 'Vegetables'){
                query += ` WHERE p.is_deleted = 0 AND p.is_active=1 AND c.name = 'Vegetables'`
            } else if (request.tag == 'Grocery'){
                query += ` WHERE p.is_deleted = 0 AND p.is_active=1 AND c.name = 'Grocery'`
            } 
            else {
                 if(request.id != undefined && request.id != 0){
                query += ` AND p.id = '${request.id}'`
            } else {
                query += ` ORDER BY p.name ASC`
            }
                query  =  query
            }
            
            con.query(query, function (err,result) { 
                console.log("🚀 ~ result:", result)
                if (!err) {
                    if (result[0] != undefined) {
                        callback('1',{ keyword:'rest_success', components:{} },result)
                    } else {
                        callback('2',{ keyword:'No Order Found', components:{} },[])
                    }
                } 
                else {
                    callback('0',{ keyword:'rest_key_failed', components:{} },null)
                }
            })
        } catch (error) {
            console.log("🚀 ~ error:", error)
        }
     
    },

    manageOrderDataInvoice: function (request, callback) { 
        let query = `select o.id, CONCAT(fname,' ', lname) as name,u.phone, o.order_id,o.total_payout,o.tax,o.shipping, o.payment_surcharge, o.address, DATE_FORMAT(o.deliver_datetime, '%d %b, %Y %h:%i %p') as deliver_datetime, DATE_FORMAT(o.inserted_at, '%d %b, %Y %h:%i %p') as inserted_at ,o.status, o.cancel_reason, u.business_name from tbl_order o JOIN tbl_user u ON u.id = o.user_id WHERE o.order_id='${request.id}'`

        con.query(query, function (err,result) { 
            if (!err) {
                if (result[0] != undefined) {
                    callback('1',{ keyword:'rest_success', components:{} },result)
                } else {
                    callback('2',{ keyword:'No Order Found', components:{} },[])
                }
            } else {
                callback('0',{ keyword:'rest_key_failed', components:{} },null)
            }
        })
    },

    manageOrderStatus: function (request, callback) { 
        con.query(`select * from tbl_order where order_id = '${request.id}'`, function (err,result) { 
            if (!err && result[0] != undefined) {
                con.query(`UPDATE tbl_order SET status = 'On the Way' WHERE order_id = '${request.id}'`, function (err1,res1) { 
                    if (!err1 && res1.affectedRows > 0) {
                        callback('1',{ keyword:'Order is On the Way', components:{} },res1)
                    } else {
                        callback('0',{ keyword:'rest_key_failed', components:{} },null)
                    }
                })
            } else {
                callback('0',{ keyword:'rest_key_failed', components:{} },null)
            }
        })
    },

    manageOrderDeliver: function (request, callback) { 
        con.query(`select * from tbl_order where order_id = '${request.id}'`, function (err,result) { 
            if (!err && result[0] != undefined) {
                con.query(`UPDATE tbl_order SET status = 'Delivered', is_payment='1' WHERE order_id = '${request.id}'`, function (err1,res1) { 
                    if (!err1 && res1.affectedRows > 0) {
                        Auth.insertNoti(result[0], function (sendis) {  
                            callback('1',{ keyword:'Order is Delivered', components:{} },res1)
                        })
                    } else {
                        callback('0',{ keyword:'rest_key_failed', components:{} },null)
                    }
                })
            } else {
                callback('0',{ keyword:'rest_key_failed', components:{} },null)
            }
        })
    },

    insertNoti: function (request,callback) {
        const insnoti = {
            sender_id: 0,
            receiver_id: request.user_id,
            message: 'Your Order is successfully delivered!',
            title: 'order',
        }
        con.query(`INSERT INTO tbl_notification SET ?`, insnoti, function (err,result) { 
            if (!err && result.insertId > 0) {
                callback(result)
            } else {
                callback(null)
            }
        })
    },

    sendNotificatio: function (request, callback) { 
        con.query(`SELECT u.id, d.device_type,d.device_token FROM tbl_user u JOIN tbl_user_deviceinfo d ON u.id = d.user_id WHERE u.is_active=1 and u.is_deleted=0 and u.is_otp_verify=1 and u.push_noti=1`, function (err,result) { 
            if (!err && result[0] != undefined) {
                asyncLoop(result, function (item, next){
                    var push_params = {
                        message: request.message,
                        tag: request.title,
                        sender_id: 0,
                        receiver_id: item.id
                    };
                    insertNoti(push_params, function (insert) {  
                        notify.sendPush(item.device_token, item.device_type, push_params, function (status) { 
                            if (status) {
                                next();
                            } else {  
                                next();
                            }
                        })
                    })
                }, function (){
                    callback('1', { keyword: 'Notification Send Success', components: {} }, null)
                });
            } else {
                callback('0',{ keyword:'Failed To Send Notification', components:{} },null)
            }
        })

        function insertNoti(request,callback) {
            const insnoti = {
                sender_id: 0,
                receiver_id: request.receiver_id,
                message: request.message,
                title: request.tag,
            }
            con.query(`INSERT INTO tbl_notification SET ?`, insnoti, function (err,result) { 
                if (!err && result.insertId > 0) {
                    callback(result)
                } else {
                    callback(null)
                }
            })
        }
    },

   

    customerGraph: function (request, callback) { 
        con.query(`SELECT count(id) as count, date_format(created_at, '%b') as month FROM tbl_user group by month(created_at) `, function (err,result) { 
            if (!err) {
                if (result[0] != undefined) {
                    callback('1',{ keyword:'rest_success', components:{} },result)
                } else {
                    callback('2',{ keyword:'No data Found', components:{} },[])
                }
            } else {
                callback('0',{ keyword:'rest_key_failed', components:{} },null)
            }
        })
    },

    monthOrderSale: function (request, callback) { 
        con.query(`SELECT count(id) as count, DATE_FORMAT(inserted_at,'%b') as month, sum(total_payout) as payment FROM tbl_order group by month(inserted_at)`, function (err,result) { 
            if (!err) {
                if (result[0] != undefined) {
                    callback('1',{ keyword:'rest_success', components:{} },result)
                } else {
                    callback('2',{ keyword:'No data Found', components:{} },[])
                }
            } else {
                callback('0',{ keyword:'rest_key_failed', components:{} },null)
            }
        })
    },

    dateOrderSale: function (request, callback) { 
        con.query(`SELECT count(id) as count, DATE_FORMAT(inserted_at,'%Y-%m-%d') as date, sum(total_payout) as payment FROM tbl_order group by date(inserted_at) ORDER BY DATE(inserted_at) desc LIMIT 7`, function (err,result) { 
            if (!err) {
                if (result[0] != undefined) {
                    callback('1',{ keyword:'rest_success', components:{} },result.reverse())
                } else {
                    callback('2',{ keyword:'No data Found', components:{} },[])
                }
            } else {
                callback('0',{ keyword:'rest_key_failed', components:{} },null)
            }
        })
    },

    vendorReports: function (request, callback) { 
        con.query(`SELECT count(id) as count, DATE_FORMAT(inserted_at,'%Y-%m-%d') as date, sum(total_payout) as payment FROM tbl_order where date(inserted_at) between '${request.start_date}' and '${request.end_date}' and user_id='${request.id}' and status NOT in ('Order Cancelled', 'Rejected') group by date(inserted_at) ORDER BY DATE(inserted_at) desc`, function (err,result) { 
            if (!err) {
                if (result[0] != undefined) {
                    callback('1',{ keyword:'rest_success', components:{} },result.reverse())
                } else {
                    callback('2',{ keyword:'No data Found', components:{} },[])
                }
            } else {
                callback('0',{ keyword:'rest_key_failed', components:{} },null)
            }
        })
    },
    flyerReports: function (request, callback) { 
        con.query(`SELECT order_id, product_id, address, status, count(id) as count, 
        DATE_FORMAT(inserted_at,'%Y-%m-%d %h:%i %p') as order_date,
        DATE_FORMAT(deliver_datetime,'%Y-%m-%d %h:%i %p') as deliver_datetime, 
        sum(total_payout) as payment FROM tbl_order where date(inserted_at)
         between '${request.start_date}' and '${request.end_date}' and 
         status NOT in ('Order Cancelled', 'Rejected') group by date(inserted_at) 
         ORDER BY DATE(inserted_at) desc`, function (err,result) { 
            if (!err) {
                if (result[0] != undefined) {
                    callback('1',{ keyword:'rest_success', components:{} },result.reverse())
                } else {
                    callback('2',{ keyword:'No data Found', components:{} },[])
                }
            } else {
                callback('0',{ keyword:'rest_key_failed', components:{} },null)
            }
        })
    },


}
module.exports = Auth;