let Globals = {
    'APP_NAME'              : 'Ballina Farm Fresh',
    'API_KEY'               : process.env.API_KEY,
    'LOGO'                  : '/u47tcb4q34888c984bcq9.png',
    'ARROW_IMAGE'           : 'api/images/arrow-right.gif',
    'BASE_URL'              : process.env.BASE_URL,
    'BASE_URL_WITHOUT_API'  : process.env.BASE_URL_WITHOUT_API,
    'PORT_BASE_URL'         : process.env.PORT_BASE_URL,
    'S3_BUCKET_ROOT'        : process.env.S3_BUCKET_ROOT,
    'KEY'                   : process.env.KEY,
    'IV'                    : process.env.IV,
    'EMAIL_ID'              : process.env.EMAIL_ID,
    'EMAIL_PASSWORD'        : process.env.EMAIL_PASSWORD,
    'API_PASSWORD'          : process.env.API_PASSWORD,
    'USER_IMAGE'            : '/',
    'PER_PAGE'              : '10',
    'PUSH_KEY'              : process.env.GCM_PUSH_KEY,
    'P8_CERTIFICATE_NAME'   : '../pem/AuthKey_57W6KD26X4.p8',
    'KEY_ID'                : process.env.KEY_ID,
    'TEAM_ID'               : process.env.TEAM_ID,
    'BUNDLE'                : process.env.BUNDLE_ID,
    'IOS_BUNDLE_ID'         : process.env.IOS_BUNDLE_ID,
    'USER_IMAGE'            : 'https://ballians3.s3.amazonaws.com/profileimage/',
    'PRODUCT_IMAGE'         : 'https://ballians3.s3.amazonaws.com/product/',
    'CATEGORY'              : 'https://ballians3.s3.amazonaws.com/category/',

    'OFFER_IMAGE'           : 'https://livecart.s3.amazonaws.com/offer_image/',
    'BANNER_IMAGE'          : 'https://livecart.s3.amazonaws.com/banner/'
}
module.exports = Globals;
