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
var trial_matrix        = [];
var prac_trial_matrix   = [];
var trial_matrix_file   = "/static/trial-type.csv";
var pages = [
	"instructions/instruct-1.html",
    "instructions/instruct-2.html",
    "instructions/instruct-3.html",
    "instructions/instruct-4.html",
    "instructions/instruct-5.html",
    "instructions/instruct-6.html",
    "instructions/instruct-7.html",
    "instructions/instruct-ready.html",
	"stage.html",
    "survey.html",
	"postquestionnaire.html"
];

// sizes of images utilized in experiment
var screen_size         = [1080, 800];
var scene_size          = [640, 512];
var object_size         = 150;
var target_gabor_size   = 50;
var center_gabor_size   = 20;
var object_coordinate   = 150;

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
    "instructions/instruct-1.html",
    "instructions/instruct-2.html",
    "instructions/instruct-3.html",
    "instructions/instruct-4.html",
    "instructions/instruct-5.html",
    "instructions/instruct-6.html",
    "instructions/instruct-7.html",
    "instructions/instruct-ready.html"
];

// object path defined in object presenting function
var img_file_ext    = ".png";

// Labels to make reading files easy
var index_scene_category    = 0;
var index_scene_exemplar    = 1;
var index_main_object       = 2;
var index_other_object      = 3;
var index_condition         = 4;

// Presentation time
var ITI_time                = 500;
var scene_display_time      = 1000;
var object_display_time     = 750;
var gabor_display_time      = 200;

// Misc. Variables
var prac_length     = 20;
var block_size      = 80;
var total_blocks    = 4;

var show_fixation = function(){
    this.s = Snap("#svgMain"); // initiate scalable vector graphics (think of canvas to draw on)
    this.vertical = this.s.line(center[0]-10, center[1], center[0]+10, center[1]);
    this.horizontal = this.s.line(center[0], center[1]-10, center[0], center[1]+10);
    this.fixation = s.group(this.vertical, this.horizontal);
    this.fixation.attr({
      id:"fix1",
      stroke: "#47ff7a",
      strokeWidth: fixation_width
    });
};

var show_scene = function(scene_source) {
    this.s = Snap("#svgMain");
    this.scene = this.s.image(scene_source, center[0] - scene_size[0]/2, center[1] - scene_size[1]/2, scene_size[0], scene_size[1]);
    show_fixation();
};

/*  Reads and shuffles (if necessary) text/csv file
	and stores in array for experiment
	modified by joecool890 on 2018-06-09 */
function readTextFile(file, shuffle){
    var rawFile = new XMLHttpRequest();
    rawFile.open("GET", file, true);
    rawFile.onreadystatechange = function (){
        if(rawFile.readyState === 4 && rawFile.status === 200) {
            // console.log("ready to extract");
            allText = rawFile.responseText.split("\n");
            allText.map(function(item){
                var tabs = item.split(",");
                trial_matrix.push(tabs);
            });
            if (shuffle === 1) {
            trial_matrix1       = _.shuffle(trial_matrix);
            trial_matrix2       = _.shuffle(trial_matrix);
            prac_trial_matrix   = _.shuffle(trial_matrix);
            trial_matrix = trial_matrix1.concat(trial_matrix2);
            } else {
                trial_matrix1       = trial_matrix;
                trial_matrix2       = trial_matrix;
                prac_trial_matrix   = trial_matrix;
                trial_matrix        = trial_matrix1.concat(trial_matrix2);
            }
        }
    };
    rawFile.send(null);
}
readTextFile(trial_matrix_file,1);

var object_location = [];

/*******************
*  Practice Block  *
*******************/

var practice = function() {
    document.body.style.cursor = 'none';

    // count trial # of practice
    var prac_trial_count = 0;
    // console.log("start of trial:" + prac_trial_count);

    // Array for object location randomization
    for (i = 0; i <= prac_length; i++) {
        object_location[i] = Math.random();
    }

    // initialize gabor orientations & orientation match & main object location variables
    var match;
    var target_ori;
    var main_object_loc;

    // information for practice trials [x = row][y = column]
    prac_trials = prac_trial_matrix;

    // function that dictates stimuli presentation order/duration
    var next = function() {
        this.s = Snap("#svgMain");
        s.clear();
        // finish practice
        if (prac_trial_count === prac_length) {
			clearTimeout();
			finish();
		} else {
            document.removeEventListener("keypress", get_response, false); // Just in case
            show_fixation();
			clearTimeout(); //NOT sure if this is needed
            // console.log(prac_trial_count)
            // setTimeout function activates AFTER inputted time
            // pre-loads images before start of trial (reduces lag)
            images = [
                "static/images/scenes/" + [prac_trials[prac_trial_count][index_scene_category]] +"/" +[prac_trials[prac_trial_count][index_scene_exemplar]]+ img_file_ext,
                "static/images/objects/" + [prac_trials[prac_trial_count][index_main_object]] + img_file_ext,
                "static/images/objects/" + [prac_trials[prac_trial_count][index_other_object]] + img_file_ext

            ];
            psiTurk.preloadImages(images);
			disp_scene = setTimeout(function(){
				show_scene("static/images/scenes/" + [prac_trials[prac_trial_count][index_scene_category]] +"/" +[prac_trials[prac_trial_count][index_scene_exemplar]]+ img_file_ext);}, ITI_time);
			disp_objects = setTimeout(function(){
				show_objects();}, ITI_time + scene_display_time);
			disp_targets = setTimeout(function(){
			    show_gabors();}, ITI_time + scene_display_time + object_display_time);
            if (prac_trial_count >= 10) {
                disp_response = setTimeout(function(){
                    show_SOA();}, ITI_time + scene_display_time + object_display_time + gabor_display_time);
            }

		};
	};

    var finish = function() {
		this.s = Snap('#svgMain');
		this.s.image("/static/images/after_prac.png", center[0] - 1447/2, center[1] - 872/2);
		document.addEventListener("keydown",finishprac, false);
	};

	var finishprac = function(e){
			if (e.keyCode === 32) {
				document.removeEventListener("keydown",finishprac,false);
				currentview = new main_task();
			}
	};

    var show_objects = function() {
        this.s = Snap("#svgMain");
        this.main_object_stim   = [prac_trials[prac_trial_count][index_main_object]];
        this.other_object_stim  = [prac_trials[prac_trial_count][index_other_object]];
        this.main_object_path   = "static/images/objects/" + this.main_object_stim + img_file_ext; // path to image
        this.other_object_path  = "static/images/objects/" + this.other_object_stim + img_file_ext; // path to image

        if (object_location[prac_trial_count] < .5) {
            this.main_object_location_x     = left_loc_object[0];
            this.main_object_location_y     = left_loc_object[1];
            this.other_object_location_x    = right_loc_object[0];
            this.other_object_location_y    = right_loc_object[1];
            main_object_loc                 = 1
        } else {
            this.main_object_location_x     = right_loc_object[0];
            this.main_object_location_y     = right_loc_object[1];
            this.other_object_location_x    = left_loc_object[0];
            this.other_object_location_y    = left_loc_object[1];
            main_object_loc                 = 2
        }

        this.s.image(this.main_object_path, this.main_object_location_x, this.main_object_location_y, object_size[0], object_size[1]);
        this.s.image(this.other_object_path, this.other_object_location_x, this.other_object_location_y, object_size[0], object_size[1]);
    };

    var show_gabors = function() {
        this.s = Snap("#svgMain");
        var orient_match    = Math.random();
        var match_determine = Math.random();

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
        }
        // console.log(match);
        // figure out condition and where gabor should be
        if (parseInt([prac_trials[prac_trial_count][index_condition]]) === 1 && main_object_loc === 1) {
            this.gabor_location         = left_loc_gabor;
            this.distractor_location    = right_loc_gabor;
        } else if (parseInt([prac_trials[prac_trial_count][index_condition]]) === 1 && main_object_loc === 2) {
            this.gabor_location         = right_loc_gabor;
            this.distractor_location    = left_loc_gabor;
        } else if (parseInt([prac_trials[prac_trial_count][index_condition]]) === 2 && main_object_loc === 1) {
            this.gabor_location         = right_loc_gabor;
            this.distractor_location    = left_loc_gabor;
        } else if (parseInt([prac_trials[prac_trial_count][index_condition]]) === 2 && main_object_loc === 2) {
            this.gabor_location         = left_loc_gabor;
            this.distractor_location    = right_loc_gabor;
        }

        this.target_gabor   = this.s.image("static/images/gabors/gabor01.png", this.gabor_location[0], this.gabor_location[1], target_gabor_size, target_gabor_size);
        this.center_gabor   = this.s.image("static/images/gabors/gabor02.png", center_loc_gabor[0],center_loc_gabor[1], center_gabor_size, center_gabor_size);
        this.distract_gabor = this.s.image("static/images/gabors/distractor.png", this.distractor_location[0],this.distractor_location[1], target_gabor_size, target_gabor_size);

        // rotates gabor patch
        this.target_gabor.transform("r"+parseInt(target_ori));
        this.center_gabor.transform("r"+parseInt(center_ori));

        if (prac_trial_count < 10) {
            document.addEventListener("keypress", get_response, false);
            // console.log("hi");
            prac_trial_count ++;
            console.log("end of trial:" + prac_trial_count);

        }

    };
    // need to figure out how to exit this when no keypress
    var show_SOA = function(){
        this.s = Snap("#svgMain");
        show_scene("static/images/scenes/" + [prac_trials[prac_trial_count][index_scene_category]] +"/" +[prac_trials[prac_trial_count][index_scene_exemplar]]+ img_file_ext);
        show_objects();
        show_fixation();

        document.addEventListener("keypress", get_response, false);

        prac_trial_count ++;
        // console.log("end of trial:" + prac_trial_count);
        clearTimeout(show_gabors);
	};

    // need to restrict key press to f and j
    var get_response = function (e) {
        if (e.charCode === 102 || e.charCode === 106) { // 102 = f 106 = j
            skip_soa = 1;
            var RT = new Date().getTime() - gabor_onset; // Get RT
            document.removeEventListener("keypress", get_response, false);
            resp = 1;


            if (e.charCode === 102 & match === 1) {
                acc = 1;
            } else if (e.charCode === 106 & match === 0) {
                acc = 1;
            } else {
                acc = 0;
            }
            // console.log("keyPressed: " + e.charCode, ", resp:" + resp + ", Acc: " + acc + ", RT: " + RT);

            var ITI = function(){
                this.s = Snap("#svgMain");
                s.clear();
                if (acc === 1) {
                    show_fixation();
                } else if (acc === 0) {
                    show_fixation();
                    this.fixation.attr({
                        stroke: "#da2822"
                    });
                }
                handle_fin = setTimeout(function(){
                    rest()}, 500);
            };
            ITI();
        };
    };

    // inform participants of break between practice trials
    var rest = function() {
        if (prac_trial_count === 10 && prac_trial_count !== prac_length) {
            this.s = Snap("#svgMain");
            s.clear();
            var info = "Now the 2nd half of practice will be at the normal speed. Press space to continue.";
            var infotext = s.text(320,320,info).attr({'fill' : 'white',  'stroke': 'white', 'stroke-width': 0.6});
            document.addEventListener("keypress",nextblock,false);
        } else {
            next();
        }
    };

    var nextblock = function(e){
        if (e.keyCode == 32){
            document.removeEventListener("keypress",nextblock,false);
            clearTimeout();
            next();
        }
    };

    // Load the stage.html snippet into the body of the page
	psiTurk.showPage('stage.html');

	next();

};


/*****************
 *   Main Task   *
 *****************/

var main_task = function() {
    psiTurk.preloadImages(images);
    document.body.style.cursor = 'none';
    var exp_length = trial_matrix.length;
    // console.log(exp_length);
    // count trial # of practice
    var trial_count = 0;
    var block       = 1;
    // console.log("start of trial:" + trial_count);

    // Array for object location randomization
    for (i = 0; i <= exp_length; i++) {
        object_location[i] = Math.random();
    }

    // randomization for gabor orientations & orientation match
    var match;
    var target_ori;
    var main_object_loc;
    // information for practice trials [x = row][y = column]
    exp_trials = trial_matrix;
    //console.log(exp_trials);

    // function that dictates stimuli presentation order/duration
    var next = function() {
        var s = Snap("#svgMain");
        s.clear();
        // finish practice
        if (trial_count === exp_length) {
			clearTimeout();
			finish();
		} else {
            document.removeEventListener("keypress", get_response, false); // Just in case
            show_fixation();
			clearTimeout(); //NOT sure if this is needed
            images = [
                "static/images/scenes/" + [exp_trials[trial_count][index_scene_category]] +"/" +[exp_trials[trial_count][index_scene_exemplar]]+ img_file_ext,
                "static/images/objects/" + [exp_trials[trial_count][index_main_object]] + img_file_ext,
                "static/images/objects/" + [exp_trials[trial_count][index_other_object]] + img_file_ext
            ];
            psiTurk.preloadImages(images);
            // setTimeout function activates AFTER inputted time
			disp_scene = setTimeout(function(){
				show_scene("static/images/scenes/" + [exp_trials[trial_count][index_scene_category]] +"/" +[exp_trials[trial_count][index_scene_exemplar]]+ img_file_ext);}, ITI_time);
			disp_objects = setTimeout(function(){
				show_objects();}, ITI_time + scene_display_time);
			disp_targets = setTimeout(function(){
			    show_gabors();}, ITI_time + scene_display_time + object_display_time);
            disp_response = setTimeout(function(){
			    show_SOA();}, ITI_time + scene_display_time + object_display_time + gabor_display_time);
		}
	};

    var finish = function() {
		this.s = Snap('#svgMain');
        this.s.image("/static/images/after_exp.png", center[0] - 1447/2, center[1] - 872/2);
		document.addEventListener("keydown",to_survey, false);
	};

    var to_survey = function(e){
        if (e.keyCode == 32) {
            document.removeEventListener("keydown",to_survey,false);
            currentview = new survey();
        }
    };

    var show_objects = function() {
        this.s = Snap("#svgMain");

        this.main_object_stim   = [exp_trials[trial_count][index_main_object]];
        this.other_object_stim  = [exp_trials[trial_count][index_other_object]];
        this.main_object_path   = "static/images/objects/" + this.main_object_stim + img_file_ext; // path to image
        this.other_object_path  = "static/images/objects/" + this.other_object_stim + img_file_ext; // path to image

        if (object_location[trial_count] < .5) {
            this.main_object_location_x     = left_loc_object[0];
            this.main_object_location_y     = left_loc_object[1];
            this.other_object_location_x    = right_loc_object[0];
            this.other_object_location_y    = right_loc_object[1];
            main_object_loc                 = 1

        } else {
            this.main_object_location_x     = right_loc_object[0];
            this.main_object_location_y     = right_loc_object[1];
            this.other_object_location_x    = left_loc_object[0];
            this.other_object_location_y    = left_loc_object[1];
            main_object_loc                 = 2

        }

        this.s.image(this.main_object_path, this.main_object_location_x, this.main_object_location_y, object_size[0], object_size[1]);
        this.s.image(this.other_object_path, this.other_object_location_x, this.other_object_location_y, object_size[0], object_size[1]);
    };

    var show_gabors = function() {
        this.s = Snap("#svgMain");
        var orient_match    = Math.random();
        var match_determine = Math.random();

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
        }

        // figure out condition and where gabor should be
        if (parseInt([exp_trials[trial_count][index_condition]]) === 1 && main_object_loc === 1) {
            this.gabor_location         = left_loc_gabor;
            this.distractor_location    = right_loc_gabor;
        } else if (parseInt([exp_trials[trial_count][index_condition]]) === 1 && main_object_loc === 2) {
            this.gabor_location         = right_loc_gabor;
            this.distractor_location    = left_loc_gabor;
        } else if (parseInt([exp_trials[trial_count][index_condition]]) === 2 && main_object_loc === 1) {
            this.gabor_location         = right_loc_gabor;
            this.distractor_location    = left_loc_gabor;
        } else if (parseInt([exp_trials[trial_count][index_condition]]) === 2 && main_object_loc === 2) {
            this.gabor_location         = left_loc_gabor;
            this.distractor_location    = right_loc_gabor;
        }

        this.target_gabor   = this.s.image("static/images/gabors/gabor01.png", this.gabor_location[0], this.gabor_location[1], target_gabor_size, target_gabor_size);
        this.center_gabor   = this.s.image("static/images/gabors/gabor02.png", center_loc_gabor[0],center_loc_gabor[1], center_gabor_size, center_gabor_size);
        this.distract_gabor = this.s.image("static/images/gabors/distractor.png", this.distractor_location[0],this.distractor_location[1], target_gabor_size, target_gabor_size);

        // rotates gabor patch
        this.target_gabor.transform("r"+parseInt(target_ori));
        this.center_gabor.transform("r"+parseInt(center_ori));

    };
    // need to figure out how to exit this when no keypress
    var show_SOA = function(){
        this.s = Snap("#svgMain");
        gabor_offset = new Date().getTime(); // Start recording for RT

        show_scene("static/images/scenes/" + [exp_trials[trial_count][index_scene_category]] +"/" +[exp_trials[trial_count][index_scene_exemplar]]+ img_file_ext);
        show_objects();
        show_fixation();

        document.addEventListener("keypress", get_response, false);

        // console.log("end of trial:" + prac_trial_count);
        // clearTimeout(show_gabors);
	};

    // need to restrict key press to f and j
    var get_response = function (e) {
        if (e.charCode === 102 || e.charCode === 106) { // 102 = f 106 = j

            var RT = new Date().getTime() - gabor_offset; // Get RT
            document.removeEventListener("keypress", get_response, false);
            resp = 1;


            if (e.charCode === 102 & match === 1) {
                acc = 1;
                keyPressed = 102;
            } else if (e.charCode === 106 & match === 0) {
                acc = 1;
                keyPressed = 106;
            } else {
                acc = 0;
                keyPressed = e.charCode;
            }
            // console.log("keyPressed: " + e.charCode, ", resp:" + resp + ", Acc: " + acc + ", RT: " + RT);
            // console.log("block: " + block, ", trial:" + trial_count, ", condition: " + parseFloat([exp_trials[trial_count][index_condition]]));

            psiTurk.recordTrialData({"phase": "EXPERIMENT",
                "exp_mode": 1,
                "block": block,
                "trial": trial_count,
                "match": match,
                "target_ori": target_ori,
                "condition": parseFloat([exp_trials[trial_count][index_condition]]),
                "main_obj": parseFloat([exp_trials[trial_count][index_main_object]]),
                "other_obj": parseFloat([exp_trials[trial_count][index_other_object]]),
                "main_obj_loc": main_object_loc,
                "scene_type": parseFloat([exp_trials[trial_count][index_scene_category]]),
                "scene_exemplar": parseFloat([exp_trials[trial_count][index_scene_exemplar]]),
                "accuracy": acc,
                "RT": RT,
                "pressedKey": keyPressed,
                "resp": resp
            });

            var ITI = function(){
                this.s = Snap("#svgMain");
                s.clear();
                if (acc === 1) {
                    show_fixation();
                } else if (acc === 0) {
                    show_fixation();
                    this.fixation.attr({
                        stroke: "#da2822"
                    });
                }
                handle_fin = setTimeout(function(){
                    rest()}, 500);
            };
            trial_count ++;
            ITI();
        };


    };

    // Adds rest inbetween blocks
    var rest = function() {
        if (trial_count % block_size === 0 && trial_count !== exp_length) {
            this.s = Snap("#svgMain");
            s.clear();
            var block_count = trial_count/block_size;
            var progress = total_blocks - block_count;
            var str1 = progress.toString();
            var str2 = " out of 4 blocks left. Please take a break. Press spacebar to continue";
            var info = str1.concat(str2);
            var infotext = s.text(320,320,info).attr({'fill' : 'white',  'stroke': 'white', 'stroke-width': 0.6});
            document.addEventListener("keypress",nextblock,false);
            block ++;
        } else {
            next();
        }
    };

    var nextblock = function(e){
        if (e.keyCode == 32){
            document.removeEventListener("keypress",nextblock,false);
            clearTimeout();
            next();
        }
    };

    // Load the stage.html snippet into the body of the page
	psiTurk.showPage('stage.html');

	next();

};

var survey = function() {
    document.body.style.cursor = "default";

	psiTurk.showPage('survey.html');
    // load your iframe with a url specific to your participant
    $('#iframe').attr('src','https://columbiangwu.co1.qualtrics.com/jfe/form/SV_4UdLvABaB7rOwQt?uniqueId=' + uniqueId);
    // add the all-important message event listener
    window.addEventListener('message', function(event){

        // normally there would be a security check here on event.origin (see the MDN link above), but meh.
        if (event.data) {
            if (typeof event.data === 'string') {
                q_message_array = event.data.split('|');
                // console.log(q_message_array);
                if (q_message_array[0] == 'QualtricsEOS') {
                    psiTurk.recordTrialData({'phase':'SURVEY', 'status':'back_from_qualtrics'});
                    psiTurk.recordUnstructuredData('qualtrics_session_id', q_message_array[2]);
                }
            }
        };
        current_view = setTimeout(function(){
				new Questionnaire()}, 1500);
    })
};
/****************
* Post-experiment Questionnaire
*
* Participants will need to answer this at the end to successfully complete their HIT.
* Asks basic questions (age, gender, strategy, difficulty, etc)
* Edit the "questionnaire.html" file in templates folder to add/remove questions
* Check "style.css" file in static/css folder for formatting issues
****************/

var Questionnaire = function() {
    document.body.style.cursor = "default";

	var error_message = "<h1>Oops!</h1><p>Something went wrong submitting your HIT. This might happen if you lose your internet connection. Press the button to resubmit.</p><button id='resubmit'>Resubmit</button>";

	record_responses = function() {

		psiTurk.recordTrialData({'phase':'postquestionnaire', 'status':'submit'});

		$('textarea').each( function(i, val) {
			psiTurk.recordUnstructuredData(this.id, this.value);
		});
		$('select').each( function(i, val) {
			psiTurk.recordUnstructuredData(this.id, this.value);
		});
		$('input').each( function(i, val) {
			psiTurk.recordUnstructuredData(this.id, this.value);
		});
	};

	prompt_resubmit = function() {
		document.body.innerHTML = error_message;
		$("#resubmit").click(resubmit);
	};

	resubmit = function() {
		document.body.innerHTML = "<h1>Trying to resubmit...</h1>";
		reprompt = setTimeout(prompt_resubmit, 10000);

		psiTurk.saveData({
			success: function() {
			    clearInterval(reprompt);
                //psiTurk.computeBonus('compute_bonus', function(){finish()});
                finish();
			},
			error: prompt_resubmit
		});
	};

	// Load the questionnaire snippet
	psiTurk.showPage('postquestionnaire.html');
	psiTurk.recordTrialData({'phase':'postquestionnaire', 'status':'begin'});

	$("#next").click(function () {
	    record_responses();
	    psiTurk.saveData({
            success: function(){
                //psiTurk.computeBonus('compute_bonus', function() {
                	psiTurk.completeHIT(); // when finished saving compute bonus, the quit
                //});
            },
            error: prompt_resubmit});
	});

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