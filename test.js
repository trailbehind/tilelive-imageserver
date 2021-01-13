var fs = require("fs");
var imageserver = require("./index");
var tilelive = require("@mapbox/tilelive");

new imageserver(
  "imageserver:///?source=https://elevation.nationalmap.gov/arcgis/rest/services/3DEPElevation/ImageServer/&rasterFunction=Hillshade Multidirectional",
  function(error, r) {
    console.log("here");
    console.log(error, r);
    if (error) {
      return console.log(error);
    }
    console.log("got source");
    r.getTile(14, 2790, 6326, function(error, tile) {
      if (error) {
        return console.log(error);
      }
      console.log("got tile");
      var out = fs.createWriteStream(__dirname + "/test@1x.png");
      out.write(tile);
    });
  }
);
