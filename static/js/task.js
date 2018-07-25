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
psiTurk.preloadPages(pages);
var s = Snap("#svgMain");
var instructionPages = [ // add as a list as many pages as you like
	"instructions/instruct-ready.html"
];

// will need to modify once scene exemplars are decided on
var scene_path = [
    "static/images/scene/1.png",
    "static/images/scene/2.png",
    "static/images/scene/3.png",
    "static/images/scene/4.png",
    "static/images/scene/5.png"
];
var scene_width     = 640;
var scene_height    = 512;

// object path defined in object presenting function
var img_file_ext    = ".png"
var object_width    = 150;
var object_height   = 150;

// Labels to make reading files easy
var index_scene_category  = 0;
var index_main_object     = 1;
var index_other_object    = 2;
var index_main_object_loc = 3;

// General function that loads images.
// var Image = function Show_image(image_path, width, height, cx, cy) {
//     // this.image_path = image_path;
//     this.width = width;
//     this.height = height;
//     this.cx = cx - (this.width/2);
//     this.cy = cy - (this.height/2);
//     this.image = s.image(image_path, this.cx, this.cy, this.width, this.height);
// };


/*  Reads and shuffles (if necessary) text/csv file
	and stores in array for experiment
	modified by joecool890 on 2018-06-09 */
function readTextFile(file, shuffle){
    var rawFile = new XMLHttpRequest();
    rawFile.open("GET", file, true);
    rawFile.onreadystatechange = function (){
        if(rawFile.readyState == 4 && rawFile.status == 200) {
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
readTextFile(trial_matrix_file,1);
console.log(trial_matrix);

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
	// pop off first row in trial matrix
    document.body.style.cursor = 'none';
    console.log(trial_matrix);
    // count trial # of practice
    var prac_trial_count = 0;
    console.log(prac_trial_count);
    /* information for practice trials
       [x][y]
       [x] = row
       [y] = column     */
    prac_trials = trial_matrix;

    // function that dictates stimuli presentation order/duration
    var next = function() {
        var s = Snap("#svgMain");
        s.clear();
        // finish practice
        if (prac_trial_count === prac_length) {
			clearTimeout();
			finish();
		} else {
            show_fixation_original();
			clearTimeout();

			handle01 = setTimeout(function(){
				show_fixation_red();}, 500); // Present this 500 ms after previous
			handle02 = setTimeout(function(){
				show_scene();}, 1000);
			handle03 = setTimeout(function(){
				show_objects();}, 2000);
			handle04 = setTimeout(function(){
			    show_SOA();},3000)
		}
	};

    var finish = function() {
		var s = Snap('#svgMain');
		var between_prac = s.image("/static/images/AfterPrac.png", 0,200);
	};

    //* * Stimuli used in experiment, will repeat for practice and experiment for now
    var show_fixation_original = function(){
        this.s = Snap("#svgMain"); // initiate scalable vector graphics (think of canvas to draw on)
        this.vertical = s.line(center_x-10, center_y, center_x+10, center_y);
        this.vertical.attr({
          id:"fix1",
          stroke: "#ffffff",
          strokeWidth: fixation_width
        });
        this.horizontal = this.s.line(center_x, center_y-10, center_x, center_y+10);
        this.horizontal.attr({
          id:"fix2",
          stroke: "#ffffff",
          strokeWidth: fixation_width
        });

    };

    var show_fixation_red = function(){
        this.s = Snap("#svgMain"); // initiate scalable vector graphics (think of canvas to draw on)
        this.vertical = this.s.line(center_x-10, center_y, center_x+10, center_y);
        this.vertical.attr({
          id:"fix1",
          stroke: "#da2822",
          strokeWidth: fixation_width
        });
        this.horizontal = this.s.line(center_x, center_y-10, center_x, center_y+10);
        this.horizontal.attr({
          id:"fix2",
          stroke: "#da2822",
          strokeWidth: fixation_width
        });
    };

    var show_scene = function() {
        this.s = Snap("#svgMain");
        // this determines what the stimuli is, subtracting 1 for count issue difference (starts at 0)
        this.scene_stim = scene_path[prac_trials[prac_trial_count][index_scene_category]-1];
        this.scene = this.s.image(this.scene_stim, center_x - scene_width/2, center_y - scene_height/2, scene_width, scene_height);
        this.vertical = this.s.line(center_x-10, center_y, center_x+10, center_y);
        this.vertical.attr({
          id:"fix1",
          stroke: "#da2822",
          strokeWidth: fixation_width
        });
        this.horizontal = this.s.line(center_x, center_y-10, center_x, center_y+10);
        this.horizontal.attr({
          id:"fix2",
          stroke: "#da2822",
          strokeWidth: fixation_width
        });
    };

    var show_objects = function() {
        this.s = Snap("#svgMain");
        this.path = "static/images/objects/";
        this.main_object_stim = [prac_trials[prac_trial_count][index_main_object]];
        this.main_object_path = this.path.concat(this.main_object_stim, img_file_ext); // path to image
        this.other_object_stim = [prac_trials[prac_trial_count][index_other_object]];
        this.other_object_path = this.path.concat(this.other_object_stim, img_file_ext); // path to image
        // console.log([prac_trials[prac_trial_count][index_main_object_loc]]);
        if ([prac_trials[prac_trial_count][index_main_object_loc]] === [1]) {
            this.main_object_location_x     = center_x - 200;
            this.main_object_location_y     = center_y - object_height/2;
            this.other_object_location_x    = center_x + 100;
            this.other_object_location_y    = center_y - object_height/2;
        } else {
            this.main_object_location_x     = center_x + 100;
            this.main_object_location_y     = center_y - object_height/2;
            this.other_object_location_x    = center_x - 200;
            this.other_object_location_y    = center_y - object_height/2;
        }
        this.main_object = this.s.image(this.main_object_path, this.main_object_location_x, this.main_object_location_y, object_width, object_height);
        this.other_object = this.s.image(this.other_object_path, this.other_object_location_x, this.other_object_location_y, object_width, object_height);
    };

    var show_SOA = function(){
		var s = Snap('#svgMain');
		s.clear();
		var horizontal = s.line(530,400,550,400);
		horizontal.attr({
		  id:"fix1",
		  stroke: "white",
		  strokeWidth:5
		});
		var vertical = s.line(540, 390, 540, 410);
		vertical.attr({
		  id:"fix2",
		  stroke: "white",
		  strokeWidth:5
		});
        prac_trial_count ++;
        // console.log(prac_trial_count)
		clearTimeout(handle04);

		handle_fin = setTimeout(function(){
		    next()},500);
	};

    // Load the stage.html snippet into the body of the page
	psiTurk.showPage('stage.html');

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