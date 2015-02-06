'use strict';
module.exports = {
  compareLines: function(primaryLine, deviationLine, threshold) {

    //Should we have a check to see if any points are in common at all before all the calcs are done?
    //One feature collection with two line features inside
    var geojson = require('geojson');
    var _ = require('underscore');

    //First, we'll create a buffer around the primary line.
    //For this, we'll need JSTC.
    var jstc = require('jstc');

    //We have to parse the GeoJSON into a JSTC format to do the operation.
    var parser = new jsts.io.GeoJSONParser();

    var jstsPrimaryLine = parser.read(primaryLine);

    //Write out the buffer back to GeoJSON
    var primaryLineBuffer = parser.write(jstsPrimaryLine.buffer(threshold));

    /*
    //Threshold is in DD - how far apart we want the section to be to determine a new segment.
    //We use this index to step along in the second line, incremented every time we move
    //along the primary line.
    var deviationLineCoordinate = 0;
    var primaryLinePreviousPoint = 0;
    var deviationLinePreviousPoint = 0
    _.each(primaryLine.geometry.coordinates, function(linePoint) {
      //check if the deviation line point is within a buffer of the primary line
      //If it isn't, traverse the deviation line until they are equal again. (loop)


    })
    */

    //An array of geojson line objects
    return featureCollection;
  }
}
