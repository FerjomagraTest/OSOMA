/*const fs = require('fs')

module.exports = function(){
    var _obj = {
        init: function( ) {
            return _obj.load(param)
        },
        _getRandom: function(num) {
            num = (num) ? num : 5;

            var text = "";
            var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

            for (var i = 0; i < num; i++)
                text += possible.charAt(Math.floor(Math.random() * possible.length));

            return text;
        },
        _getFile: function(file){
            var getFile = file.split(';base64,');
            var typeFile = ['image/png', 'image/jpeg', 'image/jpg' , 'image/gif', 'image/bmp', 'image/pdf'];
            var getType = 'tavo';

            for(var i = 0; i < typeFile.length; i++){
                if(getFile[0].indexOf(typeFile[i]) > 0){

                    var temp = typeFile[i].split('/');
                    getType = temp[1];
                }
            }

            return {type: getType, data: getFile[1]};
        }

    }

    return _obj;
};*/


module.exports = function() {

    var _obj = {

        init: function() {
            return _obj;
        },

        _getRandom: function(num) {
            num = num || 5;

            var text = "";
            var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

            for (var i = 0; i < num; i++) {
                text += possible.charAt(
                    Math.floor(Math.random() * possible.length)
                );
            }

            return text;
        },

        _getFile: function(file) {

            if (typeof file !== 'string') {
                throw new Error('El archivo recibido no es válido');
            }

            var match = file.match(/^data:([^;]+);base64,([\s\S]+)$/);

            if (!match) {
                throw new Error('El archivo no tiene un formato Base64 válido');
            }

            var mime = match[1].toLowerCase();
            var data = match[2];

            var extensions = {
                'image/png': 'png',
                'image/jpeg': 'jpg',
                'image/jpg': 'jpg',
                'image/gif': 'gif',
                'image/bmp': 'bmp',
                'image/webp': 'webp',
                'application/pdf': 'pdf',
                'application/zip': 'zip',
                'application/x-zip-compressed': 'zip'
            };

            var extension = extensions[mime];

            if (!extension) {
                throw new Error('Formato no permitido: ' + mime);
            }

            return {
                type: extension,
                mime: mime,
                data: data,
                resource_type: mime.startsWith('image/') ? 'image' : 'raw'
            };
        }
    };

    return _obj;
};










controller.productFormPost = async (req, res) => {

    res.setHeader('Content-Type', 'application/json');

    var meses = [
        'Enero', 'Febrero', 'Marzo', 'Abril',
        'Mayo', 'Junio', 'Julio', 'Agosto',
        'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
    ];

    var fechaactual = new Date();

    var curr_hour = fechaactual.getHours() - 5;
    var am_pm_var = (curr_hour < 12) ? 'AM' : 'PM';

    if (curr_hour <= 0) curr_hour += 12;
    if (curr_hour > 12) curr_hour -= 12;

    var curr_min = fechaactual.getMinutes();

    var nuevafecha = curr_hour + ' : ' + curr_min + ' ' + am_pm_var;

    var horaactual =
        fechaactual.getHours() + ' : ' +
        fechaactual.getMinutes() + ' : ' +
        fechaactual.getSeconds();

    var tiempoact =
        fechaactual.getDate() + ' de ' +
        meses[fechaactual.getMonth()] + ' de ' +
        fechaactual.getFullYear();

    var data_restricted = {
        nombre: req.body.nombre,
        iam: req.body.iam,
        link: req.body.link,
        aeropost_link: req.body.aeropost_link,
        entidad: req.body.entidad,
        documents: req.body.documents,

        tupa_permiso: req.body.tupa_permiso,
        precio_permiso: req.body.precio_permiso,
        url_tramite: req.body.url_tramite,

        subpartida: req.body.subpartida,
        comentario: req.body.comentario,

        fecha: tiempoact,
        horaact: horaactual,
        nuevafecha: nuevafecha,
        creator: req.body.id,

        imgProductos: '/images/img_defectproducts_none-01.jpg',
        deleted: false
    };

    var restricted_product = new Restricted_products(data_restricted);

    try {

        var files = JSON.parse(req.body.files || '[]');

        if (!Array.isArray(files)) {
            throw new Error('La lista de archivos no es válida');
        }

        var newRoutes = [];

        for (var i = 0; i < files.length; i++) {

            if (!files[i]) continue;

            var newFile = UploadTavo()._getFile(files[i]);

            var nameFile =
                UploadTavo()._getRandom(5) + '-' +
                req.body.id + '.' + newFile.type;

            var routeFile = './uploads/' + nameFile; 

            try {

                // Convertir Base64 a Buffer
                var buffer = Buffer.from(newFile.data, 'base64');

                if (!buffer.length) {
                    throw new Error('El archivo está vacío');
                }

                // Guardar temporalmente
                await fs.promises.writeFile(routeFile, buffer);

                // Subir a Cloudinary
                var uploaded = await new Promise(function(resolve, reject) {

                    cloudinary_users.uploader.upload(
                        routeFile,
                        {
                            resource_type: newFile.resource_type,
                            use_filename: true,
                            unique_filename: true
                        },
                        function(error, result) {

                            if (error) {
                                return reject(error);
                            }

                            if (!result || !result.secure_url) {
                                return reject(
                                    new Error('Cloudinary no devolvió una URL')
                                );
                            }

                            resolve(result);
                        }
                    );
                });

                newRoutes.push(uploaded.secure_url);

            } finally {

                // Eliminar archivo temporal
                try {
                    await fs.promises.unlink(routeFile);
                } catch (unlinkError) {
                    console.log('No se pudo eliminar temporal:', unlinkError);
                }
            }
        }

        if (newRoutes.length) {
            restricted_product.imgProductos = newRoutes.join('---');
        }

        await restricted_product.save();

        req.flash(
            'messageprod',
            'Documento ' + restricted_product.iam + ', creado'
        );

        return res.json({
            state: 1,
            msg: 'ok',
            data: {
                url: '/Dintair/imports/addProduct'
            }
        });

    } catch (error) {

        console.error('Error al guardar documento:', error);

        return res.status(500).json({
            state: 0,
            msg: 'No se pudieron guardar los archivos: ' + error.message
        });
    }
};
