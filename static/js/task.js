/*
 * Requires:
 *     psiturk.js
 *     utils.js
 */

// Initalize psiturk object
var psiTurk = new PsiTurk(uniqueId, adServerLoc, mode);

/********************
* Variable declaration and initialization
*
* Declare and initialize all global variables
* to be used in the experiment
*
********************/
var trial_matrix = [];
var trial_matrix_file = "/static/trial-type.csv";
var prac_length = 4;
var pages = [
	"instructions/instruct-ready.html",
	"stage.html",
	"postquestionnaire.html"
];
// Variables for drawing images on screen
var center_x = 1080 / 2;
var center_y = 800 / 2;
var fixation_width = 5;
var s = Snap("#svgMain");

psiTurk.preloadPages(pages);

var instructionPages = [ // add as a list as many pages as you like
	"instructions/instruct-ready.html"  x
];

/*  Reads and shuffles (if necessary) text/csv file
	and stores in array for experiment
	modified by joecool890 on 2018-06-09 */
function readTextFile(file, shuffle){
    var rawFile = new XMLHttpRequest();
    rawFile.open("GET", file, true);
    rawFile.onreadystatechange = function (){
        if(rawFile.readyState === 4 && rawFile.status === 200) {
            console.log("ready to extract");
            allText = rawFile.responseText.split("\n");
            allText.map(function(item){
                var tabs = item.split(",");
                trial_matrix.push(tabs);
            });
            if (shuffle === 1){
            trial_matrix = _.shuffle(trial_matrix)
            }
        }
    };
    rawFile.send(null);
};

readTextFile(trial_matrix_file, 1);

// Common Stimuli used in experiment
var show_fixation = function(){
    document.body.style.cursor = 'none';
    var vertical = s.line(center_x-10, center_y, center_x+10, center_y);
    vertical.attr({
      id:"fix1",
      stroke: "red",
      strokeWidth: fixation_width
    });
    var horizontal = s.line(center_x, center_y-10, center_x, center_y+10);
    horizontal.attr({
      id:"fix2",
      stroke: "red",
      strokeWidth: fixation_width
    });

};

var show_circle = function(){
    document.body.style.cursor = 'none';
	var bigCircle = s.circle(150, 150, 100);
	// By default its black, lets change its attributes
	bigCircle.attr({
        fill: "#bada55",
        strokeWidth: 5
    });
};

var show_square = function(){
    document.body.style.cursor = 'none';
	var bigSquare = s.square(150, 150, 100);
	// By default its black, lets change its attributes
	bigSquare.attr({
        fill: "#da2822",
        strokeWidth: 5
    });
};

var show_SOA = function(){
	s.clear();
};
// console.log(trial_matrix);

/********************
* HTML manipulation
*
* All HTML files in the templates directory are requested 
* from the server when the PsiTurk object is created above. We
* need code to get those pages from the PsiTurk object and 
* insert them into the document.
*
********************/

/*******************
*  Practice Block  *
*******************/

var practice = function() {
	prac_trials = trial_matrix.shift();
	var prac_trial_count = 0;

	var next = function() {
		if (prac_trial_count === prac_length) {
			var s = Snap("svgMain");
			s.clear();
			clearTimeout();
			finish;
		} else {
			var s = Snap("svgMain");
			s.clear();
			show_fixation();
			clearTimeout();
			handle01 = setTimeout(function(){
				show_circle();}, 500);
			handle02 = setTimeout(function(){
				show_SOA();}, 1000);
			handle03 = setTimeout(function(){
				show_square();}, 2500);
		}
	}
	next()

};

// Task object to keep track of the current phase
var currentview;
/*******************
 * Run Task
 ******************/
$(window).load( function(){
    psiTurk.doInstructions(
    	instructionPages, // a list of pages you want to display in sequence
    	function() { currentview = new practice(); } // what you want to do when you are done with instructions
    );
});
