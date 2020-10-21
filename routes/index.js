const express = require('express');
const router = express.Router();
const controlador = require("../controllers/controller");
const title = "Demo Products";

// router.get('/', function(req, res, next) {
//   res.render('product-list', { title: title });
// });
router.get('/products', function(req, res, next) {
  res.render('products', { title: title });
});
router.get('/', controlador.productList);
router.post('/product/save', controlador.productSave);
router.post('/product/upload', controlador.productUpload);


router.post('/product/uploadxx', function(req, res) {
  console.log(req.body);
  console.log(req.body);
  let form = new formidable.IncomingForm();
  form.parse(req, function(err, fields, files) {
      var old_path = files.avatar.path,
        file_size = files.avatar.size,
        file_ext = files.avatar.name.split('.').pop(),
        index = old_path.lastIndexOf('/') + 1,
        file_name = old_path.substr(index),
        new_path = pathImg + file_name + '.' + file_ext;

        fs.readFile(old_path, function(err, data) {
            fs.writeFile(new_path, data, function(err) {
                fs.unlink(old_path, function(err) {
                    if (err) {
                        res.status(500);
                        res.json({'success': false});
                    } else {
                        res.status(200);
                        res.json({'success': true});
                    }
                });
            });
        });
  });
});

module.exports = router;
