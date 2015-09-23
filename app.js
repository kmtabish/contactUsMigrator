/**
 * Created by ttnd on 17/9/15.
 */
"use strict";

var express = require('express');
var async = require('async');
var geocoderProvider = 'google';

var extra = {
    apiKey: 'AIzaSyB0xpJ-AseoeusvT2PPWd5MOak58CR_B0c',
    formatter: null
};

var httpAdapter = 'https';
var geocoder = require('node-geocoder')(geocoderProvider, httpAdapter, extra);
var app = express();

var Defaults = {
    itemLayout: 'List_Layout_1',
    itemListBgImage: "",
    description: '<p>&nbsp;<br></p>'
};
// Async Call any File Operation || Request Hit
function ConvertData(err, data) {
    var list = data.Content.Sections;
    var tasks = [];

    list.forEach(function (sectionObject) {
        tasks.push(function (callback) {

            geocoder.geocode(sectionObject.Address, function (err, res) {
                if (err) {
                    callback(err, null);
                } else {
                    sectionObject.location_coordinates = [res[0].latitude,res[0].longitude];
                    callback(null, 'Success');
                }
            });

        });
    });

    async.parallel(tasks, function (err, data) {
        var allData =[];
        // Enter when Google API Done
        list.forEach(function (section) {
            var contactUsInfo = {
                content: {
                    carouselImages: [],
                    description: section.Text,
                    addressTitle: section.Address,
                    address: {
                        location: section.Address,
                        location_coordinates: section.location_coordinates
                    },
                    links: [
                        {sendEmail:{
                            title:"",
                            Subject:"",
                            body:"",
                            email:section.Email,
                            action:"sendEmail"}
                        },{
                            sendSMS:{
                            title:"",
                            Subject:"",
                            body:"",
                            phoneNumber:section.ContactNumber,
                            action:"sendSMS"}
                        },{
                            linkToSocialFaceBook:{
                                title:"",
                                url:section.FacebookUrl,
                                action:"linkToSocialFaceBook"}
                        },{
                            linkToSocialTwitter:{
                                title:"",
                                url:section.TwitterUrl,
                                action:"linkToSocialTwitter"}
                        },{
                            linkToSocialGoogle:{
                                title:"",
                                url:section.GooglePlusUrl,
                                action:"linkToSocialGoogle"}
                        },{
                            linkToSocialInstagram:{
                                title:"",
                                url:section.InstagramUrl,
                                action:"linkToSocialInstagram"}
                        },{
                            linkToSocialLinkedIn:{
                                title:"",
                                url:section.LinkedInUrl,
                                action:"linkToSocialLinkedIn"}
                        }],
                    showMap: section.ShowAddressInMap
                },
                design: {
                    listLayout:Defaults.itemLayout,
                    backgroundImage: Defaults.itemListBgImage
                }
            };
            allData.push(contactUsInfo);
        });
        app.get('/', function (req, res) {
            res.send(allData);
        });

    });
}
ConvertData(null, require("./oldData"));

var server = app.listen(3004, function () {
    var host = server.address().address;
    var port = server.address().port;

    console.log('Converter app listening at http://%s:%s', host, port);
});