// Fotos y documentos
/*var aFile = [];



function getItem(src, index, isPDF, fileName) {
    var html = '<article>';
    html += '<span data-index="' + index + '">x</span>';

    if (isPDF) {
        var pdfWindow = URL.createObjectURL(
            dataURLtoBlob(src)
        );

        html += '<a href="' + pdfWindow + '" ';
        html += 'target="_blank" rel="noopener noreferrer">';

        html += '<img src="/images/icons/pdf.png" ';
        html += 'alt="Documento PDF" ';
        html += 'title="' + $('<div>').text(fileName).html() + '" ';
        html += 'style="width:100px;height:100px;object-fit:contain;cursor:pointer;" />';

        html += '</a>';
    } else {
        html += '<img src="' + src + '" />';
    }

    html += '</article>';

    $('#ct-items').append(html);
}

function dataURLtoBlob(dataURL) {
    var parts = dataURL.split(',');
    var mime = parts[0].match(/:(.*?);/)[1];
    var binary = atob(parts[1]);
    var bytes = new Uint8Array(binary.length);

    for (var i = 0; i < binary.length; i++) {
        bytes[i] = binary.charCodeAt(i);
    }

    return new Blob([bytes], { type: mime });
}



function getFile(file, index) {
    var reader = new FileReader();

    var isPDF = file.type === 'application/pdf' ||
                file.name.toLowerCase().endsWith('.pdf');

    reader.onload = function (e) {
        // Mostrar logo para PDF o vista previa para imágenes
        getItem(reader.result, index, isPDF, file.name);

        // Guardar el contenido original del archivo
        $('#newFile').attr('value', e.target.result);

        aFile.push($('#newFile').serialize());
    };

    reader.readAsDataURL(file);
    return false;
}

$('#btnFiles').change(function () {
    var obj = document.getElementById('btnFiles');
    var count = obj.files.length;

    for (var i = 0; i < count; i++) {
        getFile(obj.files[i], i);
    }
});

$('#btnFhoto').on('click', function (e) {
    $('#btnFiles').click();
});

$('#ct-items').on('click', 'span',function(e){
    var obj = $(this);

    if(obj.attr('data-img')){
        var fileOld = $('#fileOld').val();
        var tFile = fileOld.split('---');
        var nFile = '';

        tFile.map(function(item){
            if(obj.attr('data-img') != item){
                nFile = (nFile)? nFile + '---' + item : item;
            }
        });

        $('#fileOld').attr('value', nFile);
    } else {
        var index  = obj.attr('data-index');

        var aTemp = [];
        var count = aFile.length;

        for(var i = 0; i < count; i++ ){
            if(index != i){
                aTemp.push(aFile[i]);
            }
        }

        aFile = aTemp;
    }

    $(this).parent().remove();
});

function isError(obj, text){
    obj.css('border', '1px solid #ff4d4d');
    obj.next().text('text');
}

$('#btnSend').on('click', function(){


    var action = $('#msform').attr('action');

    var dataString = 'id=' + $.trim($('#id').val());
    dataString += '&nombre=' + $.trim($('#nombre').val());
    dataString += '&iam=' + $.trim($('input[name="iam"]:checked').val());
    dataString += '&link=' + $.trim($('#link').val());
    dataString += '&aeropost_link=' + $.trim($('#aeropost_link').val());
    dataString += '&entidad=' + $.trim($('.entidad').val());
    dataString += '&documents=' + $.trim($('.documents').val());
    dataString += '&subpartida=' + $.trim($('#subpartida').val());
    dataString += '&comentario=' + $.trim($('#comentario').val());

    dataString += '&tupa_permiso=' + $.trim($('#tupa_permiso').val());
    dataString += '&precio_permiso=' + $.trim($('#precio_permiso').val());
    dataString += '&url_tramite=' + $.trim($('#url_tramite').val());

    if($('#fileOld')){
        dataString += '&fileOld=' + $.trim($('#fileOld').val());
    }

    dataString += '&files=' + JSON.stringify(aFile);

    $('#loaderImg').css('display', 'block');
    $('#btnSend').attr('disabled', true);

    $.ajax({
        type: "POST",
        url: action,
        data: dataString,
        dataType: 'json',
        success: function(result) {
            if(result.state == 1){
                console.log(result.msg);
                window.location.href = result.data.url;
            }else{
                console.log(result.msg);
            }
        }
    });

    return false;
});*/



// ==========================================
// GESTIÓN DE FOTOS Y DOCUMENTOS
// Formatos: JPG, PNG, WEBP, PDF y ZIP
// ==========================================

var aFile = [];
var fileCounter = 0;


// ------------------------------------------
// Identificar el tipo de archivo
// ------------------------------------------

function getFileType(file) {

    var name = file.name.toLowerCase();

    if (file.type === 'application/pdf' || name.endsWith('.pdf')) {
        return 'pdf';
    }

    if (
        file.type === 'application/zip' ||
        file.type === 'application/x-zip-compressed' ||
        name.endsWith('.zip')
    ) {
        return 'zip';
    }

    if (file.type.startsWith('image/')) {
        return 'image';
    }

    return null;
}


// ------------------------------------------
// Crear vista previa del archivo
// ------------------------------------------

function getItem(src, index, type, fileName, file) {

    var article = $('<article>');
    var remove = $('<span>')
        .attr('data-index', index)
        .text('x');

    article.append(remove);

    if (type === 'image') {

        var img = $('<img>')
            .attr('src', src)
            .attr('alt', fileName);

        article.append(img);

    } else {

        var icon = type === 'pdf'
            ? '/images/icons/pdf.png'
            : '/images/icons/zip.png';

        var blobURL = URL.createObjectURL(file);

        var link = $('<a>')
            .attr('href', blobURL)
            .attr('rel', 'noopener noreferrer');

        if (type === 'pdf') {
            link.attr('target', '_blank');
        } else {
            link.attr('download', fileName);
        }

        var img = $('<img>')
            .attr('src', icon)
            .attr('alt', type.toUpperCase())
            .attr('title', fileName)
            .css({
                width: '100px',
                height: '100px',
                objectFit: 'contain',
                cursor: 'pointer'
            });

        link.append(img);
        article.append(link);
    }

    $('#ct-items').append(article);
}


// ------------------------------------------
// Leer y procesar archivos
// ------------------------------------------

function getFile(file) {

    var type = getFileType(file);

    if (!type) {
        alert('Formato no permitido: ' + file.name);
        return;
    }

    var index = fileCounter++;

    var reader = new FileReader();

    reader.onload = function(e) {

        var data = e.target.result;

        getItem(data, index, type, file.name, file);

        // Guardar contenido original del archivo
        aFile[index] = data;
    };

    reader.onerror = function() {
        alert('No se pudo leer el archivo: ' + file.name);
    };

    reader.readAsDataURL(file);
}


// ------------------------------------------
// Selección de archivos
// ------------------------------------------

$('#btnFiles').on('change', function() {

    var files = this.files;

    for (var i = 0; i < files.length; i++) {
        getFile(files[i]);
    }

    // Permite volver a seleccionar el mismo archivo
    $(this).val('');
});


// ------------------------------------------
// Botón para abrir selector
// ------------------------------------------

$('#btnFhoto').on('click', function(e) {
    e.preventDefault();
    $('#btnFiles').click();
});


// ------------------------------------------
// Eliminar archivos seleccionados
// ------------------------------------------

$('#ct-items').on('click', 'span', function() {

    var obj = $(this);

    if (obj.attr('data-img')) {

        var fileOld = $('#fileOld').val() || '';
        var tFile = fileOld.split('---');

        var nFile = tFile.filter(function(item) {
            return obj.attr('data-img') !== item;
        });

        $('#fileOld').val(nFile.join('---'));

    } else {

        var index = Number(obj.attr('data-index'));

        // Mantener los índices originales
        // para evitar eliminar archivos equivocados
        aFile[index] = null;
    }

    obj.closest('article').remove();
});


// ------------------------------------------
// Validación visual
// ------------------------------------------

function isError(obj, text) {
    obj.css('border', '1px solid #ff4d4d');
    obj.next().text(text);
}


// ------------------------------------------
// Enviar formulario
// ------------------------------------------

$('#btnSend').on('click', function(e) {

    e.preventDefault();

    var action = $('#msform').attr('action');

    var data = {

        id: $.trim($('#id').val()),
        nombre: $.trim($('#nombre').val()),
        iam: $.trim($('input[name="iam"]:checked').val() || ''),
        link: $.trim($('#link').val()),
        aeropost_link: $.trim($('#aeropost_link').val()),
        entidad: $.trim($('.entidad').val()),
        documents: $.trim($('.documents').val()),
        subpartida: $.trim($('#subpartida').val()),
        comentario: $.trim($('#comentario').val()),

        tupa_permiso: $.trim($('#tupa_permiso').val()),
        precio_permiso: $.trim($('#precio_permiso').val()),
        url_tramite: $.trim($('#url_tramite').val()),

        // Enviar únicamente los archivos existentes
        files: JSON.stringify(aFile.filter(Boolean))
    };

    if ($('#fileOld').length) {
        data.fileOld = $.trim($('#fileOld').val());
    }

    $('#loaderImg').css('display', 'block');
    $('#btnSend').prop('disabled', true);

    $.ajax({

        type: 'POST',
        url: action,
        data: $.param(data),
        dataType: 'json',

        success: function(result) {

            if (result.state == 1) {

                window.location.href = result.data.url;

            } else {

                console.log(result.msg);

                alert('No se pudo guardar la información.');

                $('#btnSend').prop('disabled', false);
                $('#loaderImg').hide();
            }
        },

        error: function(xhr, status, error) {

            console.error('Error al enviar archivos:', error);
            console.error(xhr.responseText);

            alert('Ocurrió un error al guardar los archivos.');

            $('#btnSend').prop('disabled', false);
            $('#loaderImg').hide();
        }
    });

    return false;
});
