const mongoose = require('mongoose');
const cities = require('./cities')
const Campground = require('../models/campground')
const {places, descriptors} = require('./seedHelpers')

mongoose.connect('mongodb://localhost:27017/yelp-camp',{
    useNewUrlParser: true, 
    useUnifiedTopology: true
})
.then(()=>{
    console.log('mongo opened')
})
.catch((err)=> {
    console.log(err)
})

const sample = (array) => {
    return array[Math.floor(Math.random() * array.length)]
}


const seedDB = async() => {
    await Campground.deleteMany({})
    for (let i =0; i < 50; i++){
        const random1000 = Math.floor(Math.random() * 1000);
        const price = Math.floor(Math.random()* 20) + 10;
       const camp = new Campground({
            location: `${cities[random1000].city}, ${cities[random1000].state}`,
            title: `${sample(descriptors)} ${sample(places)}`,
            image: 'https://picsum.photos/400',
            description: 'lorem',
            price: price

        })
        await camp.save()
    }
    
}

seedDB().then(()=> {
    mongoose.connection.close
})