const router = require('express').Router()
const importExportController = require('./importExport.controllers')

router.post('/Dintair/restricted/search', importExportController.productListIndex)

router.get('/Dintair/product/:id', importExportController.productListId)

router.get('/Dintair/imports/addProduct', isLoggedIn, importExportController.productForm)

router.post('/Dintair/add/restricted', isLoggedIn, importExportController.productFormPost)

router.get('/Dintair/myrecords', isLoggedIn, importExportController.restrictedProductsList)

router.post('/Dintair/aeropost/search/users', isLoggedIn, importExportController.searchRestrictedProduct)

router.get('/Dintair/restricted/:id', isLoggedIn, importExportController.viewRestrictedProduct)

router.post('/Dintair/restricted/put/:id', isLoggedIn, importExportController.editRestrictedProductPut)

router.get('/Osoma/midocumento/:id', isLoggedIn, importExportController.viewDocument)

router.get('/Osoma/misregistros', isLoggedIn, importExportController.restrictedProducts)

function isLoggedIn(req,res,next){
    if (req.isAuthenticated()){
      return next()
    } 
    return res.redirect('/Dintair/es/Signin')
}

module.exports = router;