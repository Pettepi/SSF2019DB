'use strict';
const Cat = require('../models/cats');

exports.cat_list_get = () => {
    return Cat.find().then((cats) => {
        return cats;
    }).catch((err) => {
        console.log(err);
        return err;
    });
};

exports.cat_create_post = (data) => {
    return Cat.create(data).then((item) => {
        return {status: 'Save OK: ' + item.id};
    }).catch((err) => {
        console.log(err);
        return err;
    });
};

exports.cat_number_get = () => {
    return Cat.find().exec().then((cats) => {
        console.log(cats.length);
        return cats.length;
    }).catch((err) => {
        console.log(err);
        return err;
    });
};

exports.cat_sort_get = () => {
    return Cat.find().
    where('weight').
    gt(3).
    where('age').
    gt(4).
    where('gender').
    equals('male').
    exec().
    then((cats) => {
        return cats;
    }).
    catch((err) => {
        console.log(err);
        return err;
    });
};
