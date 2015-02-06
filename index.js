'use strict';
module.exports = {
  compareLines: function(primaryLine, deviationLine, threshold) {

    var deviationFeatures = [];
    //Should we have a check to see if any points are in common at all before all the calcs are done?
    //One feature collection with two line features inside
    var GeoJSON = require('geojson');
    var gju = require('geojson-utils')
    var _ = require('underscore');

    //First, we'll create a buffer around the primary line.
    //For this, we'll need JSTC.
    var jsts = require('jsts');

    //We have to parse the GeoJSON into a JSTC format to do the operation.
    var parser = new jsts.io.GeoJSONParser();

    var jstsPrimaryLine = parser.read(primaryLine);

    //Write out the buffer back to GeoJSON
    var primaryLineBuffer = parser.write(jstsPrimaryLine.geometry.buffer(threshold));
    var fs = require('fs');

    fs.writeFile('bufferDebug.json', JSON.stringify(primaryLineBuffer, null, 4), function(err) {
        if(err) {
          console.log(err);
        } else {
          console.log("JSON saved");
        }
    }); 

    //This is a flag to tell whether or not we are still traversing outside the buffer
    var workingOutsideBuffer = false;

    //This will hold all of the coordinates for a particular deviation
    var deviationCoordinates = [];
    //Now we can find all of the points from the deviation line that are not in the buffer.
    console.log('first coordinate', deviationLine.geometry.coordinates[0]);
    _.each(deviationLine.geometry.coordinates, function(coordinate) {
      var pointOutsideBuffer = gju.pointInPolygon({ 'type': 'Point', 'coordinates': coordinate}, primaryLineBuffer) ? false : true;
      console.log(pointOutsideBuffer, 'is it?');
      if (pointOutsideBuffer && workingOutsideBuffer) {
        //The point is outside the buffer, and we are forming a line out of these points.
        console.log('pushing another');
        deviationCoordinates.push(coordinate);
      }
      else if (pointOutsideBuffer) {
        //This is a new line that is outside the buffer. This is the first point in that line.
        console.log('first point');
        workingOutsideBuffer = true;
        deviationCoordinates = [coordinate];
      }
      else if (workingOutsideBuffer) {
        //This means that we are in the buffer, therefore this is the last point in a deviation.
        //Here we need to actually create and append the feature class to the array.
        deviationCoordinates.push(coordinate);
        //Push this line into the features array
        console.log(deviationCoordinates);
        var newLine = {
          'type': 'Feature',
          'geometry': {
            'type': 'LineString',
            'coordinates': deviationCoordinates
          },
          'properties': {
            'id': 'something id here?'
          }
        };
        deviationFeatures.push(newLine);
        workingOutsideBuffer = false;
      }
      else {
        console.log('no conditions met');
      }

    });

    //After this, we should make sure we are no longer workingOutsideBuffer - if so, complete the line.

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
    return deviationFeatures;

  }

}
