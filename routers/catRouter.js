'use strict';
const express = require('express');
const router = express.Router();
const catController = require('../controllers/catController');
const bodyParser = require('body-parser');
const ExifImage = require('exif').ExifImage;
const multer = require('multer');

//cat database CRUD stuff
router.get('/', (req, res) => {
    res.send('Cats');
});

router.get('/all', (req, res) => {
    catController.cat_list_get().then((result) => {
        res.send(result)
    })
});

router.post('/new', bodyParser.urlencoded({extended: true}), (req, res) => {
    const data = req.body;
    console.log(data);
    catController.cat_create_post(data).then((result) => {
        res.send(result);
    })
});

router.get('/number', (req, res) => {
    catController.cat_number_get().then((result) => {
        res.send(`Got ${result} cats`);
    })
});

router.get('/sort', (req, res) => {
    catController.cat_sort_get().then((result) => {
        let text = '';
        result.forEach((cat) => {
            text += cat.name + '<br>';
        });
        res.send(text);
    });
});

router.post('/uploads', upload.single('image'), function (req, res, next) {
    try {
        new ExifImage({ image: req.file.path}, function (error, exifData) {
            if (error)
                console.log('Error: '+ error.message);
            else
                console.log(exifData);
            bodyParser.json(exifData)
        });
    } catch (error) {
        console.log('Error:' + error.message);
    }
    next();
});

module.exports = router;