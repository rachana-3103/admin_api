var con = require('../../../config/database');
var GLOBALS = require('../../../config/constants');
var common = require('../../../config/common');
var cryptoLib = require('cryptlib');
var asyncLoop = require('node-async-loop');
var moment = require('moment');
var shaKey = cryptoLib.getHashSha256(GLOBALS.KEY, 32);
var emailTemplate = require('../../../config/template');


var Auth = {

    vendorLogin: function (request, callback) {
        con.query("SELECT * FROM tbl_vendor WHERE email='" + request.email + "'", function (err, result, fields) {
            if (!err && result[0] != undefined) {
                if (result[0].is_admin_approve == 1) {
                Auth.vendDetails(result[0].id, function (userprofile) {
                    if (userprofile.password !== request.password) {
                        callback('0', {
                            keyword: 'rest_keywords_invalid_password',
                            components: {}
                        }, null);
                    } else {
                        const randtoken = require('rand-token').generator();
                        const usersession = randtoken.generate(64, "0123456789abcdefghijklnmopqrstuvwxyz");
                        const updparams = {
                            token: usersession
                        }
                        Auth.update_vendor(result[0].id, updparams, function (userprofilew, error) {
                            callback('1', {
                                keyword: 'rest_keywords_user_login_success',
                                components: {}
                            }, userprofilew);
                        });
                    }
                });
            } else {
                callback('0', {keyword: 'Please Contact to Admin, Your Profile is Under Review',components: {}}, null)
            }
            } else {
                callback('0', {
                    keyword: 'Please Enter Valid Email Address',
                    components: {}
                }, null)
            }
        })
    },

    update_vendor: function (user_id, upd_params, callback) {
        con.query("UPDATE tbl_vendor SET ? WHERE id = ? ", [upd_params, user_id], function (err, result, fields) {
            if (!err) {
                Auth.vendDetails(user_id, function (response, err) {
                    callback(response);
                });
            } else {
                callback(null);
            }
        });
    },

    vendDetails: function (user_id, callback) {
        con.query(`SELECT u.*,concat('${GLOBALS.USER_IMAGE}',u.profile_image) as profile_image, (select id from tbl_store where vendor_id='${user_id}') as store FROM tbl_vendor u WHERE u.id = '${user_id}' GROUP BY u.id`, function (err, result, fields) {
            if (!err && result.length > 0) {
                callback(result[0]);
            } else {
                console.log(err);
                callback(null);
            }
        });
    },

    dashBoardV: function (request, callback) { 
        con.query(`SELECT count(i.product_id) as total_product, sum(i.qty) as total_qty, (select count(id) from tbl_offers WHERE vendor_id = s.vendor_id AND is_deleted=0) as total_offer FROM tbl_inventory i JOIN tbl_store s ON i.store_id = s.id WHERE s.vendor_id = '${request.vendor_id}'`, function (err,result) { 
            if (!err) {
                callback('1',{ keyword:'Success', components:{} },result)
            } else {
                callback('0',{ keyword:'Failed', components:{} },null)
            }
        })
    },

    manageInventory: function (request, callback) {  
        con.query(`SELECT p.*, IF((SELECT id FROM tbl_inventory WHERE store_id = '${request.store_id}' and product_id = p.id) > 0, 1, 0 ) as inventory, (select concat('${GLOBALS.PRODUCT_IMAGE}', image) as image from tbl_product_image where product_id = p.id LIMIT 1) as image FROM tbl_product as p where p.is_active=1 and p.is_deleted=0 AND p.vendor_id='${request.vendor_id}'`, function (err,result) { 
            if (!err) {
                if (result[0] != undefined) {
                    callback('1',{ keyword:'Success', components:{} },result)
                } else {
                    callback('2',{ keyword:'No Data Found', components:{} },[])
                }
            } else {
                callback('0',{ keyword:'Failed!', components:{} },null)
            }
        })
    },

    updateInventory_bk: function (request, callback) { 
        con.query(`select * from tbl_inventory WHERE store_id='${request.store_id}' AND product_id ='${request.product_id}'`, function (err,result) { 
            if (!err && result[0] != undefined) {
                con.query(`UPDATE tbl_inventory SET qty='${request.qty}' WHERE id='${result[0].id}'`, function (err1,result1) { 
                    callback('1',{ keyword:'Success', components:{} },result1)
                })
            } else {
                const insinv = {
                    store_id:request.store_id,
                    product_id: request.product_id,
                    qty: request.qty
                }
                con.query(`INSERT INTO tbl_inventory SET ?`, insinv, function (err2,result2) { 
                    if (!err2 && result2.insertId > 0) {
                        callback('1',{ keyword:'Success', components:{} },result2)
                    } else {
                        callback('0',{ keyword:'Failed!', components:{} },null)
                    }
                })
            }
        })
    },

    updateInventory: function (request, callback) { 
        con.query(`select * from tbl_inventory WHERE store_id='${request.store_id}' AND product_id ='${request.product_id}'`, function (err,result) { 
            if (!err && result[0] != undefined) {
                con.query(`DELETE FROM tbl_inventory WHERE store_id='${request.store_id}' AND product_id ='${request.product_id}'`, function (err1,result1) { 
                    if (!err1 && result1.affectedRows > 0) {
                        callback('1',{ keyword:'Success', components:{} },result1)
                    } else {
                        callback('0',{ keyword:'rest_key_failed', components:{} },null)
                    }
                })
            } else {
                const insinv = {
                    store_id:request.store_id,
                    product_id: request.product_id,
                }
                con.query(`INSERT INTO tbl_inventory SET ?`, insinv, function (err2,result2) { 
                    if (!err2 && result2.insertId > 0) {
                        callback('1',{ keyword:'Success', components:{} },result2)
                    } else {
                        callback('0',{ keyword:'Failed!', components:{} },null)
                    }
                })
            }
        })
    },

    productDetails: function (request, callback) { 
        con.query(`SELECT p.*, (select c.category_name from tbl_product_category as c where c.id = p.product_category_id) as category_name, (select concat('${GLOBALS.PRODUCT_IMAGE}', image) as image from tbl_product_image where product_id = p.id LIMIT 1) as image FROM tbl_product as p WHERE p.vendor_id = '${request.vendor_id}'`, function (err,result) { 
            if (!err){
                if (result[0] != undefined) {
                    callback('1',{ keyword:'Success', components:{} },result)
                } else {
                    callback('2',{ keyword:'No Product Found', components:{} },[])
                }
            } else {
                callback('0',{ keyword:'Failed!', components:{} },null)
            }
        })
    },

    offerList: function (request, callback) { 
        let query = `SELECT f.*, CONCAT('${GLOBALS.OFFER_IMAGE}', f.image) as image, CONCAT(f.min_range, '% - ',f.max_range,'%') as rangee, v.name as vendor_name, p.product_name FROM tbl_offers as f JOIN tbl_vendor as v ON f.vendor_id = v.id JOIN tbl_product as p ON f.product_id = p.id WHERE f.is_deleted = 0 AND f.vendor_id='${request.vendor_id}'`
        if (request.id != 0) 
        {
            query += ` AND f.id = '${request.id}'`;
        }
        con.query(query, function (err,result) {
            if (!err) {
                if (result[0] != undefined) {
                    callback('1',{ keyword:'Success', components:{} },result)
                } else {
                    callback('2',{ keyword:'No Offer Found', components:{} },[])
                }
            } else {
                callback('0',{ keyword:'Failed!', components:{} },null)
            }
        })
    },

    offerCreate: function (request,callback) { 
        const insert= {
            vendor_id: request.vendor_id,
            product_id: request.product_id,
            image: request.image,
            min_range: request.min_range,
            max_range:  request.max_range,
            start_day: request.start_day,
            end_day: request.end_day
        }
        con.query(`INSERT INTO tbl_offers SET ?`, insert,function (err,result) { 
            if (!err  && result.insertId > 0) {
                callback('1',{ keyword:'Offer Create Successful', components:{} },result)
            } else {
                callback('0',{ keyword:'Failed to Create Offer!', components:{} },null)
            }
        })
    },

    offerUpdate: function (request, callback) { 
        const update = {
            min_range: request.min_range,
            max_range: request.max_range,
            start_day: request.start_day,
            end_day: request.end_day,
        }
        con.query(`UPDATE tbl_offers SET ? WHERE id = '${request.id}'`,update, function (err,result) { 
            if (!err  && result.affectedRows > 0) {
                callback('1',{ keyword:'Success', components:{} },result)
            } else {
                callback('0',{ keyword:'Failed!', components:{} },null)
            }
        })
    },

    offerDelete: function (request, callback) { 
        con.query(`UPDATE tbl_offers SET is_deleted = 1 WHERE id='${request.id}'`, function (err,result) { 
            if (!err && result.affectedRows > 0) {
                callback('1',{ keyword:'Offer Delete Success', components:{} },result)
            } else {
                callback('0',{ keyword:'Failed!', components:{} },null)
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
 getPolicy: function (request, callback) {
        con.query("SELECT * FROM tbl_content_page WHERE page_name='policy' AND is_deleted=0", function (err, result, fields) {
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

    getStorecatevendor: function (request, callback) { 
        con.query(`select id, category_name from tbl_store_category where is_active=1 and is_deleted =0`, function (err,result) { 
            if (!err) {
                if (result[0] != undefined) {
                    callback('1',{ keyword:'rest_success', components:{} },result)
                } else {
                    callback('2',{ keyword:'rest_keywords_nodata', components:{} },[])
                }
            } else {
                callback('0',{ keyword:'rest_key_failed', components:{} },null)
            }
        })
    },


    createVendor: function (request, callback) { 
        con.query(`select * from tbl_vendor WHERE email ='${request.email}' and is_deleted = 0`, function (err,result) { 
            if (!err && result.length == 0) {
                // const randtoken = require('rand-token').generator();
                // const usersession = randtoken.generate(12, "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklnmopqrstuvwxyz@#$%&");
                const vendcrea = {
                    name: request.name,
                    email: request.email,
                    phone: request.phone == '' ? '' : request.phone,
                    password: request.password
                }
                con.query(`INSERT INTO tbl_vendor SET ?`, vendcrea, function (err1,result1) { 
                    if (!err1 && result1.insertId > 0) {
                        Auth.vendDetails(result1.insertId, function (userDate) {
                            userDate.url = "http://35.183.149.96/vendor/signIn"
                            emailTemplate.registerEmail(userDate, function (verifytemplate) {
                                common.send_email("Thank You For Register as Vendor", userDate.email, verifytemplate, function (isSend) {
                                    Auth.createStore(request, result1.insertId, function (storeDate) {
                                        Auth.storeImage(request, storeDate.insertId, function (storeImage) {
                                            callback('1', { keyword: 'Success, Please Wait for Admin Approval', components: {} }, userDate);
                                        })
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
        con.query(`SELECT u.*,concat('${GLOBALS.USER_IMAGE}',u.profile_image) as profile_image, (select id from tbl_store where vendor_id='${user_id}') as store FROM tbl_vendor u WHERE u.id = '${user_id}' GROUP BY u.id`, function (err, result, fields) {
            if (!err && result.length > 0) {
                callback(result[0]);
            } else {
                callback(null);
            }
        });
    },

    createStore: function (request, id, callback) {  
        const stre = {
            vendor_id: id,
            name: request.store_name,
            address: request.store_name,
            store_category_id: request.category_id,
            lat:request.lat,
            longa: request.longa,
            is_active:0,
            is_deleted:1,
        }
        con.query(`INSERT INTO tbl_store SET ?`, stre, function (err,result) { 
            if (!err) {
                callback(result)
            } else {
                callback(null)
            }
        })
    },

    storeImage: function (request, id, callback) { 
        var images = request.image.split(',');
        asyncLoop(images, function (item, next) {
            var img = item.trimStart();
            var imageParams = {
                store_id: id,
                image:img
            };
            con.query(`INSERT INTO tbl_store_image SET ?`, imageParams, function (err, result) {
                if (!err) {
                    next();
                } else {
                    next();
                }
            });
        }, function (){
            callback(1);
        });
    },

    getSubList: function (request, callback) {
        con.query(`select * from tbl_subscription where is_active = 1`, function (err,result) { 
            if (!err) {
                if (result[0] != undefined) {
                    callback('1',{ keyword:'rest_success', components:{} },result)
                } else {
                    callback('2',{ keyword:'rest_keywords_nodata', components:{} },[])
                }
            } else {
                callback('0',{ keyword:'rest_key_failed', components:{} },null)
            }
        })
    },

    orderIdStore: function (request, callback) { 
        if(request.end == '3'){
            request.end_date = moment().add(3, 'months').format('YYYY-MM-DD');
        } else if(request.end == '6'){
            request.end_date = moment().add(6, 'months').format('YYYY-MM-DD');
        } else{
            request.end_date = moment().add(12, 'months').format('YYYY-MM-DD');
        }

        const update = {
            order_no: request.order_id,
            is_subscripation: 1,
            end_date: request.end_date
        }
        con.query(`UPDATE tbl_vendor SET ? WHERE id='${request.id}'`, update, function (err,result) { 
            if (!err && result.affectedRows > 0) {
                const inspay = {
                    vendor_id: request.id,
                    order_no: request.order_id,
                    end_date: request.end_date,
                    response: JSON.stringify(request.response)
                }
                con.query(`INSERT INTO tbl_payment_log SET ?`, inspay,function (err1,result1) { 
                    if (!err1 && result1.affectedRows > 0) {
                        callback('1',{ keyword:'rest_success', components:{} },result1)
                    } else {
                        callback('0',{ keyword:'rest_key_failed', components:{} },null)
                    }
                })
            } else {
                callback('0',{ keyword:'rest_key_failed', components:{} },null)
            }
        })
    },

    notificationVendor: function (request, callback) { 
        con.query(`SELECT n.*, u.full_name FROM tbl_vendor_notification as n JOIN tbl_user as u ON u.id = n.sender_id WHERE n.is_read = 0 AND n.receiver_id = '${request.id}' ORDER BY n.created_at desc`, function (err,result) { 
            if (!err) {
                if (result[0] != undefined) {
                    callback('1',{ keyword:'rest_success', components:{} },result)
                } else {
                    callback('2',{ keyword:'No Notification', components:{} },[])
                }
            } else {
                callback('0',{ keyword:'rest_key_failed', components:{} },null)
            }
        })
    },

    getProdCateList: function (request, callback) { 
        con.query(`select id, category_name from tbl_product_category where is_active = 1`, function (err,result) { 
            if (!err) {
                if (result[0] != undefined) {
                    callback('1',{ keyword:'rest_success', components:{} },result)
                } else {
                    callback('2',{ keyword:'No Notification', components:{} },[])
                }
            } else {
                callback('0',{ keyword:'rest_key_failed', components:{} },null)
            }
        })
    },

    setDefaultProd: function (request, callback) { 
        asyncLoop(request.id, function (item, next){
            con.query(`select id from tbl_product where product_category_id = '${item}' AND is_active=1 AND is_deleted=0 AND vendor_id='${request.vendor_id}'`, function (err,result) { 
                if (!err && result[0] != undefined) {
                    asyncLoop(result, function (item1, next1){
                        const insinv = {
                            store_id:request.store_id,
                            product_id: item1.id,
                        }
                        con.query(`INSERT INTO tbl_inventory SET ?`, insinv, function (err2,result2) {
                            if (!err2 && result2.insertId > 0) {
                                next1();
                            } else {
                                next1();
                            }
                        })
                    });
                } else {
                    next();
                }
            })
            next();
        }, function (){
            callback('1',{ keyword:'rest_success', components:{} },[])
        });
    },


    createContact: function (request, callback) { 
        const insert ={
            full_name:request.full_name,
            email: request.email,
            subject: request.subject,
            description: request.description
        }
        con.query(`INSERT into tbl_contact_us SET ?`, insert,function (err,result) { 
            if (!err && result.insertId > 0) {
                callback('1',{ keyword:'Your Query Has Been Submit Successful', components:{} },result)
            } else {
                callback('0',{ keyword:'Failed!', components:{} },null)
            }
        })
    },


    resetPassEmail: function (request, callback) { 
        con.query(`select * from tbl_vendor where email = '${request.email}' AND is_deleted=0`, function (err,result) { 
            if (!err) {
                if (result[0] != undefined) {
                    var randtoken = require('rand-token').generator();
                    // var usersession = randtoken.generate(64, "0123456789abcdefghijklnmopqrstuvwxyz");
                     const upda = {
                        forgot_token: randtoken.generate(64, "0123456789abcdefghijklnmopqrstuvwxyz")
                     }
                    Auth.update_vendor(result[0].id, upda, function (userDate) { 
                      userDate.url = "http://35.183.149.96/vendor/forgotpassword/"+userDate.forgot_token
                        emailTemplate.forgot_password(userDate, function (verifytemplate) {
                            common.send_email("Forgot your Password", userDate.email, verifytemplate, function (isSend) {
                                callback('1',{ keyword:'Please Check Your Mail To Forgot Password', components:{} },result)
                            })
                        })
                    })
                } else {
                    callback('0',{ keyword:'Please, Check Your Email Address, We cant Find any account', components:{} },[])
                }
            } else {
                callback('0',{ keyword:'Failed!', components:{} },null)
            }
        })
    },

    resetPassword: function (request, callback) { 
        con.query(`select * from tbl_vendor where forgot_token = '${request.forgot_token}'`, function (err,result) { 
            if (!err) {
                if (result[0] != undefined) {
                    const updae = {
                        forgot_token:'',
                        password:request.password
                    }
                    Auth.update_vendor(result[0].id, updae, function (userdata) { 
                        callback('1',{ keyword:'Password Change Success', components:{} },[])
                    })
                } else {
                    callback('0',{ keyword:'rest_key_failed', components:{} },[])
                }
            } else {
                callback('0',{ keyword:'rest_key_failed', components:{} },null)
            }
        })
    },

    createProduct: function (request, callback) { 
        const insert = {
            vendor_id: request.vendor_id,
            product_category_id: request.product_category_id,
            sub_category_id: 1,
            store_id: 1,
            product_name: request.product_name,
            price:request.price,
            qty: request.qty,
            unit: request.unit,
            discount_value: request.discount_value,
            supplier: request.supplier,
            details: request.details,
            extra_details: request.extra_details
        }
        con.query(`INSERT INTO tbl_product SET ?`, insert, function (err,result) { 
            if (!err && result.insertId > 0) {
                Auth.productImage(request, result.insertId, function (prodImag) { 
                    callback('1',{ keyword:'Product Create Success', components:{} },result)
                })
            } else {
                callback('0',{ keyword:'Failed to Create Product', components:{} },null)
            }
        })
    },

    productImage: function (request, id, callback) { 
        var images = request.image.split(',');
        if(request.image != '' && request.image != undefined){
            asyncLoop(images, function (item, next) {
                var img = item.trimStart();
                var imageParams = {
                    product_id: id,
                    image:img
                };
                con.query(`INSERT INTO tbl_product_image SET ?`, imageParams, function (err, result) {
                    if (!err) {
                        next();
                    } else {
                        next();
                    }
                });
            }, function (){
               callback(1);
            });
        }else{
            callback(1)
        }
    },

    editProduct: function (request, callback) { 
        const udat = {
            product_name: request.product_name,
            supplier: request.supplier,
            price: request.price,
            qty: request.qty,
            unit: request.unit,
            discount_value: request.discount_value,
            details: request.details,
            extra_details: request.extra_details
        }
        con.query(`UPDATE tbl_product SET ? WHERE id='${request.id}' AND vendor_id='${request.vendor_id}'`,udat, function (err,result) { 
            if (!err && result.affectedRows > 0) {
                Auth.productImage(request, request.id, function (prodImag) { 
                    callback('1',{ keyword:'Product Details Change Success', components:{} },result)
                })
            } else {
                callback('0',{ keyword:'Failed to Change Product details', components:{} },null)
            }
        })
    },

    getProductDetails: function(request, callback){
        con.query(`SELECT c.category_name, p.product_name as name, p.supplier as brand, p.price, p.qty, p.discount_value as discount,p.details, p.extra_details FROM tbl_product p JOIN tbl_product_category c ON p.product_category_id = c.id WHERE p.id = '${request.id}' and p.vendor_id = '${request.vendor_id}'`, function (err,result) { 
            if (!err) {
                if (result[0] != undefined) {
                    callback('1',{ keyword:'Success', components:{} },result[0])
                } else {
                    callback('2',{ keyword:'No Data Found', components:{} },[])
                }
            } else {
                callback('0',{ keyword:'rest_key_failed', components:{} },null)
            }
        })
    },

}
module.exports = Auth;