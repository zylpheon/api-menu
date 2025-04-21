'use strict';

module.exports = function(app) {
    var jsonku = require('./controller');
    var promoController = require('./controller_promo');
    
    // Menu routes
    app.route('/')
        .get(jsonku.index);
    
    app.route('/tampil')
        .get(jsonku.tampilSemuaMenu);
    
    app.route('/tampil/:id')
        .get(jsonku.tampilMenuId);
    
    app.route('/tambah')
        .post(jsonku.tambahMenu);
    
    app.route('/ubah/:id')
        .put(jsonku.ubahMenu);
    
    app.route('/hapus/:id')
        .delete(jsonku.hapusMenu);
    
    // Promo routes
    app.route('/promo')
        .get(promoController.getPromos)
        .post(promoController.addPromo);
    
    // Note: This route needs to come before '/promo/:id' to avoid conflicts
    app.route('/promo/active')
        .get(promoController.getActivePromos);
    
    app.route('/promo/:id')
        .get(promoController.getPromoById)
        .put(promoController.updatePromo)
        .delete(promoController.deletePromo);
};
