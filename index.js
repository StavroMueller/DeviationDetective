'use strict';
module.exports = {
  //In this function - a "deviation" will be when the second selected line (here the "Deviation line")
  //separates from the primary line by the amount defined in the threshold. A primary line can have
  //many deviations.
  compareLines: function(primaryLine, deviationLine, threshold, featureCollection) {

    var deviationFeatures = [];
    //Should we have a check to see if any points are in common at all before all the calcs are done?
    //One feature collection with two line features inside
    var GeoJSON = require('geojson');
    var gju = require('geojson-utils')
    var _ = require('underscore');

    //First, we'll create a buffer around the primary line.
    //For this, we'll need JSTS.
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
    _.each(deviationLine.geometry.coordinates, function(coordinate, index) {
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
        var previousPoint = deviationLine.geometry.coordinates[index - 1] ? deviationLine.geometry.coordinates[index - 1] : false;
        workingOutsideBuffer = true;
        if (previousPoint) {
          //We need to get the point before, that is inside the buffer but begins the 
          //"deviation"
          deviationCoordinates = [previousPoint, coordinate];
        }
        else {
          //Or, if the previous one is null, it just begins here.
          deviationCoordinates = [coordinate];
        }
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

    console.log('fc', featureCollection);
    if (featureCollection) {
      return {
        "type": "FeatureCollection",
        "features": deviationFeatures
      };
    }
    else {
      return deviationFeatures;
    }
  }

}
