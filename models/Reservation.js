
const mongoose = require('mongoose');

// Rezervasyon şeması tanımı
const reservationSchema = new mongoose.Schema({
    flightNumber: { type: String, required: true },
    passengerName: { type: String, required: true },
    departureTime :{ type: String, required: true },
    arrivalTime:{type:String,required:false},
    flightDirection:{type:Boolean,required:true},
    route:{ type: String, required: true },
    airline:{ type: String, required: true },
    departureDate: { type: String, required: true },
    
});
// Rezervasyon modelini oluştur ve dışa aktar
const Reservation = mongoose.model('Reservation', reservationSchema);

module.exports = Reservation;
