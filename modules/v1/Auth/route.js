var express = require('express')
var middleware = require('../../../middleware/headerValidator');
var GLOBALS = require('../../../config/constants');
var common = require('../../../config/common');
var auth_model = require('./auth_model');
var asyncLoop = require('node-async-loop');
var router = express.Router();
var emailTemplate = require('../../../config/template');
const messages = require('../../../languages/en');


router.post('/adminlogin', function (req,res) { 
    console.log("🚀 ~ req:", req)
    middleware.decryption(req, function (request) { 
        var rules = { 
            email: 'required',
            password: 'required',
        }
        const messages = { 
            'required': req.language.required
        }

        if(middleware.checkValidationRules(request, res, rules, messages,{})){
            auth_model.adminLogin(request,function (responsecode, responsemsg, responsedata) { 
                middleware.sendresponse(req, res, 200, responsecode, responsemsg, responsedata)
            })
        }
     })
})

router.post('/adminlogout', function (req,res) { 
    middleware.decryption(req, function (request) { 
        var rules = {}
        const messages = {}
        
        if(middleware.checkValidationRules(request, res, rules, messages,{})){
            request.user_id = req.user_id
            auth_model.adminLogout(request, function (responsecode, responsemsg, responsedata) { 
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

router.post('/addfaqs',function (req,res) { 
    middleware.decryption(req,function(request){
        var rules = {
            question:'required',
            answer:'required',
        }
        const messages ={
            'required': req.language.required
        }
        if(middleware.checkValidationRules(request, res, rules, messages,{})){
            auth_model.addFaqs(request, function (responsecode, responsemsg, responsedata) { 
                middleware.sendresponse(req, res, 200,responsecode, responsemsg, responsedata)
            })
        }
    })
})

router.post('/editfaqs',function (req,res) { 
    middleware.decryption(req,function(request){
        var rules = {
            id:'required',
            question:'',
            answer:'',
        }
        const messages ={
            'required': req.language.required
        }
        if(middleware.checkValidationRules(request, res, rules, messages,{})){
            auth_model.editFaqs(request, function (responsecode, responsemsg, responsedata) { 
                middleware.sendresponse(req, res, 200,responsecode, responsemsg, responsedata)
            })
        }
    })
})

router.post('/deletefaqs', function (req, res) { 
    middleware.decryption(req, function (request) { 
        var rules = { 
            id: 'required'
        }
        const messages = { 
            'required': req.language.required
        }
        if(middleware.checkValidationRules(request, res, rules, messages,{})){
            auth_model.deleteFaqs(request, function (responsecode, responsemsg, responsedata) { 
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

router.post('/updateabout',function (req,res) { 
    middleware.decryption(req, function (request) { 
        var rules = {
            content: 'required',
        }
        const messages = {
            'required': req.language.required
        }
        if(middleware.checkValidationRules(request, res, rules, messages,{})){
            auth_model.updateAboutUs(request, function (responsecode, responsemsg, responsedata) { 
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

router.post('/updatepolicy',function (req, res) { 
    middleware.decryption(req, function (request) { 
        var rules ={
            content : 'required',
        }
        const messages = {
            'required': req.language.required
        }
        if(middleware.checkValidationRules(request, res, rules, messages,{})){
            auth_model.updatePolicy(request, function (responsecode, responsemsg, responsedata) { 
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

router.post('/updateterms',function (req, res) { 
    middleware.decryption(req, function (request) { 
        var rules ={
            content : 'required',
        }
        const messages = {
            'required': req.language.required
        }
        if(middleware.checkValidationRules(request, res, rules, messages,{})){
            auth_model.updateTerms(request, function (responsecode, responsemsg, responsedata) { 
                middleware.sendresponse(req, res, 200, responsecode, responsemsg, responsedata)
             })
        }
     })
})

router.post('/contactlist', function (req, res) { 
    middleware.decryption(req, function (request) { 
        var rules = { 
            id:''
        }

        if(middleware.checkValidationRules(request, res, rules, {})){
            auth_model.contactList(request, function (responsecode, responsemsg, responsedata) { 
                middleware.sendresponse(req, res, 200, responsecode, responsemsg, responsedata)
            })
        }
    })
})

router.post('/replycontact', function (req, res) { 
    middleware.decryption(req, function (request) { 
        var rules = {
            id: 'required',
            sendermail: 'required',
            subject: 'required',
            messages: 'required',
        }
        const messages = {
            'required': req.language.required
        }
        if(middleware.checkValidationRules(request, res, rules, messages, {})){
            auth_model.sendReplayMail(request, function (responsecode, responsemsg, responsedata) { 
                middleware.sendresponse(req, res, 200, responsecode, responsemsg, responsedata)
            })
        }
    })
})

router.post('/dashboard', function (req, res) { 
    middleware.decryption(req, function (request) { 

        if(middleware.checkValidationRules(request, res,{})){
            auth_model.dashBoard(request, function (responsecode, responsemsg, responsedata) { 
                middleware.sendresponse(req, res, 200, responsecode, responsemsg, responsedata)
            })
        }
    })
})

router.post('/managecustomer', function (req, res) { 
    middleware.decryption(req, function (request) { 
        var rules = { 
            id:''
        }
        const messages = { 
            'required': req.language.required
        }

        if(middleware.checkValidationRules(request, res, rules, messages,{})){
            auth_model.manageCustomer(request, function (responsecode, responsemsg, responsedata) { 
                middleware.sendresponse(req, res, 200, responsecode, responsemsg, responsedata)
            })
        }
    })
})

router.post('/customerstatus', function (req, res) { 
    middleware.decryption(req, function (request) { 
        var rules = { 
            id: 'required'
        }
        const messages = { 
            'required': req.language.required
        }

        if(middleware.checkValidationRules(request, res, rules, messages,{})){
            auth_model.customerStatus(request, function (responsecode, responsemsg, responsedata) { 
                middleware.sendresponse(req, res, 200, responsecode, responsemsg, responsedata)
            })
        }
    })
})

router.post('/customerdelete', function (req, res) { 
    middleware.decryption(req, function (request) { 
        var rules = { 
            id: 'required'
        }
        const messages = { 
            'required': req.language.required
        }

        if(middleware.checkValidationRules(request, res, rules, messages,{})){
            auth_model.customerDelete(request, function (responsecode, responsemsg, responsedata) { 
                middleware.sendresponse(req, res, 200, responsecode, responsemsg, responsedata)
            })
        }
    })
})

router.post('/customerupdate', function (req, res) { 
    middleware.decryption(req, function (request) { 
        var rules = { 
            id: 'required',
            fname: 'required',
            lname: 'required',
            address: 'required'
        }
        const messages = { 
            'required': req.language.required
        }

        if(middleware.checkValidationRules(request, res, rules, messages,{})){
            auth_model.customerUpdate(request, function (responsecode, responsemsg, responsedata) { 
                middleware.sendresponse(req, res, 200, responsecode, responsemsg, responsedata)
            })
        }
    })
})


router.post('/createvendor', function (req, res) { 
    middleware.decryption(req, function (request) { 
        var rules = { 
            name: 'required',
            email:'required',
            phone:'',
            store_name:'required',
            address:'required',
            lat: 'required',
            longa: 'required',
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

router.post('/vendordetails', function (req, res) { 
    middleware.decryption(req, function (request) { 
        var rules = {
            id: 'required'
        }
        const messages = {
            'required': req.language.required
        }

        if(middleware.checkValidationRules(request, res, rules, messages,{})){
            auth_model.vendorDetails(request, function (responsecode, responsemsg, responsedata) { 
                middleware.sendresponse(req, res, 200, responsecode, responsemsg, responsedata)
            })
        }
    })
})




router.post('/vendorrequestlist', function (req, res) { 
    middleware.decryption(req, function (request) { 
        var rules = {
            id:''
        }
        const messages = {
            'required': req.language.required
        }

        if(middleware.checkValidationRules(request, res, rules, messages,{})){
            auth_model.vendorRequestList(request, function (responsecode, responsemsg, responsedata) { 
                middleware.sendresponse(req, res, 200, responsecode, responsemsg, responsedata)
            })
        }
    })
})

router.post('/vendorreqaccept', function (req, res) { 
    middleware.decryption(req, function (request) { 
        var rules = { 
            id: 'required'
        }
        const messages = { 
            'required': req.language.required
        }

        if(middleware.checkValidationRules(request, res, rules, messages,{})){
            auth_model.vendorReqAccept(request, function (responsecode, responsemsg, responsedata) { 
                middleware.sendresponse(req, res, 200, responsecode, responsemsg, responsedata)
            })
        }
    })
})

router.post('/vendorreqreject', function (req, res) { 
    middleware.decryption(req, function (request) { 
        var rules = { 
            id: 'required'
        }
        const messages = { 
            'required': req.language.required
        }

        if(middleware.checkValidationRules(request, res, rules, messages,{})){
            auth_model.vendorReqReject(request, function (responsecode, responsemsg, responsedata) { 
                middleware.sendresponse(req, res, 200, responsecode, responsemsg, responsedata)
            })
        }
    })
})

router.post('/sendnotification', function (req, res) { 
    middleware.decryption(req, function (request) { 
        var rules = { 
            title: 'required',
            message:'required'
        }
        const messages = { 
            'required': req.language.required
        }

        if(middleware.checkValidationRules(request, res, rules, messages,{})){
            auth_model.sendNotificatio(request, function (responsecode, responsemsg, responsedata) { 
                middleware.sendresponse(req, res, 200, responsecode, responsemsg, responsedata)
            })
        }
    })
})



router.post('/customergraph', function (req, res) { 
    middleware.decryption(req, function (request) { 
        var rules = {
            
        }
        const messages = { 
            'required': req.language.required
        }

        if(middleware.checkValidationRules(request, res, rules, messages,{})){
            auth_model.customerGraph(request, function (responsecode, responsemsg, responsedata) { 
                middleware.sendresponse(req, res, 200, responsecode, responsemsg, responsedata)
            })
        }
    })
})

router.post('/flyperreport', function (req, res) { 
    middleware.decryption(req, function (request) { 
        var rules = {
            start_date:'required',
end_date:'required',
        }
        const messages = { 
            'required': req.language.required
        }

        if(middleware.checkValidationRules(request, res, rules, messages,{})){
            auth_model.flyerReports(request, function (responsecode, responsemsg, responsedata) { 
                middleware.sendresponse(req, res, 200, responsecode, responsemsg, responsedata)
            })
        }
    })
})
router.post('/vendorreport', function (req, res) { 
    middleware.decryption(req, function (request) { 
        var rules = {
id: 'required',
            start_date:'required',
end_date:'required',
        }
        const messages = { 
            'required': req.language.required
        }

        if(middleware.checkValidationRules(request, res, rules, messages,{})){
            auth_model.vendorReports(request, function (responsecode, responsemsg, responsedata) { 
                middleware.sendresponse(req, res, 200, responsecode, responsemsg, responsedata)
            })
        }
    })
})

router.post('/monthordersale', function (req, res) { 
    middleware.decryption(req, function (request) { 
        var rules = {
          
        }
        const messages = { 
            'required': req.language.required
        }

        if(middleware.checkValidationRules(request, res, rules, messages,{})){
            auth_model.monthOrderSale(request, function (responsecode, responsemsg, responsedata) { 
                middleware.sendresponse(req, res, 200, responsecode, responsemsg, responsedata)
            })
        }
    })
})

router.post('/dateordersale', function (req, res) { 
    middleware.decryption(req, function (request) { 
        var rules = {
           
        }
        const messages = { 
            'required': req.language.required
        }

        if(middleware.checkValidationRules(request, res, rules, messages,{})){
            auth_model.dateOrderSale(request, function (responsecode, responsemsg, responsedata) { 
                middleware.sendresponse(req, res, 200, responsecode, responsemsg, responsedata)
            })
        }
    })
})

router.post('/changepassword', function (req, res) { 
    middleware.decryption(req, function (request) { 
    var rules = { 
    	    email: 'required',
            opassword:'required',
            npassword:'required'
        }
        const messages = {
            'required': req.language.required
        }

        if(middleware.checkValidationRules(request, res,rules, messages,{})){
            auth_model.changePassword(request, function (responsecode, responsemsg, responsedata) { 
                middleware.sendresponse(req, res, 200, responsecode, responsemsg, responsedata)
            })
        }
    })
})

router.post('/categorylist', function (req, res) { 
    middleware.decryption(req, function (request) { 
    var rules = { 
    	    id: '',
        }
        const messages = {
            'required': req.language.required
        }

        if(middleware.checkValidationRules(request, res,rules, messages,{})){
            auth_model.getCategoryList(request, function (responsecode, responsemsg, responsedata) { 
                middleware.sendresponse(req, res, 200, responsecode, responsemsg, responsedata)
            })
        }
    })
})

router.post('/createcategory', function (req, res) { 
    middleware.decryption(req, function (request) { 
    var rules = { 
    	    name: 'required',
        }
        const messages = {
            'required': req.language.required
        }

        if(middleware.checkValidationRules(request, res,rules, messages,{})){
            auth_model.createCategory(request, function (responsecode, responsemsg, responsedata) { 
                middleware.sendresponse(req, res, 200, responsecode, responsemsg, responsedata)
            })
        }
    })
})

router.post('/editcategory', function (req, res) { 
    middleware.decryption(req, function (request) { 
    var rules = { 
            id: 'required',
    	    name: 'required',
        }
        const messages = {
            'required': req.language.required
        }
        if(middleware.checkValidationRules(request, res,rules, messages,{})){
            auth_model.editCategory(request, function (responsecode, responsemsg, responsedata) { 
                middleware.sendresponse(req, res, 200, responsecode, responsemsg, responsedata)
            })
        }
    })
})

router.post('/deletecategory', function (req, res) { 
    middleware.decryption(req, function (request) { 
    var rules = { 
            id: 'required',
        }
        const messages = {
            'required': req.language.required
        }
        if(middleware.checkValidationRules(request, res,rules, messages,{})){
            auth_model.deleteCategory(request, function (responsecode, responsemsg, responsedata) { 
                middleware.sendresponse(req, res, 200, responsecode, responsemsg, responsedata)
            })
        }
    })
})

router.post('/productlist', function (req, res) { 
    middleware.decryption(req, function (request) { 
    var rules = { 
    	    id: '',
        }
        const messages = {
            'required': req.language.required
        }

        if(middleware.checkValidationRules(request, res,rules, messages,{})){
            auth_model.getProductList(request, function (responsecode, responsemsg, responsedata) { 
                middleware.sendresponse(req, res, 200, responsecode, responsemsg, responsedata)
            })
        }
    })
})

router.post('/createproduct', function (req, res) { 
    middleware.decryption(req, function (request) { 
    var rules = { 
    	    category_id:'required',
    	    name:'required',
    	    price:'required',
    	    qty:'required',
    	    details:'required',
    	    image:'required',
        }
        const messages = {
            'required': req.language.required
        }

        if(middleware.checkValidationRules(request, res,rules, messages,{})){
            auth_model.createProduct(request, function (responsecode, responsemsg, responsedata) { 
                middleware.sendresponse(req, res, 200, responsecode, responsemsg, responsedata)
            })
        }
    })
})

router.post('/editproduct', function (req, res) { 
    middleware.decryption(req, function (request) { 
    var rules = { 
            id: 'required',
    	    name:'required',
    	    price:'required',
    	    qty:'required',
    	    details:'required',
        }
        const messages = {
            'required': req.language.required
        }

        if(middleware.checkValidationRules(request, res,rules, messages,{})){
            auth_model.editProduct(request, function (responsecode, responsemsg, responsedata) { 
                middleware.sendresponse(req, res, 200, responsecode, responsemsg, responsedata)
            })
        }
    })
})

router.post('/deleteproduct', function (req, res) { 
    middleware.decryption(req, function (request) { 
    var rules = { 
            id: 'required'
        }
        const messages = {
            'required': req.language.required
        }

        if(middleware.checkValidationRules(request, res,rules, messages,{})){
            auth_model.deleteProduct(request, function (responsecode, responsemsg, responsedata) { 
                middleware.sendresponse(req, res, 200, responsecode, responsemsg, responsedata)
            })
        }
    })
})

router.post('/issellableornot', function (req, res) { 
    middleware.decryption(req, function (request) { 
    var rules = { 
            id: 'required'
        }
        const messages = {
            'required': req.language.required
        }

        if(middleware.checkValidationRules(request, res,rules, messages,{})){
            auth_model.isSellOutStock(request, function (responsecode, responsemsg, responsedata) { 
                middleware.sendresponse(req, res, 200, responsecode, responsemsg, responsedata)
            })
        }
    })
})

router.post('/createuser', function (req, res) { 
    middleware.decryption(req, function (request) { 
    var rules = { 
            fname: 'required',
            lname: 'required',
            email: 'required',
            phone: 'required',
            address: 'required',
        }
        const messages = {
            'required': req.language.required
        }

        if(middleware.checkValidationRules(request, res,rules, messages,{})){
            auth_model.userCreate(request, function (responsecode, responsemsg, responsedata) { 
                middleware.sendresponse(req, res, 200, responsecode, responsemsg, responsedata)
            })
        }
    })
})

router.post('/accepptrejectorder', function (req, res) { 
    middleware.decryption(req, function (request) { 
    var rules = { 
            id:''
        }
        const messages = {
            'required': req.language.required
        }

        if(middleware.checkValidationRules(request, res,rules, messages,{})){
            auth_model.acceptRejectOrder(request, function (responsecode, responsemsg, responsedata) { 
                middleware.sendresponse(req, res, 200, responsecode, responsemsg, responsedata)
            })
        }
    })
})

router.post('/orderitemdata', function (req, res) { 
    middleware.decryption(req, function (request) { 
    var rules = { 
            id:'required'
        }
        const messages = {
            'required': req.language.required
        }

        if(middleware.checkValidationRules(request, res,rules, messages,{})){
            auth_model.orderItemData(request, function (responsecode, responsemsg, responsedata) { 
                middleware.sendresponse(req, res, 200, responsecode, responsemsg, responsedata)
            })
        }
    })
})

router.post('/accpetrejectorder', function (req, res) { 
    middleware.decryption(req, function (request) { 
    var rules = { 
            id:'required'
        }
        const messages = {
            'required': req.language.required
        }

        if(middleware.checkValidationRules(request, res,rules, messages,{})){
            auth_model.accpetRejectOrder(request, function (responsecode, responsemsg, responsedata) { 
                middleware.sendresponse(req, res, 200, responsecode, responsemsg, responsedata)
            })
        }
    })
})

router.post('/manageorder', function (req, res) { 
    middleware.decryption(req, function (request) { 
    var rules = { 
            tag:'required'
        }
        const messages = {
            'required': req.language.required
        }

        if(middleware.checkValidationRules(request, res,rules, messages,{})){
            auth_model.manageOrder(request, function (responsecode, responsemsg, responsedata) { 
                middleware.sendresponse(req, res, 200, responsecode, responsemsg, responsedata)
            })
        }
    })
})


router.post('/manageproduct', function (req, res) { 
    console.log('...............hi');
    middleware.decryption(req, function (request) { 
    var rules = { 
            tag:'required'
        }
        console.log("🚀 ~ rules:", rules)
        const messages = {
            'required': req.language.required
        }

        if(middleware.checkValidationRules(request, res,rules, messages,{})){
            auth_model.manageProduct(request, function (responsecode, responsemsg, responsedata) { 
                middleware.sendresponse(req, res, 200, responsecode, responsemsg, responsedata)
            })
        }
    })
})

router.post('/manageorderforinvoice', function (req, res) { 
    middleware.decryption(req, function (request) { 
    var rules = { 
            id:'required'
        }
        const messages = {
            'required': req.language.required
        }

        if(middleware.checkValidationRules(request, res,rules, messages,{})){
            auth_model.manageOrderDataInvoice(request, function (responsecode, responsemsg, responsedata) { 
                middleware.sendresponse(req, res, 200, responsecode, responsemsg, responsedata)
            })
        }
    })
})

router.post('/manageorderstatus', function (req, res) { 
    middleware.decryption(req, function (request) { 
    var rules = { 
            id:'required'
        }
        const messages = {
            'required': req.language.required
        }

        if(middleware.checkValidationRules(request, res,rules, messages,{})){
            auth_model.manageOrderStatus(request, function (responsecode, responsemsg, responsedata) { 
                middleware.sendresponse(req, res, 200, responsecode, responsemsg, responsedata)
            })
        }
    })
})

router.post('/manageorderdeliver', function (req, res) { 
    middleware.decryption(req, function (request) { 
    var rules = { 
            id:'required'
        }
        const messages = {
            'required': req.language.required
        }

        if(middleware.checkValidationRules(request, res,rules, messages,{})){
            auth_model.manageOrderDeliver(request, function (responsecode, responsemsg, responsedata) { 
                middleware.sendresponse(req, res, 200, responsecode, responsemsg, responsedata)
            })
        }
    })
})

module.exports = router;


