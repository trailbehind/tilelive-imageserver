module.exports = ImageServerSource;

var request = require("retry-request", {
  request: require("request")
});
var url = require("url");
var tilelive = require("@mapbox/tilelive");

var SphericalMercator = require("@mapbox/sphericalmercator");

var retry_options = {
  retries: 4,
  factor: 1.7
};

var merc = new SphericalMercator({
  size: 256
});

function ImageServerSource(uri, callback) {
  var parsed_uri = url.parse(uri, true);

  this.name = "ImageServerSource";
  this.minzoom = parseInt(parsed_uri.query.minzoom || "0");
  this.maxzoom = parseInt(parsed_uri.query.maxzoom || "14");
  this.scale = parseInt(parsed_uri.query.scale || "1");
  this.tilesize = parseInt(parsed_uri.query.baseTileSize || "256");

  verifySource(parsed_uri["query"]["source"], function(e) {
    if (e) {
      console.error(
        "ImageServer source " +
          parsed_uri["query"]["source"] +
          " is invalid. (" +
          JSON.stringify(e) +
          ")"
      );
    }
  });

  this.server_root = parsed_uri["query"]["source"];
  this.options = parsed_uri["query"];
  delete this.options.source;

  callback(null, this);
}

function verifySource(root_url, callback) {
  request(root_url + "/?f=json", retry_options, function(e, resp, body) {
    if (e) return callback(e);
    if ((resp = 200)) {
      body = JSON.parse(body);
      if (body.error) {
        callback(body);
      } else {
        callback();
      }
    }
  });
}

ImageServerSource.prototype.getTile = function(z, x, y, callback) {
  var tile_bbox = merc.bbox(x, y, z);

  var tilesize = this.tilesize * this.scale;

  var params = {
    size: tilesize + "," + tilesize,
    format: "png",
    f: "image",
    bboxSR: 4326,
    bbox: tile_bbox.join(",")
  };

  if (this.options.rasterFunction) {
    params["renderingRule"] =
      '{"rasterFunction" : "' + this.options.rasterFunction + '"}';
  }

  var root = this.server_root;

  request(
    {
      url: this.server_root + "/exportImage",
      encoding: null,
      qs: params
    },
    retry_options,
    function(error, response, body) {
      if (error) {
        return callback(error);
      }

      switch (response.statusCode) {
        case 200:
        case 403:
        case 404:
          return callback(null, body, {});
        default:
          console.warn(
            "ImageServer URL " +
              root +
              "/exportImage with params " +
              JSON.stringify(params) +
              " returned HTTP status code " +
              response.statusCode +
              ", tile will be skipped"
          );
          return callback(new Error("Tile does not exist"));
      }
    }
  );
};

ImageServerSource.prototype.getInfo = function(callback) {
  callback(null, {
    name: this.name,
    minzoom: this.minzoom,
    maxzoom: this.maxzoom,
    center: [-119.4835, 37.8042, 12],
    bounds: [-180, -85.0511, 180, 85.0511],
    format: "png"
  });
};

ImageServerSource.registerProtocols = function(tilelive) {
  tilelive.protocols["imageserver:"] = ImageServerSource;
};

ImageServerSource.registerProtocols(tilelive);
