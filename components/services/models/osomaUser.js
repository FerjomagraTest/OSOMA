const mongoose = require('mongoose')
var Schema = mongoose.Schema

var osomauser = new Schema({

    name_serv : {type:String},
    email_user : {type:String},
    tipo_Serv : {type:String},
    imageServicios : {type:String},
    fecha_creacion : {type:String},
    hora_creacion : {type:String},
    vistas : {type:Number},

    nuevafecha : {type:String},

    creator: {type: Schema.Types.ObjectId, ref:'User'},

    deleted : {type:Boolean},
    deleteDate : {type: String},
    deleteTime : {type: String},
    targetsell: {type:String},
})

var OsomaUser = mongoose.model('OsomaUser', osomauser)
module.exports = OsomaUser