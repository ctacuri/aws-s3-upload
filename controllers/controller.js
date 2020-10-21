const pool = require('../connection/connMySQL-Promise');
const path = require('path');
const fs = require('fs');
const pathImg = path.join(__dirname, '../public/images/');
const formidable = require('formidable');
const AWS = require('aws-sdk');
AWS.config.update({
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_KEY,
    region: process.env.AWS_REGION
});
const myBucket = process.env.AWS_S3_BUKET;
//const s3 = new AWS.S3();
//var myKey = 'file.json';

// s3.createBucket({ Bucket: myBucket }, function (err, data) {
//     if (err) {
//       console.log(err);
//       //res.render('index', { title: 'Error' });
//       return 0;
//     }

//     let params = {
//       Bucket: myBucket,
//       Key: myKey,
//       ACL: 'public-read',
//       ContentType: 'application/json',
//       Body: '{data: "Hello", process: 300}',
//     };

//     s3.putObject(params, function (err, data) {
//       if (err) {
//         console.log(err);
//         //res.render('index', { title: 'Error' });
//         return 0;
//       }

//       const textResponse = 'Successfully uploaded data to ' + myBucket + '/' + myKey;
//       console.log(textResponse);
//       //res.render('index', { title: textResponse });
//     });

//   });

let controller = function() {};

controller.productList = async (req, res) => {
    try {
        let qrySQL01 = "CALL sp_listProduct()";
        console.log(qrySQL01);
        const resultQuery = await pool.query(qrySQL01);
        res.render('product-list', { title: 'Demo Products', registros: resultQuery[0] });
        //resSucess(res, resultQuery);
    } catch(err) {
        resError(res, err);
    }
}

controller.productSave = async (req, res) => {
    //console.log(req.body);
    let param = {
        name: req.body.name,
        price: req.body.price,
        description: req.body.description
    };
    try {
        let qrySQL01 = "CALL sp_saveProduct(";
        qrySQL01 += "'" +param.name + "',";
        qrySQL01 += param.price + ",";
        qrySQL01 += "'" + param.description + "');";
        console.log(qrySQL01);
        const resultQuery = await pool.query(qrySQL01);
        resSucess(res, resultQuery);
    } catch(err) {
        resError(res, err);
    }
}

controller.productUpload = async (req, res) => {
    let form = new formidable.IncomingForm();
    form.parse(req, function(err, fields, files) {
        // console.log(fields);
        console.log(files.avatar.name);
        //return false;
        let old_path = files.avatar.path,
          file_size = files.avatar.size,
          file_ext = files.avatar.name.split('.').pop(),
          index = old_path.lastIndexOf('/') + 1,
          file_name = old_path.substr(index),
          new_path = pathImg + file_name + '.' + file_ext,
          //new_path_db = '../images/' + file_name + '.' + file_ext;
          new_path_db = 'https://'+myBucket+'.s3.us-east-2.amazonaws.com/' + file_name + '.' + file_ext;
          
            fs.readFile(old_path, function (err, data) {
                if (err) throw err; // Something went wrong!
                let s3bucket = new AWS.S3({params: {Bucket: myBucket, ACL: 'public-read'}});
                //console.log(s3bucket);
                s3bucket.createBucket(function () {
                    var params = {
                        //Key: files.avatar.name,
                        Key: file_name + '.' + file_ext,
                        Body: data
                    };
                    s3bucket.upload(params, async function (err, data) {
                        fs.unlink(old_path, function (err) {
                            if (err) {
                                console.error(err);
                            }
                            console.log('Temp File Delete');
                        });
                        //console.log("PRINT FILE:", file);
                        if (err) {
                            console.log('ERROR MSG: ', err);
                            //res.status(500).send(err);
                            resError(res, err);
                        } else {
                            //console.log('Successfully uploaded data');
                            let qrySQL02 = "CALL sp_updPathImg(";
                            qrySQL02 += "'" + fields.idproduct + "',";
                            qrySQL02 += "'" + new_path_db + "');";
                            console.log(qrySQL02);
                            const resultQuery2 = await pool.query(qrySQL02);
                            resSucessQry(res);
                            //res.status(200).end();
                        }
                    });
                });
            });


        //   fs.readFile(old_path, function(err, data) {
        //       fs.writeFile(new_path, data, function(err) {
        //           fs.unlink(old_path, async function(err) {
        //               if (err) {
        //                 //   res.status(500);
        //                 //   res.json({'success': false});
        //                   resError(res, err);
        //               } else {
        //                 //   res.status(200);
        //                 //   res.json({'success': true});
        //                 let qrySQL02 = "CALL sp_updPathImg(";
        //                 qrySQL02 += "'" + fields.idproduct + "',";
        //                 qrySQL02 += "'" + new_path_db + "');";
        //                 console.log(qrySQL02);
        //                 const resultQuery2 = await pool.query(qrySQL02);
        //                 resSucessQry(res);
        //               }
        //           });
        //       });
        //   });

    });
}


function resSucessQry(res){
    res.status(200).json({"status": "success"});
}
function resSucess(res, rows){
    res.status(200).json({"status": "success", "registros": rows });
}
function resNoData(res){
    res.status(200).json({"status": "noData"});
}
function resError(res, err){
    res.status(200).json({"status": "error", "description": err });
}

module.exports = controller;