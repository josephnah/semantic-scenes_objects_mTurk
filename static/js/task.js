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
var prac_length = 10;
var pages = [
	"instructions/instruct-ready.html",
	"stage.html",
	"postquestionnaire.html"
];
// sizes of images utilized in experiment
var screen_size         = [1080, 800];
var scene_size          = [640, 512];
var object_size         = 150;
var target_gabor_size   = 50;
var center_gabor_size   = 20;
var object_coordinate   = 200;

// x, y Coordinates for stimuli positioning
var center              = [screen_size[0]/2, screen_size[1]/2];
var left_loc_object     = [center[0] - object_size/2 - object_coordinate, center[1] - object_size/2];
var right_loc_object    = [center[0] - object_size/2 + object_coordinate, center[1] - object_size/2];
var left_loc_gabor      = [center[0] - target_gabor_size/2 - object_coordinate, center[1] - target_gabor_size/2];
var right_loc_gabor     = [center[0] - target_gabor_size/2 + object_coordinate, center[1] - target_gabor_size/2];
var center_loc_gabor    = [center[0] - center_gabor_size/2, center[1] - center_gabor_size/2];
var fixation_width = 5;

psiTurk.preloadPages(pages);

var instructionPages = [ // add as a list as many pages as you like
	"instructions/instruct-ready.html"
];

// object path defined in object presenting function
var img_file_ext    = ".png";

// Labels to make reading files easy
var index_scene_category    = 0;
var index_scene_exemplar    = 1;
var index_main_object       = 2;
var index_other_object      = 3;
var index_main_object_loc   = 4; // should this be random? 2018-07-29
var index_target_loc        = 5;

// Presentation time
var ITI                     = 500;
var scene_display_time      = 1000;
var object_display_time     = 750;
var gabor_display_time      = 200;
var get_response_time       = 2000;

// General function that loads images.
// var Image = function Show_image(image_path, width, height, cx, cy) {
//     // this.image_path = image_path;
//     this.width = width;
//     this.height = height;
//     this.cx = cx - (this.width/2);
//     this.cy = cy - (this.height/2);
//     this.image = s.image(image_path, this.cx, this.cy, this.width, this.height);
// };

var show_fixation = function(){
    this.s = Snap("#svgMain"); // initiate scalable vector graphics (think of canvas to draw on)
    this.vertical = this.s.line(center[0]-10, center[1], center[0]+10, center[1]);
    this.vertical.attr({
      id:"fix1",
      stroke: "#ffffff",
      strokeWidth: fixation_width
    });
    this.horizontal = this.s.line(center[0], center[1]-10, center[0], center[1]+10);
    this.horizontal.attr({
      id:"fix2",
      stroke: "#ffffff",
      strokeWidth: fixation_width
    });
};

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
}
readTextFile(trial_matrix_file,1);
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
    document.body.style.cursor = 'none';

    // count trial # of practice
    var prac_trial_count = 0;
    // randomization for gabor orientations & orientation match
    var orient_match = Math.random();
    var match_determine = Math.random();
    var match;
    var target_ori;
    // information for practice trials [x = row][y = column]
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
            document.removeEventListener("keypress", get_response, false); // Just in case

            show_fixation();
			// clearTimeout(); NOT sure if this is needed

            // setTimeout function activates AFTER inputted time
			disp_scene = setTimeout(function(){
				show_scene();}, ITI);
			disp_objects = setTimeout(function(){
				show_objects();}, ITI + scene_display_time);
			disp_targets = setTimeout(function(){
			    show_gabors();}, ITI + scene_display_time + object_display_time);
            handle05 = setTimeout(function(){
			    show_SOA();}, ITI + scene_display_time + object_display_time + gabor_display_time);
		}
	};

    var finish = function() {
		var s = Snap('#svgMain');
		this.s.image("/static/images/AfterPrac.png", 0,200);
	};

    //* * Stimuli used in experiment, will repeat for practice and experiment for now

    var show_scene = function() {
        this.s = Snap("#svgMain");
        // this determines what the stimuli is, subtracting 1 for count issue difference (starts at 0)
        this.scene_stim = "static/images/scenes/" + [prac_trials[prac_trial_count][index_scene_category]] +"/" +[prac_trials[prac_trial_count][index_scene_exemplar]]+ img_file_ext;
        this.scene = this.s.image(this.scene_stim, center[0] - scene_size[0]/2, center[1] - scene_size[1]/2, scene_size[0], scene_size[1]);
        show_fixation();
    };

    var show_objects = function() {
        this.s = Snap("#svgMain");

        this.main_object_stim   = [prac_trials[prac_trial_count][index_main_object]];
        this.other_object_stim  = [prac_trials[prac_trial_count][index_other_object]];
        this.main_object_path   = "static/images/objects/" + this.main_object_stim + img_file_ext; // path to image
        this.other_object_path  = "static/images/objects/" + this.other_object_stim + img_file_ext; // path to image

        if (parseInt([prac_trials[prac_trial_count][index_main_object_loc]]) === 1) {
            this.main_object_location_x     = left_loc_object[0];
            this.main_object_location_y     = left_loc_object[1];
            this.other_object_location_x    = right_loc_object[0];
            this.other_object_location_y    = right_loc_object[1];
        } else {
            this.main_object_location_x     = right_loc_object[0];
            this.main_object_location_y     = right_loc_object[1];
            this.other_object_location_x    = left_loc_object[0];
            this.other_object_location_y    = left_loc_object[1];
        }

        this.s.image(this.main_object_path, this.main_object_location_x, this.main_object_location_y, object_size[0], object_size[1]);
        this.s.image(this.other_object_path, this.other_object_location_x, this.other_object_location_y, object_size[0], object_size[1]);
    };

    var show_gabors = function() {
        this.s = Snap("#svgMain");
        gabor_onset = new Date().getTime();
        // Determine the orientation of target gabor
        if (orient_match < .5) {
            target_ori = -45;
        } else {
            target_ori = 45;
        }

        // Determine whether gabor orientations match
        if (match_determine < .5) {
            match = 1;
            var center_ori = target_ori;
        } else {
            match = 0;
            var center_ori = -target_ori;
        };
        console.log(match);
        if (parseInt([prac_trials[prac_trial_count][index_target_loc]]) === 1) {
            this.gabor_location = left_loc_gabor
        } else {
            this.gabor_location = right_loc_gabor
        }
        this.target_gabor = this.s.image("static/images/gabors/gabor02.png", this.gabor_location[0], this.gabor_location[1], 50, 50);
        this.center_gabor = this.s.image("static/images/gabors/gabor01.png", center_loc_gabor[0],center_loc_gabor[1], 20, 20);
        // rotates gabor patch
        this.target_gabor.transform("r"+parseInt(target_ori));
        this.center_gabor.transform("r"+parseInt(center_ori));

    };

    var show_SOA = function(){
        this.s = Snap("#svgMain");
        show_scene();
        show_objects();
        show_fixation();

        document.addEventListener("keypress", get_response, false);
        prac_trial_count ++;
        console.log(prac_trial_count);
		clearTimeout(show_gabors);

		handle_fin = setTimeout(function(){
		    next()}, get_response_time);
	};

    var get_response = function (e) {
        if (e.charCode === 102 || e.charCode === 106) { // 102f 106j
            clearTimeout();
            var RT = new Date().getTime() - gabor_onset; // Get RT
            document.removeEventListener("keypress", get_response, false);
            resp = 1;
            console.log("keyPressed= " + e.charCode, "resp:" + resp);

            if (e.charCode === 102 & match === 1) {
                acc = 1;
            } else if (e.charCode === 106 & match === 2) {
                acc = 1;
            } else {
                acc = 0;
            }

        } else {
            resp = 0;

        }
        psiTurk.recordTrialData({"phase": "PRACTICE",
            "trial": prac_trial_count,
            "match" : match,
            "target_ori": target_ori,
            "target_location": [prac_trials[prac_trial_count][index_target_loc]],
            "scene_type": [prac_trials[prac_trial_count][index_scene_category]]
            // "scene_exemplar": null,



        })
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