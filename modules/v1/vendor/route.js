var express = require('express')
var middleware = require('../../../middleware/headerValidator');
var GLOBALS = require('../../../config/constants');
var common = require('../../../config/common');
var auth_model = require('./auth_model');
var asyncLoop = require('node-async-loop');
var router = express.Router();
var emailTemplate = require('../../../config/template');
const messages = require('../../../languages/en');

/*==================================================================================================================================================
====================================================================================================================================================
==================================================================================================================================================*/

router.post('/vendorlogin', function (req,res) { 
    middleware.decryption(req, function (request) { 
        var rules = { 
            email: 'required',
            password: 'required',
        }
        const messages = { 
            'required': req.language.required
        }

        if(middleware.checkValidationRules(request, res, rules, messages,{})){
            auth_model.vendorLogin(request,function (responsecode, responsemsg, responsedata) { 
                middleware.sendresponse(req, res, 200, responsecode, responsemsg, responsedata)
            })
        }
     })
})

router.post('/dashboard', function (req, res) { 
    middleware.decryption(req, function (request) { 
        var rules = { 
            vendor_id: 'required'
        }
        const messages = { 
            'required': req.language.required
        }
        if(middleware.checkValidationRules(request, res, rules, messages,{})){
            auth_model.dashBoardV(request, function (responsecode, responsemsg, responsedata) { 
                middleware.sendresponse(req, res, 200, responsecode, responsemsg, responsedata)
            })
        }
    })
})

router.post('/manageinventory', function (req, res) { 
    middleware.decryption(req, function (request) { 
        var rules = { 
            store_id: 'required'
        }
        const messages = { 
            'required': req.language.required
        }
        if(middleware.checkValidationRules(request, res, rules, messages,{})){
            auth_model.manageInventory(request, function (responsecode, responsemsg, responsedata) { 
                middleware.sendresponse(req, res, 200, responsecode, responsemsg, responsedata)
            })
        }
    })
})
router.post('/updateinventory_bk', function (req, res) { 
    middleware.decryption(req, function (request) { 
        var rules = { 
            store_id: 'required',
            product_id: 'required',
            qty: 'required',
        }
        const messages = { 
            'required': req.language.required
        }
        if(middleware.checkValidationRules(request, res, rules, messages,{})){
            auth_model.updateInventory_bk(request, function (responsecode, responsemsg, responsedata) { 
                middleware.sendresponse(req, res, 200, responsecode, responsemsg, responsedata)
            })
        }
    })
})
router.post('/updateinventory', function (req, res) { 
    middleware.decryption(req, function (request) { 
        var rules = { 
            store_id: 'required',
            product_id: 'required',
        }
        const messages = { 
            'required': req.language.required
        }
        if(middleware.checkValidationRules(request, res, rules, messages,{})){
            auth_model.updateInventory(request, function (responsecode, responsemsg, responsedata) { 
                middleware.sendresponse(req, res, 200, responsecode, responsemsg, responsedata)
            })
        }
    })
})

router.post('/productdetails', function (req, res) { 
    middleware.decryption(req, function (request) { 
        var rules = {}
        const messages = { 
            'required': req.language.required
        }
        if(middleware.checkValidationRules(request, res, rules, messages,{})){
            auth_model.productDetails(request, function (responsecode, responsemsg, responsedata) { 
                middleware.sendresponse(req, res, 200, responsecode, responsemsg, responsedata)
            })
        }
    })
})

router.post('/offerlist', function (req, res) { 
    middleware.decryption(req, function (request) { 
        var rules = { 
            vendor_id: 'required'
        }
        const messages = { 
            'required': req.language.required
        }

        if(middleware.checkValidationRules(request, res, rules, messages,{})){
            auth_model.offerList(request, function (responsecode, responsemsg, responsedata) { 
                middleware.sendresponse(req, res, 200, responsecode, responsemsg, responsedata)
            })
        }
    })
})

router.post('/offerdelete', function (req, res) { 
    middleware.decryption(req, function (request) { 
        var rules = { 
            id: 'required'
        }
        const messages = { 
            'required': req.language.required
        }

        if(middleware.checkValidationRules(request, res, rules, messages,{})){
            auth_model.offerDelete(request, function (responsecode, responsemsg, responsedata) { 
                middleware.sendresponse(req, res, 200, responsecode, responsemsg, responsedata)
            })
        }
    })
})

router.post('/getaboutus', function (req, res) { 
    middleware.decryption(req, function (request) { 
        var rules = { }
        if(middleware.checkValidationRules(request, res, rules, {})) { 
            auth_model.getAboutUs(request, function (responsecode, responsemsg, responsedata) { 
                middleware.sendresponse(req, res, 200, responsecode, responsemsg, responsedata)
            })
         }
    })
})


router.post('/getpolicy', function (req, res) { 
    middleware.decryption(req, function (request) { 
        var rules = {}
        if(middleware.checkValidationRules(request, res, rules, {})){
            auth_model.getPolicy(request, function (responsecode, responsemsg, responsedata) { 
                middleware.sendresponse(req, res, 200, responsecode, responsemsg, responsedata)
             })
        }
     })
})
router.post('/getterms', function (req, res) { 
    middleware.decryption(req, function (request) { 
        var rules = {}
        if(middleware.checkValidationRules(request, res, rules, {})){
            auth_model.getTerms(request, function (responsecode, responsemsg, responsedata) { 
                middleware.sendresponse(req, res, 200, responsecode, responsemsg, responsedata)
             })
        }
     })
})

router.post('/faqslist', function (req,res) { 
    middleware.decryption(req, function (request) { 
        var rules = {
            id: ''
        }
        if(middleware.checkValidationRules(request, res, rules,{})){
            auth_model.faqsList(request, function (responsecode, responsemsg, responsedata) { 
                middleware.sendresponse(req, res, 200, responsecode, responsemsg, responsedata)
            })
        }
    })
})

router.post('/getstorevendor', function (req, res) { 
    middleware.decryption(req, function (request) { 
        var rules = {  }
        const messages = {  }

        if(middleware.checkValidationRules(request, res, rules, messages,{})){
            auth_model.getStorecatevendor(request, function (responsecode, responsemsg, responsedata) { 
                middleware.sendresponse(req, res, 200, responsecode, responsemsg, responsedata)
            })
        }
    })
})

router.post('/regisrervendor', function (req, res) { 
    middleware.decryption(req, function (request) { 
        var rules = { 
            name: 'required',
            email:'required',
            phone:'',
            password:'required',
            store_name:'required',
            address:'required',
            category_id:'required',
        }
        const messages = { 
            'required': req.language.required
        }

        if(middleware.checkValidationRules(request, res, rules, messages,{})){
            auth_model.createVendor(request, function (responsecode, responsemsg, responsedata) { 
                middleware.sendresponse(req, res, 200, responsecode, responsemsg, responsedata)
            })
        }
    })
})


router.post('/getsublist', function (req, res) { 
    middleware.decryption(req, function (request) { 
        var rules = {  }
        const messages = {  }

        if(middleware.checkValidationRules(request, res, rules, messages,{})){
            auth_model.getSubList(request, function (responsecode, responsemsg, responsedata) { 
                middleware.sendresponse(req, res, 200, responsecode, responsemsg, responsedata)
            })
        }
    })
})


router.post('/orderidstore', function (req, res) { 
    middleware.decryption(req, function (request) { 
        var rules = { 
            id:'required',
            order_id:'required'
         }
        const messages = { 
            'required': req.language.required
         }

        if(middleware.checkValidationRules(request, res, rules, messages,{})){
            auth_model.orderIdStore(request, function (responsecode, responsemsg, responsedata) { 
                middleware.sendresponse(req, res, 200, responsecode, responsemsg, responsedata)
            })
        }
    })
})

router.post('/notification', function (req, res) { 
    middleware.decryption(req, function (request) { 
        var rules = { 
            id:'required',
         }
        const messages = { 
            'required': req.language.required
         }

        if(middleware.checkValidationRules(request, res, rules, messages,{})){
            auth_model.notificationVendor(request, function (responsecode, responsemsg, responsedata) { 
                middleware.sendresponse(req, res, 200, responsecode, responsemsg, responsedata)
            })
        }
    })
})

router.post('/getprodcatelist', function (req, res) { 
    middleware.decryption(req, function (request) { 
        var rules = {}
        const messages = { 
            'required': req.language.required
         }

        if(middleware.checkValidationRules(request, res, rules, messages,{})){
            auth_model.getProdCateList(request, function (responsecode, responsemsg, responsedata) { 
                middleware.sendresponse(req, res, 200, responsecode, responsemsg, responsedata)
            })
        }
    })
})

router.post('/setdefaultprod', function (req, res) { 
    middleware.decryption(req, function (request) { 
        var rules = {
            id:'required'
        }
        const messages = { 
            'required': req.language.required
         }

        if(middleware.checkValidationRules(request, res, rules, messages,{})){
            auth_model.setDefaultProd(request, function (responsecode, responsemsg, responsedata) { 
                middleware.sendresponse(req, res, 200, responsecode, responsemsg, responsedata)
            })
        }
    })
})

router.post('/offerupdate', function (req, res) { 
    middleware.decryption(req, function (request) { 
        var rules = {
            id:'required',
            min_range:'required',
            max_range: 'required',
            start_day:'required',
            end_day:'required'
        }
        const messages = { 
            'required': req.language.required
         }

        if(middleware.checkValidationRules(request, res, rules, messages,{})){
            auth_model.offerUpdate(request, function (responsecode, responsemsg, responsedata) { 
                middleware.sendresponse(req, res, 200, responsecode, responsemsg, responsedata)
            })
        }
    })
})

router.post('/creatoffer', function (req, res) { 
    middleware.decryption(req, function (request) { 
        var rules = {
            vendor_id:'required',
            product_id:'required',
            image:'required',
            min_range:'required',
            max_range: 'required',
            start_day:'required',
            end_day:'required'
        }
        const messages = { 
            'required': req.language.required
         }

        if(middleware.checkValidationRules(request, res, rules, messages,{})){
            auth_model.offerCreate(request, function (responsecode, responsemsg, responsedata) { 
                middleware.sendresponse(req, res, 200, responsecode, responsemsg, responsedata)
            })
        }
    })
})

router.post('/createcontact', function (req, res) { 
    middleware.decryption(req, function (request) { 
        var rules = {
            full_name:'required',
            email: 'required',
            subject: 'required',
            description: 'required'
        }
        const messages = { 
            'required': req.language.required
         }

        if(middleware.checkValidationRules(request, res, rules, messages,{})){
            auth_model.createContact(request, function (responsecode, responsemsg, responsedata) { 
                middleware.sendresponse(req, res, 200, responsecode, responsemsg, responsedata)
            })
        }
    })
})

router.post('/resetpassmail', function (req, res) { 
    middleware.decryption(req, function (request) { 
        var rules = {
            email: 'required'
        }
        const messages = { 
            'required': req.language.required
         }

        if(middleware.checkValidationRules(request, res, rules, messages,{})){
            auth_model.resetPassEmail(request, function (responsecode, responsemsg, responsedata) { 
                middleware.sendresponse(req, res, 200, responsecode, responsemsg, responsedata)
            })
        }
    })
})

router.post('/resetpassword', function (req, res) { 
    middleware.decryption(req, function (request) { 
        var rules = {
            forgot_token: 'required',
            password:'required'
        }
        const messages = { 
            'required': req.language.required
         }

        if(middleware.checkValidationRules(request, res, rules, messages,{})){
            auth_model.resetPassword(request, function (responsecode, responsemsg, responsedata) { 
                middleware.sendresponse(req, res, 200, responsecode, responsemsg, responsedata)
            })
        }
    })
})

router.post('/createproduct', function (req, res) { 
    middleware.decryption(req, function (request) { 
        var rules = {
            vendor_id:'required',
            product_category_id:'required',
            product_name:'required',
            price:'required',
            qty:'required',
            unit:'required',
            discount_value:'required',
            supplier:'required',
            details:'required',
            extra_details:'required'
        }
        const messages = { 
            'required': req.language.required
        }

        if(middleware.checkValidationRules(request, res, rules, messages,{})){
            auth_model.createProduct(request, function (responsecode, responsemsg, responsedata) { 
                middleware.sendresponse(req, res, 200, responsecode, responsemsg, responsedata)
            })
        }
    })
})

router.post('/editproduct', function (req, res) { 
    middleware.decryption(req, function (request) { 
        var rules = {
            id: 'required'
        }
        const messages = { 
            'required': req.language.required
        }

        if(middleware.checkValidationRules(request, res, rules, messages,{})){
            auth_model.editProduct(request, function (responsecode, responsemsg, responsedata) { 
                middleware.sendresponse(req, res, 200, responsecode, responsemsg, responsedata)
            })
        }
    })
})

router.post('/getproductdetail', function (req, res) { 
    middleware.decryption(req, function (request) { 
        var rules = {
            id: 'required'
        }
        const messages = { 
            'required': req.language.required
        }

        if(middleware.checkValidationRules(request, res, rules, messages,{})){
            auth_model.getProductDetails(request, function (responsecode, responsemsg, responsedata) { 
                middleware.sendresponse(req, res, 200, responsecode, responsemsg, responsedata)
            })
        }
    })
})

module.exports = router;

