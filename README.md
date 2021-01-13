# tilelive-imageserver

This is a tilelive source for ArcGIS ImageServer endpoints.

The documentation used for implementation is [here](https://developers.arcgis.com/rest/services-reference/image-service.htm).

## Usage

`imageserver:` URIs are supported, with the following parameters available:

- `source`: the ImageServer URL
- `rasterFunction`: the rasterFunction provided by the source server to apply to the data. (Optional)
- `minzoom`: optional, default 0
- `maxzoom`: optional, default 14
- `baseTileSize`: base tile size in pixels (default 256)
- `scale`: integer to scale base tile size (default 1)

**Examples**:

- USGS 3DEP Multidimensional Hillshade: `imageserver:///?source=https://elevation.nationalmap.gov/arcgis/rest/services/3DEPElevation/ImageServer/&rasterFunction=Hillshade Multidirectional&maxzoom=14`

## Source/Data Testing

**Local testing**:

1. `node test.js` should place a single tile in the root directory if sucessful.

**Testing with tessera**:

1. Install this source globally with `npm install -g .`
2. Install `tessera`
3. Run `tessera` with the tilelive module included: `tessera --require=tilelive-imageserver "imageserver:///?source=https://elevation.nationalmap.gov/arcgis/rest/services/3DEPElevation/ImageServer/&rasterFunction=Hillshade Multidirectional&maxzoom=14"`
4. View `localhost:8080` in browser
