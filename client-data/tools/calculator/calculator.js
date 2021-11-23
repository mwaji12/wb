/**
 *                        WHITEBOPHIR
 *********************************************************
 * @licstart  The following is the entire license notice for the 
 *  JavaScript code in this page.
 *
 * Copyright (C) 2013  Ophir LOJKINE
 *
 *
 * The JavaScript code in this page is free software: you can
 * redistribute it and/or modify it under the terms of the GNU
 * General Public License (GNU GPL) as published by the Free Software
 * Foundation, either version 3 of the License, or (at your option)
 * any later version.  The code is distributed WITHOUT ANY WARRANTY;
 * without even the implied warranty of MERCHANTABILITY or FITNESS
 * FOR A PARTICULAR PURPOSE.  See the GNU GPL for more details.
 *
 * As additional permission under GNU GPL version 3 section 7, you
 * may distribute non-source (e.g., minimized or compacted) forms of
 * that code without the copy of the GNU GPL normally required by
 * section 4, provided you include this license notice and a URL
 * through which recipients can access the Corresponding Source.
 *
 * @licend
 */


<div id="calculator" style="width: 600px; height: 400px;"></div>

<script>
  var elt = document.getElementById('calculator');
  var calculator = Desmos.GraphingCalculator(elt);
  calculator.setExpression({ id: 'graph1', latex: 'y=x^2' });
</script>

var elt = document.getElementById('my-calculator');
var calculator = Desmos.GraphingCalculator(elt);

// Save the current state of a calculator instance
var state = calculator.getState();

// Use jQuery to post a state to your server for permanent storage
$.post('/myendpoint', JSON.stringify(state));

// Load a state into a calculator instance
calculator.setState(state);

// Reset the calculator to a blank state
calculator.setBlank();

// Save the current state of a calculator instance
var newDefaultState = calculator.getState();

// Set a new default state to match the current state
calculator.setDefaultState(newDefaultState);

// From this point forward the "Delete All" button will be replaced with a "Reset"
// button that will set the calculator to the state stored in newDefaultState,
// and the "home" zoom button will restore the viewport to that of newDefaultState.

// Capture a full size screenshot of the graphpaper
var fullsize = calculator.screenshot();

// Capture a double resolution screenshot of the graphpaper designed to
// be displayed at 200px by 200px
var thumbnail = calculator.screenshot({
  width: 200,
  height: 200,
  targetPixelRatio: 2
});

// Append the thumbnail image to the current page
var img = document.createElement('img');
// Note: if width and height are not set, the thumbnail
// would display at 400px by 400px since it was captured
// with targetPixelRatio: 2.
img.width = 200;
img.height = 200;
img.src = thumbnail;
document.body.appendChild(img);

// Callback
function setImageSrc(data) {
  var img = document.getElementById('my-image');
  img.src = data;
}

// Take a screenshot of an exact region without regard for the aspect ratio
calculator.asyncScreenshot(
  {
    mode: 'stretch',
    mathBounds: { left: -5, right: 5, bottom: -20, top: 0 }
  },
  setImageSrc
);

// Show -5 to 5 on the x-axis and preserve the aspect ratio
calculator.asyncScreenshot(
  {
    mode: 'preserveX',
    width: 500,
    height: 300,
    mathBounds: { left: -5, right: 5 }
  },
  setImageSrc
);

// Use the smallest bounding box containing the current viewport and preserve the aspect ratio
calculator.asyncScreenshot(setImageSrc);

// Preserve the aspect ratio if the axes are square, otherwise show the exact region
var opts = {
  mode: calculator.isProjectionUniform() ? 'contain' : 'stretch',
  width: 500,
  height: 300,
  mathBounds: { left: -5, right: 5, bottom: -20, top: 0 }
};
calculator.asyncScreenshot(opts, setImageSrc);

function persistState(state) {
  /* Persist state to your backend */
}

// This example uses the throttle function from underscore.js to limit
// the rate at which the calculator state is queried and persisted.
throttledSave = _.throttle(
  function() {
    persistState(calculator.getState());
    console.log('Save occurred');
  },
  1000,
  { leading: false }
);

calculator.observeEvent('change', function() {
  console.log('Change occurred');
  throttledSave();
});

//Define a variable m.  Doesn't graph anything.
calculator.setExpression({ id: 'm', latex: 'm=2' });

//Draw a red line with slope of m through the origin.
//Because m = 2, this line will be of slope 2.
calculator.setExpression({ id: 'line1', latex: 'y=mx', color: '#ff0000' });

//Updating the value of m will change the slope of the line to 3
grapher.setExpression({ id: 'm', latex: 'm=3' });

//Inequality to shade a circle at the origin
calculator.setExpression({ id: 'circle1', latex: 'x^2 + y^2 < 1' });

//Restrict the slider for the m variable to the integers from 1 to 10
calculator.setExpression({
  id: 'm',
  sliderBounds: { min: 1, max: 10, step: 1 }
});
//Table with three columns. Note that the first two columns have explicitly
//specified values, and the third column is computed from the first.
calculator.setExpression({
  type: 'table',
  columns: [
    {
      latex: 'x',
      values: ['1', '2', '3', '4', '5']
    },
    {
      latex: 'y',
      values: ['1', '4', '9', '16', '25'],
      dragMode: Desmos.DragModes.XY
    },
    {
      latex: 'x^2',
      color: Desmos.Colors.BLUE,
      columnMode: Desmos.ColumnModes.LINES
    }
  ]
});

expression_states.forEach(function(expression_state) {
  calculator.setExpression(expression_state);
});

// Add an expression
calculator.setExpression({ id: 'parabola', latex: 'y=x^2' });

// Remove it
calculator.removeExpression({ id: 'parabola' });

expression_states.forEach(function(expression_state) {
  calculator.removeExpression(expression_state);
});

calculator.getExpressions();
/*
[
  {
    id: "1",
    type: "expression",
    latex: "\left(1,2\right)",
    pointStyle: "POINT",
    hidden: false,
    secret: false,
    color: "#c74440",
    parametricDomain: {min: "0", max: "1"},
    dragMode: "X",
    label: "my point",
    showLabel: true
  },
  ...
]
*/

{
  isGraphable: Boolean, // Does the expression represent something that can be plotted?
  isError: Boolean, // Does the expression result in an evaluation error?
  errorMessage?: String // The (localized) error message, if any
  evaluationDisplayed?: Boolean, // Is evaluation information displayed in the expressions list?
  evaluation?: { type: 'Number', value: Number } |
               { type: 'ListOfNumber', value: Number[] } // numeric value(s)
}

calculator.observe('expressionAnalysis', function() {
  for (var id in calculator.expressionAnalysis) {
    var analysis = calculator.expressionAnalysis[id];
    if (analysis.isGraphable) console.log('This expression can be plotted.');
    if (analysis.isError)
      console.log(`Expression '${id}': ${analysis.errorMessage}`);
    if (analysis.evaluation) console.log(`value: ${analysis.evaluation.value}`);
  }
});

var calculator = Desmos.GraphingCalculator(elt);

calculator.setExpression({ id: 'a-slider', latex: 'a=1' });
var a = calculator.HelperExpression({ latex: 'a' });

calculator.setExpression({ id: 'list', latex: 'L=[1, 2, 3]' });
var L = calculator.HelperExpression({ latex: 'L' });

a.observe('numericValue', function() {
  console.log(a.numericValue);
});

L.observe('listValue', function() {
  console.log(L.listValue);
});

// Set the x axis to have arrows on both ends
calculator.updateSettings({ xAxisArrowMode: Desmos.AxisArrowModes.BOTH });

// In calc1, users will be allowed to create secret folders and see
// their contents.
var calc1 = Desmos.GraphingCalculator(elt1, { administerSecretFolders: true });

// By default, secret folders are hidden from users.
var calc2 = Desmos.GraphingCalculator(elt2);

// Set xAxisLabel
calculator.updateSettings({ xAxisLabel: 'Time' });

// Observe the value of `xAxisLabel`, and log a message when it changes.
calculator.settings.observe('xAxisLabel', function() {
  console.log(calculator.settings.xAxisLabel);
});
calculator.updateSettings({ randomSeed: 'my-random-seed' });
<meta name="viewport" content="width=device-width, initial-scale=1" />
var elt = document.getElementById('calculator');
var calculator = Desmos.GraphingCalculator(elt, { autosize: false });

// Resize the calculator explicitly.
elt.style.width = '600px';
elt.style.height = '400px';
calculator.resize();

//Only show the first quadrant
calculator.setMathBounds({
  left: 0,
  right: 10,
  bottom: 0,
  top: 10
});

{
  mathCoordinates: {
    top: Number,
    bottom: Number,
    left: Number,
    right: Number,
    width: Number,
    height: Number
  },
  pixelCoordinates: {
    top: Number,
    bottom: Number,
    left: Number,
    right: Number,
    width: Number,
    height: Number
  }
}

calculator.observe('graphpaperBounds', function() {
  var pixelCoordinates = calculator.graphpaperBounds.pixelCoordinates;
  var mathCoordinates = calculator.graphpaperBounds.mathCoordinates;

  var pixelsPerUnitY = pixelCoordinates.height / mathCoordinates.height;
  var pixelsPerUnitX = pixelCoordinates.width / mathCoordinates.width;

  console.log('Current aspect ratio: ' + pixelsPerUnitY / pixelsPerUnitX);
});

// Find the pixel coordinates of the graphpaper origin:
calculator.mathToPixels({ x: 0, y: 0 });

// Find the math coordinates of the mouse
var calculatorRect = calculatorElt.getBoundingClientRect();
document.addEventListener('mousemove', function(evt) {
  console.log(
    calculator.pixelsToMath({
      x: evt.clientX - calculatorRect.left,
      y: evt.clientY - calculatorRect.top
    })
  );
});

// Add three different observers to the 'xAxisLabel' property
calculator.settings.observe('xAxisLabel.foo', callback1);
calculator.settings.observe('xAxisLabel.bar', callback2);
calculator.settings.observe('xAxisLabel.baz', callback3);

// Stop firing `callback2` when the x-axis label changes
calculator.settings.unobserve('xAxisLabel.bar');

// Remove the two remaining observers
calculator.settings.unobserve('xAxisLabel');

calculator.setExpression({
  id: '1',
  latex: 'y=x',
  color: Desmos.Colors.BLUE
});

calculator.setExpression({
  id: '2',
  latex: 'y=x + 1',
  color: '#ff0000'
});

calculator.setExpression({
  id: '3',
  latex: 'y=sin(x)',
  color: calculator.colors.customBlue
});

// Make a dashed line
calculator.setExpression({
  id: 'line',
  latex: 'y=x',
  lineStyle: Desmos.Styles.DASHED
});

// This will render with normal movable point styling, because named point
// assignments result in points with a `dragMode` of `XY` by default
calculator.setExpression({
  id: 'pointA',
  latex: 'A=(1,2)',
  pointStyle: Desmos.Styles.CROSS
});

// Now point A will render with `CROSS` styling
calculator.setExpression({
  id: 'pointA',
  dragMode: Desmos.DragModes.NONE
});

// Point B will render as a hole
calculator.setExpression({
  id: 'pointB',
  latex: 'B=(2,4)',
  dragMode: Desmos.DragModes.NONE,
  pointStyle: Desmos.Styles.OPEN
});

// This point will render with `CROSS` styling, because the default
// `dragMode` for an unassigned point with numeric values is `NONE`
calculator.setExpression({
  id: 'pointC',
  latex: '(7,5)',
  pointStyle: Desmos.Styles.CROSS
});

calculator.updateSettings({ fontSize: Desmos.FontSizes.LARGE });

calculator.updateSettings({ fontSize: 11 });

<!-- Include Spanish translations -->
<script src="https://www.desmos.com/api/v1.6/calculator.js?apiKey=dcb31709b452b1cf9dc26972add0fda6&lang=es"></script>

<!-- Include Spanish and French translations -->
<script src="https://www.desmos.com/api/v1.6/calculator.js?apiKey=dcb31709b452b1cf9dc26972add0fda6&lang=es,fr"></script>

<!-- Include all available translations -->
<script src="https://www.desmos.com/api/v1.6/calculator.js?apiKey=dcb31709b452b1cf9dc26972add0fda6&lang=all"></script>
// Inspect available languages
Desmos.supportedLanguages; // ['es', 'fr']

// Set a calculator instance to French
calculator.updateSettings({ language: 'fr' });

function imageUploadCallback(file, cb) {
  Desmos.imageFileToDataURL(file, function(err, dataURL) {
    if (err) {
      cb(err);
      return;
    }

    // Send the data to your server, and arrange for your server to
    // respond with a URL
    $.post('https://example.com/serialize-image', { imageData: dataURL }).then(
      function(msg) {
        cb(null, msg.url);
      }, // Success, call the callback with a URL
      function() {
        cb(true);
      } // Indicate that an error has occurred
    );
  });
}

Desmos.GraphingCalculator(elt, { imageUploadCallback: imageUploadCallback });

// All features enabled
Desmos.enabledFeatures ===
  {
    GraphingCalculator: true,
    FourFunctionCalculator: true,
    ScientificCalculator: true
  };

// Only graphing calculator enabled
Desmos.enabledFeatures ===
  {
    GraphingCalculator: true,
    FourFunctionCalculator: false,
    ScientificCalculator: false
  };

var elt1 = document.getElementById('four-function-calculator');
var calculator1 = Desmos.FourFunctionCalculator(elt1);

var elt2 = document.getElementById('scientific-calculator');
var calculator2 = Desmos.ScientificCalculator(elt2);

