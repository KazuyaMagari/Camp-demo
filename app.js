const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
const morgan = require('morgan')
const methodOverride = require('method-override')
const ejsMate = require('ejs-mate')
const catchAsync = require('./utils/catchAsync')
const ExpressError = require('./utils/ExpressError')
const Campground = require('./models/campground');
const Joi = require('joi')
const {campgroundSchema, reviewSchema} = require('./schemas')
const Review = require('./models/review')
mongoose.connect('mongodb://localhost:27017/yelp-camp', {
});


const app = express();
app.use(express.urlencoded({extended:true}))
app.use(methodOverride('_method'))
app.engine('ejs', ejsMate)
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'))
app.use(morgan('tiny'))


const validateCampground = (req, res, next)=>{
    
   const {result} = campgroundSchema.validate(req.body)

   if (result){
       const msg = error.details.map(el => el.message).join(',')
       throw new ExpressError(msg, 400)
   }
   else {
    next();
   }


}
const validateReview = (req, res, next) => {
    const {error} = reviewSchema.validate(req.body)
    if (error){
        const msg = error.details.map(el => el.message).join(',')
        throw new ExpressError(msg, 400)
    }
    else {
     next();
    }
}

app.get('/', (req, res) => {
    res.render('home')
});
app.get('/campgrounds', async (req, res) => {
    const campgrounds = await Campground.find({});
    res.render('campgrounds/index', { campgrounds })
});

app.get('/campgrounds/new', (req, res)=>{
    res.render('campgrounds/new')
})
app.post('/campgrounds', validateCampground, catchAsync (async(req, res, next)=>{
    // if (!req.bodyl.campground) throw new ExpressError('Invalid Campground Data', 404)
   
    const campground = new Campground(req.body.campground)
    await campground.save()
    res.redirect(`campgrounds/${campground._id}`)
    

}))

app.get('/campgrounds/:id', async(req, res) =>{
    const campground = await Campground.findById(req.params.id).populate('review')
    res.render('campgrounds/show', {campground})
})

app.get('/campgrounds/:id/edit', async(req, res)=>{
    const campground = await Campground.findById(req.params.id)
    res.render('campgrounds/edit', {campground})
})

app.put('/campgrounds/:id', validateCampground, catchAsync(async(req, res)=> {
    
    const {id} = req.params;
    const campground = await Campground.findByIdAndUpdate(id, {...req.body.campground}, {new:true})
    console.log(req.body)
    res.redirect(`/campgrounds/${campground._id}`)
}))

app.delete('/campgrounds/:id', async(req, res)=>{
    const {id} = req.params;
   
    const campground = await Campground.findByIdAndDelete(id);
    res.redirect('/campgrounds')
} )

app.post('/campgrounds/:id/reviews', validateReview, catchAsync(async(req, res) => {
    const campground = await Campground.findById(req.params.id);
    const review = new Review(req.body.review);
    campground.review.push(review);
    await review.save();
    await campground.save();
    res.redirect(`/campgrounds/${campground.id}`)

}))

app.delete('/campgrounds/:id/review/:reviewId', catchAsync(async(req, res)=>{
    const {id, reviewId} = req.params;
    Campground.findByIdAndDelete(req.params.id, {$pull: {review: reviewId}})
    await Review.findByIdAndDelete(req.params.reviewId)
    res.redirect(`/campgrounds/${id}`)
}))

app.all(/(.*)/, (req, res, next)=>{
    next(new ExpressError('Page not found', 404))
} )
app.use((err, req, res, next) => {
    const {statusCode = 500, message = 'something went wrong'}  = err
    res.status(statusCode).render('error', {err})

})
app.listen(3000, () => {
    console.log('opened')
})


