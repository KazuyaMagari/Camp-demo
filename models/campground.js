const mongoose = require('mongoose');
const Schema = mongoose.Schema;


const CampgroungSchema = new Schema({
    title: String,
    price: Number,
    description: String,
    location: String,
    image: String,
    review: [{
        type:Schema.Types.ObjectId, 
        ref:'Review'
    }]
});


module.exports = mongoose.model('Campground', CampgroungSchema);