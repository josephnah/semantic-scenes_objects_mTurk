/*
 * Requires:
 *     psiturk.js
 *     utils.js
 */

// Initalize psiturk object
var psiTurk = new PsiTurk(uniqueId, adServerLoc, mode);


// Define variables used in experiment
var mycondition = condition;  // these two variables are passed by the psiturk server process
var mycounterbalance = counterbalance;  // they tell you which condition you have been assigned to
var trial_matrix
// they are not used in the stroop code but may be useful to you

// All pages to be loaded
var pages = [
	"instructions/instruct-1.html",
	"instructions/instruct-2.html",
	"instructions/instruct-3.html",
	"instructions/instruct-4.html",
	"instructions/instruct-5.html",
	"instructions/instruct-ready.html",
	"stage.html",
	"postquestionnaire.html"
];

psiTurk.preloadPages(pages);

var instructionPages = [ // add as a list as many pages as you like
	"instructions/instruct-1.html",
	"instructions/instruct-2.html",
	"instructions/instruct-3.html",
	"instructions/instruct-4.html",
	"instructions/instruct-5.html",
	"instructions/instruct-ready.html"
];


/********************
* HTML manipulation
*
* All HTML files in the templates directory are requested 
* from the server when the PsiTurk object is created above. We
* need code to get those pages from the PsiTurk object and 
* insert them into the document.
*
********************/

/********************
* Practice block     *
********************/

var Practice1 = function() {
	// call + read textfile (prob needed for trial information, etc)
	function readTextFile(file){
		var rawFile = new XMLHttpRequest();
		rawFile.open("GET", file, false); // true for asynchronous request
		rawFile.onreadystatechange = function() {
			if(rawFile.readyState === 4 && rawFile.status === 200) {
				allText = rawFile.responseText.split("\n");
				//allText = rawFile.responseText.toString().split("\n");
				//console.log(allText);
				var arr1 = [];
				var arr2 = [];
				var arr3 = [];
				var arr4 = [];
				var arr5 = [];
				//var arr6 = [];
				arr6 = new Array(40);
				for (var i = 0; i < 40; i++) {
					arr6[i] = new Array(2);
				}
				allText.map(function(item){
				  var tabs = item.split('\t');
				  console.log(tabs[0].length);
				  arr1.push(tabs[0]);
				  arr1.push(tabs[1]);
				  arr1.push(tabs[2]);
				  arr1.push(tabs[3]);
				  arr1.push(tabs[4]);
				  arr1.push(tabs[5]);
				  arr1.push(tabs[6]);
				  arr1.push(tabs[7]);
				  arr1.push(tabs[8]);
				});
				//alert(arr1);
				input = [];
				var locs = [];
				var tab = [];
				for (var i = 0; i < 400; i++){
					for (var j = 0; j<9; j++){
						tab[j] = parseFloat(arr1[9*i+j]);
					};
					input[i] = [tab[0],tab[1],tab[2],tab[3],tab[4],tab[5],tab[6],tab[7],tab[8]];

				};
				//alert(input);
				//console.log(input);
				for (var m = 0; m < 10; m++){
					for (var i = 0; i < 6; i++){
						for (var j = 0; j < 5; j++){
							arr6[5*i+j][0]=i+1;
							arr6[5*i+j][1]=j+1;
						//i+1 t_loc; j+1 t_d_distance
						};
					};
					for (var n = 0; n < 10; n ++){
						var a = Math.floor((Math.random() * 6) + 1);
						var b = Math.floor((Math.random() * 5) + 1);
						 arr6[30+n][0]=a;
						 arr6[30+n][1]=b;
					};
					var loc = [];
					loc = _.shuffle(arr6);
					//alert(loc);
					for (var i = 0; i < 40; i++){
						locs[40*m+i]=loc[i];
					};
				};

				var first = [];
				var t_loc = [];
				var d_loc = [];
				stimuli = [];
				for (var h = 0; h < 400; h++){
					first = input[h];
					//console.log(first);
					t_loc = locs[h][0];
					d_loc = locs[h][1];
					//console.log(second);
					first.push(t_loc);
					first.push(d_loc);
					stimuli[h] =first;
				};
				//console.log(stimuli);
				// }
			}
		}
		rawFile.send(null);
	};

	// Reads and shuffles (if necessary) text/csv file
	// modified by joecool890 on 2018-06-09
	function readTextFile2(file, shuffle){
        var rawFile = new XMLHttpRequest();
        rawFile.open("GET", file, true);
        rawFile.onreadystatechange = function (){
            // Check status of file, proceed if everything is ready
            if(rawFile.readyState === 4 && rawFile.status === 200) {
                allText     = rawFile.responseText.split("\n");
                var arr1    = [];
                allText.map(function(item){
                    var tabs = item.split(",");
                    arr1.push(tabs);
                });
                final_matrix = [];
                // Specify whether array needs shuffling
                if (shuffle === 1){
                    trial_matrix = _.shuffle(arr1)
                } else {
                    trial_matrix = arr1;
                }

                console.log(trial_matrix);
                }
        };
        rawFile.send(null);
    };

    readTextFile2("/static/Trial_Type.txt",1);
	// readTextFile2("/static/colorSpace.txt",0);

	var wordon, // time search is presented
	    listening = false;

	//0 tgt_r 1 tgt_g 2 tgt_b 3 dis_r 4 dis_g 5 dis_b 6 rotation 7 tgt_deg 8 dis_deg 9 t_loc 10 d_loc

	stims = stimuli;
	//console.log(stims);
	stims = _.shuffle(stimuli);
	pracstims = stims.slice(0, 10);
	//console.log(stims);
	//console.log(condition);

	var next = function() {
		if (pracstims.length === 0) {
			var s = Snap('#svgMain');
			s.clear();
			clearTimeout(handle7);
			finish();
		}
		else {
			var s = Snap('#svgMain');
			s.clear();
			stim = pracstims.shift();
			//console.log(stim);
			show_fixation();
			clearTimeout();
			handle = setTimeout(function(){
				show_cue();},500);
			handle2 = setTimeout(function(){
				SOA1();},2000);
			handle3 = setTimeout(function(){
				show_word();},3000);
			handle4 = setTimeout(function(){
				SOA2()},7000);
			handle5 = setTimeout(function(){
				show_probe()},7500);
			document.removeEventListener("click",getClickPosition, false);
		}
	};

	var response_handler = function(e) {
		if (!listening) return;

		var keyCode = e.keyCode,
			response;
			//console.log(keyCode);
		switch (keyCode) {
			case 69:
				// "E"
				if (condition == 0){
					response="left";
					break;
				};
				if (condition == 1){
					response="left";
					break;
				};
			case 70:
				// "F"
				if (condition == 0){
					response="right";
					break;
				};
				if (condition == 1){
					response="right";
					break;
				};
			default:
				response = "";
				break;
		}
		if (response.length>0) {
			listening = false;
			var hit = response == acc_resp;
			//console.log(hit);
			var rt = new Date().getTime() - wordon;
			if ( rt < 3500){
				psiTurk.recordTrialData({'phase':"PRAC",
										 'tgt_clr': stim[7],
										 'dis_clr':stim[8],
										 'rotation':stim[6],
										 'trial#':0,
										 'tgt_loc': stim[9],
										 't_d_dis': stim[10],
										 'condition': condition,//control for response bias
										 'acc_resp':acc_resp,
										 'response':response,
										 'hit':hit,
										 'rt':rt}
									   );
			   };
			clearTimeout(handle4);
			clearTimeout(handle5);
            SOA1();
            handle6 = setTimeout(function(){
				show_probe()},1000);
		}
	};

	var finish = function() {
		var s = Snap('#svgMain');
		var between_prac = s.image("/static/images/BetweenPrac.png", 0,200);
		$("body").unbind("keydown", response_handler); // Unbind keys
		document.addEventListener("keydown",finishprac, false);
	};

	var finishprac = function(e){
			if (e.keyCode == 32) {
				document.removeEventListener("keydown",finishprac,false);
				currentview = new Practice2();
			}
		};



	var circle_locs = Array(
					Array(540,260),
					Array(661,330),
					Array(661,470),
					Array(540,540),
					Array(419,470),
					Array(419,330)
					);

	var get_lure_loc = function(){
		var t_loc = stim[9];
		var svgdim = document.getElementById("svgMain").getBoundingClientRect();
		switch (t_loc) {
			case 1:
				var circledim = document.getElementById("circle1").getBoundingClientRect();
				break;
			case 2:
				var circledim = document.getElementById("circle2").getBoundingClientRect();
				break;
			case 3:
				var circledim = document.getElementById("circle3").getBoundingClientRect();
				break;
			case 4:
				var circledim = document.getElementById("circle4").getBoundingClientRect();
				break;
			case 5:
				var circledim = document.getElementById("circle5").getBoundingClientRect();
				break;
			case 6:
				var circledim = document.getElementById("circle6").getBoundingClientRect();
				break;
			};
		//console.log(circledim);
		circle_x = circledim.left-svgdim.left+circledim.width/2;
		circle_y = circledim.top-svgdim.top+circledim.width/2;
		var x0 = circle_x;
		//console.log(x0);
		var y0 = circle_y;
		//console.log(y0);
		lure_deg = 45+Math.round(Math.random())*90;
		//console.log(lure_deg);
		if (lure_deg==135){
			acc_resp = "left";
		};
		if (lure_deg==45){
			acc_resp = "right";
		};
		var x1 = x0 + 40* Math.cos(lure_deg / 180 * Math.PI - Math.PI / 2);
		var y1 = y0 + 40* Math.sin(lure_deg / 180 * Math.PI - Math.PI / 2);
		var x2 = x0 - 40* Math.cos(lure_deg / 180 * Math.PI - Math.PI / 2);
		var y2 = y0 - 40* Math.sin(lure_deg / 180 * Math.PI - Math.PI / 2);
		var locs = [x1, y1, x2, y2];
		//console.log(locs);

		return locs;
	};

	var get_cue_loc = function(){
		a0 = 540;
		b0 = 400;
		var cue_deg = stim[0];
		var a1 = a0 + 40* Math.cos(cue_deg / 180 * Math.PI - Math.PI / 2);
		var b1 = b0 + 40* Math.sin(cue_deg / 180 * Math.PI - Math.PI / 2);
		var a2 = a0 - 40* Math.cos(cue_deg / 180 * Math.PI - Math.PI / 2);
		var b2 = b0 - 40* Math.sin(cue_deg / 180 * Math.PI - Math.PI / 2);
		var locs = [a1, b1, a2, b2];
		return locs;
	};



	var show_fixation = function(){
		document.body.style.cursor = 'none';
		var event = $(document).click(function(e) {
			e.stopPropagation();
			e.preventDefault();
			e.stopImmediatePropagation();
			return false;
		});
		var s = Snap('#svgMain');
		var horizontal = s.line(520,400,560,400);
		horizontal.attr({
		  id:"fix1",
		  stroke: "rgb(255, 255, 255)",
		  strokeWidth:10
		});
		var vertical = s.line(540, 380, 540, 420);
		vertical.attr({
		  id:"fix2",
		  stroke: "rgb(255, 255, 255)",
		  strokeWidth:10
		});
	};

	var SOA1 = function(){
		var s = Snap('#svgMain');
		s.clear();
		var background = s.circle(540, 400, 50);
		background.attr({
		  id: "soa",
		  fill: "none",
		  stroke:"black",
		  strokeWidth:10
		})
	};

	var SOA2 = function(){
		listening = false;
		var s = Snap('#svgMain');
		s.clear();
		var background = s.circle(540, 400, 50);
		background.attr({
		  id: "soa2",
		  fill: "none",
		  stroke:"black",
		  strokeWidth:10
		})
		psiTurk.recordTrialData({'phase':"PRAC",
										 'tgt_clr': stim[7],
										 'dis_clr':stim[8],
										 'rotation':stim[6],
										 'trial#':0,
										 'tgt_loc': stim[9],
										 't_d_dis': stim[10],
										 'condition': condition,//control for response bias
										 'acc_resp':acc_resp,
										 'response':'none',
										 'hit':'false',
										 'rt':0}
                                   );
	};

	var show_cue = function(){
		var s = Snap('#svgMain');
		s.clear();
		var r = stim[0];
		var g = stim[1];
		var b = stim[2];
		var str1 = 'rgb(';
		var str2 = ',';
		var str3 = ')';
		var tgt_clr = str1.concat(r.toString(), str2, g.toString(), str2, b.toString(), str3);
		var circle1 = s.circle(540, 400, 50);
		circle1.attr({
		  id:"cue",
		  fill: tgt_clr,
		  stroke:tgt_clr,
		  strokeWidth:10
		});
		var cue_ins = s.image("/static/images/CueInstruction.png",315,500);
	};


	var show_word = function() {
		var s = Snap('#svgMain');
		s.clear();
		if (condition == 0){
			var search_ins = s.image("/static/images/SearchInstruction1.png",214,600);
		};
		if (condition == 1){
			var search_ins = s.image("/static/images/SearchInstruction2.png",214,600);
		};
		var colorstroke = ["white", "white", "white","white","white", "white"];
		var colorfill = ["none", "none", "none","none","none","none"];
		//console.log(acc_resp);
		var t_loc = stim[9];
		var t_d_dist = stim[10];
		lure_loc = t_loc + t_d_dist;
		if (lure_loc > 6){
			lure_loc = lure_loc-6;
		};
		var dr = stim[3];
		var dg = stim[4];
		var db = stim[5];
		var str1 = 'rgb(';
		var str2 = ',';
		var str3 = ')';
		var dis_clr = str1.concat(dr.toString(), str2, dg.toString(), str2, db.toString(), str3);
		//console.log(dis_clr);
		colorstroke[lure_loc-1] = dis_clr;
		colorfill[lure_loc-1] = dis_clr;
		//console.log(colorstroke);
		//console.log(colorfill);
		var circle1 = s.circle(circle_locs[0][0], circle_locs[0][1], 50);
		circle1.attr({
		  id:"circle1",
		  fill: colorfill[0],
		  stroke:colorstroke[0],
		  strokeWidth:10
		});
		var circle2 = s.circle(circle_locs[1][0], circle_locs[1][1], 50);
		circle2.attr({
			id:"circle2",
			fill: colorfill[1],
			stroke:colorstroke[1],
			strokeWidth:10
		});

		var circle3 = s.circle(circle_locs[2][0], circle_locs[2][1], 50);
		circle3.attr({
			id:"circle3",
			fill: colorfill[2],
			stroke:colorstroke[2],
			strokeWidth:10
		});

		var circle4 = s.circle(circle_locs[3][0], circle_locs[3][1], 50);
		circle4.attr({
			id: "circle4",
			fill: colorfill[3],
			stroke:colorstroke[3],
			strokeWidth:10
		});

		var circle5 = s.circle(circle_locs[4][0], circle_locs[4][1], 50);
		circle5.attr({
			id:"circle5",
			fill: colorfill[4],
			stroke:colorstroke[4],
			strokeWidth:10
		});
		var circle6 = s.circle(circle_locs[5][0], circle_locs[5][1], 50);
		circle6.attr({
			id:"circle6",
			fill: colorfill[5],
			stroke:colorstroke[5],
			strokeWidth:10
		});
		var rand_rot = [0, 10, 20, 30, 40, 50];
		var rand = rand_rot[Math.floor(Math.random() * rand_rot.length)];
		rand_str = rand.toString();
		var str1 = 'R';
		var str2 = ', 540, 400';
		var str = str1.concat(rand_str,str2);
		//console.log(str);
		circle1.transform(str);
		circle2.transform(str);
		circle3.transform(str);
		circle4.transform(str);
		circle5.transform(str);
		circle6.transform(str);

		var svgdim = document.getElementById("svgMain").getBoundingClientRect();
		circledim = document.getElementById("circle1").getBoundingClientRect();
		circle_x = circledim.left-svgdim.left+circledim.width/2;
		circle_y = circledim.top-svgdim.top+circledim.width/2;
		var x0 = circle_x;
		var y0 = circle_y;
		lure_deg = Math.round(Math.random()+1)*90;
		var x1 = x0 + 40* Math.cos(lure_deg / 180 * Math.PI - Math.PI / 2);
		var y1 = y0 + 40* Math.sin(lure_deg / 180 * Math.PI - Math.PI / 2);
		var x2 = x0 - 40* Math.cos(lure_deg / 180 * Math.PI - Math.PI / 2);
		var y2 = y0 - 40* Math.sin(lure_deg / 180 * Math.PI - Math.PI / 2);
		var line1 = s.line(x1,y1,x2,y2);
		line1.attr({
			 id:"line1",
			 stroke: "white",
			 strokeWidth:10
		});

		circledim = document.getElementById("circle2").getBoundingClientRect();
		circle_x = circledim.left-svgdim.left+circledim.width/2;
		circle_y = circledim.top-svgdim.top+circledim.width/2;
		var x0 = circle_x;
		var y0 = circle_y;
		lure_deg = Math.round(Math.random()+1)*90;
		var x1 = x0 + 40* Math.cos(lure_deg / 180 * Math.PI - Math.PI / 2);
		var y1 = y0 + 40* Math.sin(lure_deg / 180 * Math.PI - Math.PI / 2);
		var x2 = x0 - 40* Math.cos(lure_deg / 180 * Math.PI - Math.PI / 2);
		var y2 = y0 - 40* Math.sin(lure_deg / 180 * Math.PI - Math.PI / 2);
		var line2 = s.line(x1,y1,x2,y2);
		line2.attr({
			 id:"line2",
			 stroke: "white",
			 strokeWidth:10
		});

		circledim = document.getElementById("circle3").getBoundingClientRect();
		circle_x = circledim.left-svgdim.left+circledim.width/2;
		circle_y = circledim.top-svgdim.top+circledim.width/2;
		var x0 = circle_x;
		var y0 = circle_y;
		lure_deg = Math.round(Math.random()+1)*90;
		var x1 = x0 + 40* Math.cos(lure_deg / 180 * Math.PI - Math.PI / 2);
		var y1 = y0 + 40* Math.sin(lure_deg / 180 * Math.PI - Math.PI / 2);
		var x2 = x0 - 40* Math.cos(lure_deg / 180 * Math.PI - Math.PI / 2);
		var y2 = y0 - 40* Math.sin(lure_deg / 180 * Math.PI - Math.PI / 2);
		var line3 = s.line(x1,y1,x2,y2);
		line3.attr({
			 id:"line3",
			 stroke: "white",
			 strokeWidth:10
		});

		circledim = document.getElementById("circle4").getBoundingClientRect();
		circle_x = circledim.left-svgdim.left+circledim.width/2;
		circle_y = circledim.top-svgdim.top+circledim.width/2;
		var x0 = circle_x;
		var y0 = circle_y;
		lure_deg = Math.round(Math.random()+1)*90;
		var x1 = x0 + 40* Math.cos(lure_deg / 180 * Math.PI - Math.PI / 2);
		var y1 = y0 + 40* Math.sin(lure_deg / 180 * Math.PI - Math.PI / 2);
		var x2 = x0 - 40* Math.cos(lure_deg / 180 * Math.PI - Math.PI / 2);
		var y2 = y0 - 40* Math.sin(lure_deg / 180 * Math.PI - Math.PI / 2);
		var line4 = s.line(x1,y1,x2,y2);
		line4.attr({
			 id:"line4",
			 stroke: "white",
			 strokeWidth:10
		});

		circledim = document.getElementById("circle5").getBoundingClientRect();
		circle_x = circledim.left-svgdim.left+circledim.width/2;
		circle_y = circledim.top-svgdim.top+circledim.width/2;
		var x0 = circle_x;
		var y0 = circle_y;
		lure_deg = Math.round(Math.random()+1)*90;
		var x1 = x0 + 40* Math.cos(lure_deg / 180 * Math.PI - Math.PI / 2);
		var y1 = y0 + 40* Math.sin(lure_deg / 180 * Math.PI - Math.PI / 2);
		var x2 = x0 - 40* Math.cos(lure_deg / 180 * Math.PI - Math.PI / 2);
		var y2 = y0 - 40* Math.sin(lure_deg / 180 * Math.PI - Math.PI / 2);
		var line5 = s.line(x1,y1,x2,y2);
		line5.attr({
			 id:"line5",
			 stroke: "white",
			 strokeWidth:10
		});

		circledim = document.getElementById("circle6").getBoundingClientRect();
		circle_x = circledim.left-svgdim.left+circledim.width/2;
		circle_y = circledim.top-svgdim.top+circledim.width/2;
		var x0 = circle_x;
		var y0 = circle_y;
		lure_deg = Math.round(Math.random()+1)*90;
		var x1 = x0 + 40* Math.cos(lure_deg / 180 * Math.PI - Math.PI / 2);
		var y1 = y0 + 40* Math.sin(lure_deg / 180 * Math.PI - Math.PI / 2);
		var x2 = x0 - 40* Math.cos(lure_deg / 180 * Math.PI - Math.PI / 2);
		var y2 = y0 - 40* Math.sin(lure_deg / 180 * Math.PI - Math.PI / 2);
		var line6 = s.line(x1,y1,x2,y2);
		line6.attr({
			 id:"line6",
			 stroke: "white",
			 strokeWidth:10
		});
		var coordinates = get_lure_loc();
		tgt_loc = stim[9];
		switch (tgt_loc) {
			case 1:
				document.getElementById("line1").remove();
				break;
			case 2:
				document.getElementById("line2").remove();
				break;
			case 3:
				document.getElementById("line3").remove();
				break;
			case 4:
				document.getElementById("line4").remove();
				break;
			case 5:
				document.getElementById("line5").remove();
				break;
			case 6:
				document.getElementById("line6").remove();
				break;
			};
		var tgt = s.line(coordinates[0],coordinates[1],coordinates[2],coordinates[3]);
		tgt.attr({
			id:"tgt",
			 stroke: "white",
			 strokeWidth:10
		});
		wordon = new Date().getTime();
		listening = true;
	};


	var show_probe = function(){
		document.body.style.cursor = 'auto';
		$(document).unbind('click');
		s = Snap('#svgMain');
		s.clear();
		var clrwheel = s.image("/static/images/colorwheel.png",212.8,72.8, 654.4,654.4);
		var probe_ins = s.image("/static/images/ProbeInstruction.png",150,740,800,60);
		randr = Math.floor(Math.random() * 360);
		rand_str = randr.toString();
		var str1 = 'R';
		var str2 = ', 540, 400';
		var str = str1.concat(rand_str,str2);
		clrwheel.transform(str);
		response2_start = new Date().getTime();
		document.getElementById("svgMain").addEventListener("mousedown",getClickPosition, false);
	};

	var getClickPosition = function(evt) {
		var e = evt.target;
		var dim = document.getElementById("svgMain").getBoundingClientRect();
		xPos = evt.clientX-dim.left;
		yPos = evt.clientY-dim.top;
		new_x = xPos;
		new_y = yPos;
		if (xPos>540){
			side = 1;
			deg = Math.PI/2 + Math.atan((yPos-400)/(xPos-540));
		};
		if (xPos<540){
			side = 2;
			deg = 1.5*Math.PI + Math.atan((yPos-400)/(xPos-540));
		};
		if (xPos == 540){
			if (yPos <= 400){
				side = 3;
				deg = 0;
				var coordinates = [540, 72.8, 540, 95.8];
			};
			if (yPos > 400){
				side = 4;
				deg = Math.PI;
				var coordinates = [540, 727.2, 540, 800];
			};
		};

		new_deg = deg;
		actual_deg = deg;

		rotation = randr/180*Math.PI;
		actual_deg = actual_deg - rotation;
			if (actual_deg < 0){
				actual_deg = actual_deg + 2* Math.PI;
			};
		//console.log("new_deg"+ new_deg);
		//console.log("actual_deg"+ actual_deg);

		if (xPos != 400){
			var coordinates = get_line_loc(deg);
		};
		if (document.getElementById("line") !== null){
			document.getElementById("line").remove();
			};
		line = s.line(coordinates[0],coordinates[1],coordinates[2],coordinates[3]);
		line.attr({
			  id:"line",
			  stroke: "rgb(255,255,255)",
			  strokeWidth:10
			});
		if (document.getElementById("probe") !== null){
			document.getElementById("probe").remove();
			};
		probe = s.circle(540,400,50);
		deg = Math.round(actual_deg/Math.PI * 180);
		var pr = colorspace[deg][0];
		var pg = colorspace[deg][1];
		var pb = colorspace[deg][2];
		var str1 = 'rgb(';
		var str2 = ',';
		var str3 = ')';
		var probe_clr = str1.concat(pr.toString(), str2, pg.toString(), str2, pb.toString(), str3);
		//console.log(probe_clr);
		probe.attr({
			  id:"probe",
			  stroke: probe_clr,
			  fill: probe_clr,
			  strokeWidth:10
			});

		ifrotate = false;
		dragging = false;
		ifdrag = false;
		var down_x, down_y, last_angle;
		document.addEventListener("keypress", tonext, false);
		document.getElementById("line").addEventListener("mousedown",clickdown,false);
	};

	var clickdown = function(e){
		ifrotate = true;
		var dim = document.getElementById("svgMain").getBoundingClientRect();
		down_x = e.pageX-dim.left;
		down_y = e.pageY-dim.top;
		e.preventDefault();
		e.stopPropagation();
		dragging = true;
		document.addEventListener("mousemove", dragtomove, false);
	};

	var dragtomove = function(e){
		if(dragging){
			ifdrag = true;
			var dim = document.getElementById("svgMain").getBoundingClientRect();
			new_x = e.pageX-dim.left;
			new_y = e.pageY-dim.top;
			//console.log(new_x);
			if (new_x != down_x && new_y != down_y){//start rotate
				if (new_x>540){
					side = 1;
					new_deg = Math.PI/2 + Math.atan((new_y-400)/(new_x-540));
				};
				if (new_x<540){
					side = 2;
					new_deg = 1.5*Math.PI + Math.atan((new_y-400)/(new_x-540));
				};
				if (new_x == 540){
					if (new_y <= 400){
						side = 3;
						new_deg = 0;
						var coordinates = [540, 72.8, 540, 95.8];
					};
					if (new_y > 400){
						side = 4;
						new_deg = Math.PI;
						var coordinates = [540, 727.2, 540, 800];
					};
				};
			if (xPos != 400){
				var coordinates = get_line_loc(new_deg);
			};
			if (document.getElementById("line") !== null){
				document.getElementById("line").remove();
			};
			line = s.line(coordinates[0],coordinates[1],coordinates[2],coordinates[3]);
			line.attr({
			  id:"line",
			  stroke: "rgb(255,255,255)",
			  strokeWidth:10
				});
			};
			actual_deg = new_deg;

			rotation = randr/180*Math.PI;
			actual_deg = actual_deg - rotation;
				if (actual_deg < 0){
					actual_deg = actual_deg + 2* Math.PI;
				};
			//console.log("new_deg"+ new_deg);
			//console.log("actual_deg"+ actual_deg);
			if (document.getElementById("probe") !== null){
				document.getElementById("probe").remove();
				};
			probe = s.circle(540,400,50);
			deg = Math.round(actual_deg/Math.PI * 180);
			var pr = colorspace[deg][0];
			var pg = colorspace[deg][1];
			var pb = colorspace[deg][2];
			var str1 = 'rgb(';
			var str2 = ',';
			var str3 = ')';
			var probe_clr = str1.concat(pr.toString(), str2, pg.toString(), str2, pb.toString(), str3);
			//console.log(probe_clr);
			probe.attr({
				  id:"probe",
				  stroke: probe_clr,
				  fill: probe_clr,
				  strokeWidth:10
				});

			document.addEventListener("mouseup",finishdrag,false)
		};
	};

	var finishdrag = function (e){
		dragging = false;
	};


	var tonext = function(e){
		if (e.charCode == 32){
			var last_angle = actual_deg;
			var last_x = new_x;
			var last_y = new_y;
			//console.log(last_angle);
			var rt2 = new Date().getTime() - response2_start;
			document.getElementById("svgMain").removeEventListener("mousedown",getClickPosition, false);
			if (ifrotate == true){
				document.getElementById("line").removeEventListener("mousedown",clickdown,false);
			};
			if (ifdrag == true){
				document.removeEventListener("mousemove", dragtomove, false);
				document.removeEventListener("mouseup",finishdrag,false);
			};
			document.removeEventListener("keypress",tonext,false);
			psiTurk.recordTrialData({'xPos':last_x,
                                     'yPos':last_y,
                                     'deg_report': last_angle,
                                     'WMRT': rt2
                                     });
			ITI();
		};
	};

	var ITI = function(){
		var s = Snap('#svgMain');
		s.clear();
		var background = s.circle(540, 400, 50);
		background.attr({
		  id: "soa",
		  fill: "none",
		  stroke:"black",
		  strokeWidth:10
		})
		handle7 = setTimeout(function(){
				next()},500);
	};

	var get_line_loc = function(d){
		a0 = 540;
		b0 = 400;
		if (side == 1){
			var a1 = a0 + 327* Math.cos(d-0.5 * Math.PI);
			var b1 = b0 + 327* Math.sin(d-0.5 * Math.PI);
			var a2 = a0 + 350* Math.cos(d-0.5 * Math.PI);
			var b2 = b0 + 350* Math.sin(d-0.5 * Math.PI);
		};
		if (side == 2){
			var a1 = a0 - 327* Math.cos(1.5 * Math.PI-d);
			var b1 = b0 + 327* Math.sin(1.5 * Math.PI-d);
			var a2 = a0 - 350* Math.cos(1.5 * Math.PI-d);
			var b2 = b0 + 350* Math.sin(1.5 * Math.PI-d);
		};
		var locs = [a1, b1, a2, b2];
		return locs;
	};



	// Load the stage.html snippet into the body of the page
	psiTurk.showPage('stage.html');

	// Register the response handler that is defined above to handle any
	// key down events.
	$("body").focus().keydown(response_handler);

	// Start the test

	next();
};

var Practice2 = function() {

	var wordon, // time word is presented
	    listening = false;

	//0 tgt_ori 1 WM_ori 2 rotation 3 trial# 4 dis_type 5 t_loc 6 d_loc

	//stims = stimuli;
	stims = _.shuffle(stimuli);
	pracstims = stims.slice(0, 10);
	//console.log(pracstims);

	var next = function() {
		if (pracstims.length===0) {
			var s = Snap('#svgMain');
			s.clear();
			clearTimeout(handle7);
			finish();
		}
		else {
			var s = Snap('#svgMain');
			s.clear();
			stim = pracstims.shift();
			show_fixation();
			clearTimeout();
			handle = setTimeout(function(){
				show_cue();},500);
			handle2 = setTimeout(function(){
				SOA1();},1000);
			handle3 = setTimeout(function(){
				show_word();},2000);
			handle4 = setTimeout(function(){
				SOA2()},6500);
			handle5 = setTimeout(function(){
				show_probe()},7500);
			document.removeEventListener("click",getClickPosition, false);
		}
	};


	var response_handler = function(e) {
		if (!listening) return;

		var keyCode = e.keyCode,
			response;
			//console.log(keyCode);
		switch (keyCode) {
			case 69:
				// "E"
				if (condition == 0){
					response="left";
					break;
				};
				if (condition == 1){
					response="left";
					break;
				};
			case 70:
				// "F"
				if (condition == 0){
					response="right";
					break;
				};
				if (condition == 1){
					response="right";
					break;
				};
			default:
				response = "";
				break;
		}
		if (response.length>0) {
			listening = false;
			var hit = response == acc_resp;
			console.log(hit);
			var rt = new Date().getTime() - wordon;
			if ( rt < 3500){
				psiTurk.recordTrialData({'phase':"PRAC",
										 'tgt_clr': stim[7],
										 'dis_clr':stim[8],
										 'rotation':stim[6],
										 'trial#':0,
										 'tgt_loc': stim[9],
										 't_d_dis': stim[10],
										 'condition': condition,//control for response bias
										 'acc_resp':acc_resp,
										 'response':response,
										 'hit':hit,
										 'rt':rt}
									   );
			   };
			clearTimeout(handle4);
			clearTimeout(handle5);
            SOA1();
            handle6 = setTimeout(function(){
				show_probe()},1000);
		}
	};

	var finish = function() {
		var s = Snap('#svgMain');
		var after_prac = s.image("/static/images/AfterPrac.png", 150,250);
		$("body").unbind("keydown", response_handler); // Unbind keys
		document.addEventListener("keydown",finishprac, false);
	};

	var finishprac = function(e){
			if (e.keyCode == 32) {
				document.removeEventListener("keydown",finishprac,false);
				currentview = new StroopExperiment();
			}
		};


	var circle_locs = Array(
					Array(540,260),
					Array(661,330),
					Array(661,470),
					Array(540,540),
					Array(419,470),
					Array(419,330)
					);

	var get_lure_loc = function(){
		var t_loc = stim[9];
		var svgdim = document.getElementById("svgMain").getBoundingClientRect();
		switch (t_loc) {
			case 1:
				var circledim = document.getElementById("circle1").getBoundingClientRect();
				break;
			case 2:
				var circledim = document.getElementById("circle2").getBoundingClientRect();
				break;
			case 3:
				var circledim = document.getElementById("circle3").getBoundingClientRect();
				break;
			case 4:
				var circledim = document.getElementById("circle4").getBoundingClientRect();
				break;
			case 5:
				var circledim = document.getElementById("circle5").getBoundingClientRect();
				break;
			case 6:
				var circledim = document.getElementById("circle6").getBoundingClientRect();
				break;
			};
		//console.log(circledim);
		circle_x = circledim.left-svgdim.left+circledim.width/2;
		circle_y = circledim.top-svgdim.top+circledim.width/2;
		var x0 = circle_x;
		//console.log(x0);
		var y0 = circle_y;
		//console.log(y0);
		lure_deg = 45+Math.round(Math.random())*90;
		console.log(lure_deg);
		if (lure_deg==135){
			acc_resp = "left";
		};
		if (lure_deg==45){
			acc_resp = "right";
		};
		var x1 = x0 + 40* Math.cos(lure_deg / 180 * Math.PI - Math.PI / 2);
		var y1 = y0 + 40* Math.sin(lure_deg / 180 * Math.PI - Math.PI / 2);
		var x2 = x0 - 40* Math.cos(lure_deg / 180 * Math.PI - Math.PI / 2);
		var y2 = y0 - 40* Math.sin(lure_deg / 180 * Math.PI - Math.PI / 2);
		var locs = [x1, y1, x2, y2];
		//console.log(locs);

		return locs;
	};

	var get_cue_loc = function(){
		a0 = 540;
		b0 = 400;
		var cue_deg = stim[0];
		var a1 = a0 + 40* Math.cos(cue_deg / 180 * Math.PI - Math.PI / 2);
		var b1 = b0 + 40* Math.sin(cue_deg / 180 * Math.PI - Math.PI / 2);
		var a2 = a0 - 40* Math.cos(cue_deg / 180 * Math.PI - Math.PI / 2);
		var b2 = b0 - 40* Math.sin(cue_deg / 180 * Math.PI - Math.PI / 2);
		var locs = [a1, b1, a2, b2];
		return locs;
	};



	var show_fixation = function(){
		document.body.style.cursor = 'none';
		var s = Snap('#svgMain');
		var horizontal = s.line(520,400,560,400);
		horizontal.attr({
		  id:"fix1",
		  stroke: "rgb(255, 255, 255)",
		  strokeWidth:10
		});
		var vertical = s.line(540, 380, 540, 420);
		vertical.attr({
		  id:"fix2",
		  stroke: "rgb(255, 255, 255)",
		  strokeWidth:10
		});
	};

	var SOA1 = function(){
		var s = Snap('#svgMain');
		s.clear();
		var background = s.circle(540, 400, 50);
		background.attr({
		  id: "soa",
		  fill: "none",
		  stroke:"black",
		  strokeWidth:10
		})
	};

	var SOA2 = function(){
		listening = false;
		var s = Snap('#svgMain');
		s.clear();
		var background = s.circle(540, 400, 50);
		background.attr({
		  id: "soa2",
		  fill: "none",
		  stroke:"black",
		  strokeWidth:10
		})
		psiTurk.recordTrialData({'phase':"PRAC",
										 'tgt_clr': stim[7],
										 'dis_clr':stim[8],
										 'rotation':stim[6],
										 'trial#':0,
										 'tgt_loc': stim[9],
										 't_d_dis': stim[10],
										 'condition': condition,//control for response bias
										 'acc_resp':acc_resp,
										 'response':'none',
										 'hit':'false',
										 'rt':0}
                                   );
	};

	var show_cue = function(){
		var s = Snap('#svgMain');
		s.clear();
		var r = stim[0];
		var g = stim[1];
		var b = stim[2];
		var str1 = 'rgb(';
		var str2 = ',';
		var str3 = ')';
		var tgt_clr = str1.concat(r.toString(), str2, g.toString(), str2, b.toString(), str3);
		var circle1 = s.circle(540, 400, 50);
		circle1.attr({
		  id:"cue",
		  fill: tgt_clr,
		  stroke:tgt_clr,
		  strokeWidth:10
		});
	};


	var show_word = function() {
		var s = Snap('#svgMain');
		s.clear();
		var colorstroke = ["white", "white", "white","white","white", "white"];
		var colorfill = ["none", "none", "none","none","none","none"];
		//console.log(acc_resp);
		var t_loc = stim[9];
		var t_d_dist = stim[10];
		lure_loc = t_loc + t_d_dist;
		if (lure_loc > 6){
			lure_loc = lure_loc-6;
		};
		var dr = stim[3];
		var dg = stim[4];
		var db = stim[5];
		var str1 = 'rgb(';
		var str2 = ',';
		var str3 = ')';
		var dis_clr = str1.concat(dr.toString(), str2, dg.toString(), str2, db.toString(), str3);
		console.log(dis_clr);
		colorstroke[lure_loc-1] = dis_clr;
		colorfill[lure_loc-1] = dis_clr;
		console.log(colorstroke);
		console.log(colorfill);
		var circle1 = s.circle(circle_locs[0][0], circle_locs[0][1], 50);
		circle1.attr({
		  id:"circle1",
		  fill: colorfill[0],
		  stroke:colorstroke[0],
		  strokeWidth:10
		});
		var circle2 = s.circle(circle_locs[1][0], circle_locs[1][1], 50);
		circle2.attr({
			id:"circle2",
			fill: colorfill[1],
			stroke:colorstroke[1],
			strokeWidth:10
		});

		var circle3 = s.circle(circle_locs[2][0], circle_locs[2][1], 50);
		circle3.attr({
			id:"circle3",
			fill: colorfill[2],
			stroke:colorstroke[2],
			strokeWidth:10
		});

		var circle4 = s.circle(circle_locs[3][0], circle_locs[3][1], 50);
		circle4.attr({
			id: "circle4",
			fill: colorfill[3],
			stroke:colorstroke[3],
			strokeWidth:10
		});

		var circle5 = s.circle(circle_locs[4][0], circle_locs[4][1], 50);
		circle5.attr({
			id:"circle5",
			fill: colorfill[4],
			stroke:colorstroke[4],
			strokeWidth:10
		});
		var circle6 = s.circle(circle_locs[5][0], circle_locs[5][1], 50);
		circle6.attr({
			id:"circle6",
			fill: colorfill[5],
			stroke:colorstroke[5],
			strokeWidth:10
		});
		var rand_rot = [0, 10, 20, 30, 40, 50];
		var rand = rand_rot[Math.floor(Math.random() * rand_rot.length)];
		rand_str = rand.toString();
		var str1 = 'R';
		var str2 = ', 540, 400';
		var str = str1.concat(rand_str,str2);
		//console.log(str);
		circle1.transform(str);
		circle2.transform(str);
		circle3.transform(str);
		circle4.transform(str);
		circle5.transform(str);
		circle6.transform(str);

		var svgdim = document.getElementById("svgMain").getBoundingClientRect();
		circledim = document.getElementById("circle1").getBoundingClientRect();
		circle_x = circledim.left-svgdim.left+circledim.width/2;
		circle_y = circledim.top-svgdim.top+circledim.width/2;
		var x0 = circle_x;
		var y0 = circle_y;
		lure_deg = Math.round(Math.random()+1)*90;
		var x1 = x0 + 40* Math.cos(lure_deg / 180 * Math.PI - Math.PI / 2);
		var y1 = y0 + 40* Math.sin(lure_deg / 180 * Math.PI - Math.PI / 2);
		var x2 = x0 - 40* Math.cos(lure_deg / 180 * Math.PI - Math.PI / 2);
		var y2 = y0 - 40* Math.sin(lure_deg / 180 * Math.PI - Math.PI / 2);
		var line1 = s.line(x1,y1,x2,y2);
		line1.attr({
			 id:"line1",
			 stroke: "white",
			 strokeWidth:10
		});

		circledim = document.getElementById("circle2").getBoundingClientRect();
		circle_x = circledim.left-svgdim.left+circledim.width/2;
		circle_y = circledim.top-svgdim.top+circledim.width/2;
		var x0 = circle_x;
		var y0 = circle_y;
		lure_deg = Math.round(Math.random()+1)*90;
		var x1 = x0 + 40* Math.cos(lure_deg / 180 * Math.PI - Math.PI / 2);
		var y1 = y0 + 40* Math.sin(lure_deg / 180 * Math.PI - Math.PI / 2);
		var x2 = x0 - 40* Math.cos(lure_deg / 180 * Math.PI - Math.PI / 2);
		var y2 = y0 - 40* Math.sin(lure_deg / 180 * Math.PI - Math.PI / 2);
		var line2 = s.line(x1,y1,x2,y2);
		line2.attr({
			 id:"line2",
			 stroke: "white",
			 strokeWidth:10
		});

		circledim = document.getElementById("circle3").getBoundingClientRect();
		circle_x = circledim.left-svgdim.left+circledim.width/2;
		circle_y = circledim.top-svgdim.top+circledim.width/2;
		var x0 = circle_x;
		var y0 = circle_y;
		lure_deg = Math.round(Math.random()+1)*90;
		var x1 = x0 + 40* Math.cos(lure_deg / 180 * Math.PI - Math.PI / 2);
		var y1 = y0 + 40* Math.sin(lure_deg / 180 * Math.PI - Math.PI / 2);
		var x2 = x0 - 40* Math.cos(lure_deg / 180 * Math.PI - Math.PI / 2);
		var y2 = y0 - 40* Math.sin(lure_deg / 180 * Math.PI - Math.PI / 2);
		var line3 = s.line(x1,y1,x2,y2);
		line3.attr({
			 id:"line3",
			 stroke: "white",
			 strokeWidth:10
		});

		circledim = document.getElementById("circle4").getBoundingClientRect();
		circle_x = circledim.left-svgdim.left+circledim.width/2;
		circle_y = circledim.top-svgdim.top+circledim.width/2;
		var x0 = circle_x;
		var y0 = circle_y;
		lure_deg = Math.round(Math.random()+1)*90;
		var x1 = x0 + 40* Math.cos(lure_deg / 180 * Math.PI - Math.PI / 2);
		var y1 = y0 + 40* Math.sin(lure_deg / 180 * Math.PI - Math.PI / 2);
		var x2 = x0 - 40* Math.cos(lure_deg / 180 * Math.PI - Math.PI / 2);
		var y2 = y0 - 40* Math.sin(lure_deg / 180 * Math.PI - Math.PI / 2);
		var line4 = s.line(x1,y1,x2,y2);
		line4.attr({
			 id:"line4",
			 stroke: "white",
			 strokeWidth:10
		});

		circledim = document.getElementById("circle5").getBoundingClientRect();
		circle_x = circledim.left-svgdim.left+circledim.width/2;
		circle_y = circledim.top-svgdim.top+circledim.width/2;
		var x0 = circle_x;
		var y0 = circle_y;
		lure_deg = Math.round(Math.random()+1)*90;
		var x1 = x0 + 40* Math.cos(lure_deg / 180 * Math.PI - Math.PI / 2);
		var y1 = y0 + 40* Math.sin(lure_deg / 180 * Math.PI - Math.PI / 2);
		var x2 = x0 - 40* Math.cos(lure_deg / 180 * Math.PI - Math.PI / 2);
		var y2 = y0 - 40* Math.sin(lure_deg / 180 * Math.PI - Math.PI / 2);
		var line5 = s.line(x1,y1,x2,y2);
		line5.attr({
			 id:"line5",
			 stroke: "white",
			 strokeWidth:10
		});

		circledim = document.getElementById("circle6").getBoundingClientRect();
		circle_x = circledim.left-svgdim.left+circledim.width/2;
		circle_y = circledim.top-svgdim.top+circledim.width/2;
		var x0 = circle_x;
		var y0 = circle_y;
		lure_deg = Math.round(Math.random()+1)*90;
		var x1 = x0 + 40* Math.cos(lure_deg / 180 * Math.PI - Math.PI / 2);
		var y1 = y0 + 40* Math.sin(lure_deg / 180 * Math.PI - Math.PI / 2);
		var x2 = x0 - 40* Math.cos(lure_deg / 180 * Math.PI - Math.PI / 2);
		var y2 = y0 - 40* Math.sin(lure_deg / 180 * Math.PI - Math.PI / 2);
		var line6 = s.line(x1,y1,x2,y2);
		line6.attr({
			 id:"line6",
			 stroke: "white",
			 strokeWidth:10
		});
		var coordinates = get_lure_loc();
		tgt_loc = stim[9];
		switch (tgt_loc) {
			case 1:
				document.getElementById("line1").remove();
				break;
			case 2:
				document.getElementById("line2").remove();
				break;
			case 3:
				document.getElementById("line3").remove();
				break;
			case 4:
				document.getElementById("line4").remove();
				break;
			case 5:
				document.getElementById("line5").remove();
				break;
			case 6:
				document.getElementById("line6").remove();
				break;
			};
		var tgt = s.line(coordinates[0],coordinates[1],coordinates[2],coordinates[3]);
		tgt.attr({
			id:"tgt",
			 stroke: "white",
			 strokeWidth:10
		});
		wordon = new Date().getTime();
		listening = true;
	};


	var show_probe = function(){
		document.body.style.cursor = 'auto';
		s = Snap('#svgMain');
		s.clear();
		var clrwheel = s.image("/static/images/colorwheel.png",212.8,72.8, 654.4,654.4);
		//var probe_ins = s.image("/static/images/ProbeInstruction.png",150,740,800,60);
		randr = Math.floor(Math.random() * 360);
		rand_str = randr.toString();
		var str1 = 'R';
		var str2 = ', 540, 400';
		var str = str1.concat(rand_str,str2);
		clrwheel.transform(str);
		response2_start = new Date().getTime();
		document.getElementById("svgMain").addEventListener("mousedown",getClickPosition, false);
	};

	var getClickPosition = function(evt) {
		var e = evt.target;
		var dim = document.getElementById("svgMain").getBoundingClientRect();
		xPos = evt.clientX-dim.left;
		yPos = evt.clientY-dim.top;
		new_x = xPos;
		new_y = yPos;
		if (xPos>540){
			side = 1;
			deg = Math.PI/2 + Math.atan((yPos-400)/(xPos-540));
		};
		if (xPos<540){
			side = 2;
			deg = 1.5*Math.PI + Math.atan((yPos-400)/(xPos-540));
		};
		if (xPos == 540){
			if (yPos <= 400){
				side = 3;
				deg = 0;
				var coordinates = [540, 72.8, 540, 95.8];
			};
			if (yPos > 400){
				side = 4;
				deg = Math.PI;
				var coordinates = [540, 727.2, 540, 800];
			};
		};

		new_deg = deg;
		actual_deg = deg;

		rotation = randr/180*Math.PI;
		actual_deg = actual_deg - rotation;
			if (actual_deg < 0){
				actual_deg = actual_deg + 2* Math.PI;
			};
		console.log("new_deg"+ new_deg);
		console.log("actual_deg"+ actual_deg);

		if (xPos != 400){
			var coordinates = get_line_loc(deg);
		};
		if (document.getElementById("line") !== null){
			document.getElementById("line").remove();
			};
		line = s.line(coordinates[0],coordinates[1],coordinates[2],coordinates[3]);
		line.attr({
			  id:"line",
			  stroke: "rgb(255,255,255)",
			  strokeWidth:10
			});
		if (document.getElementById("probe") !== null){
			document.getElementById("probe").remove();
			};
		probe = s.circle(540,400,50);
		deg = Math.round(actual_deg/Math.PI * 180);
		var pr = colorspace[deg][0];
		var pg = colorspace[deg][1];
		var pb = colorspace[deg][2];
		var str1 = 'rgb(';
		var str2 = ',';
		var str3 = ')';
		var probe_clr = str1.concat(pr.toString(), str2, pg.toString(), str2, pb.toString(), str3);
		console.log(probe_clr);
		probe.attr({
			  id:"probe",
			  stroke: probe_clr,
			  fill: probe_clr,
			  strokeWidth:10
			});

		ifrotate = false;
		dragging = false;
		ifdrag = false;
		var down_x, down_y, last_angle;
		document.addEventListener("keypress", tonext, false);
		document.getElementById("line").addEventListener("mousedown",clickdown,false);
	};

	var clickdown = function(e){
		ifrotate = true;
		var dim = document.getElementById("svgMain").getBoundingClientRect();
		down_x = e.pageX-dim.left;
		down_y = e.pageY-dim.top;
		e.preventDefault();
		e.stopPropagation();
		dragging = true;
		document.addEventListener("mousemove", dragtomove, false);
	};

	var dragtomove = function(e){
		if(dragging){
			ifdrag = true;
			var dim = document.getElementById("svgMain").getBoundingClientRect();
			new_x = e.pageX-dim.left;
			new_y = e.pageY-dim.top;
			console.log(new_x);
			if (new_x != down_x && new_y != down_y){//start rotate
				if (new_x>540){
					side = 1;
					new_deg = Math.PI/2 + Math.atan((new_y-400)/(new_x-540));
				};
				if (new_x<540){
					side = 2;
					new_deg = 1.5*Math.PI + Math.atan((new_y-400)/(new_x-540));
				};
				if (new_x == 540){
					if (new_y <= 400){
						side = 3;
						new_deg = 0;
						var coordinates = [540, 72.8, 540, 95.8];
					};
					if (new_y > 400){
						side = 4;
						new_deg = Math.PI;
						var coordinates = [540, 727.2, 540, 800];
					};
				};
			if (xPos != 400){
				var coordinates = get_line_loc(new_deg);
			};
			if (document.getElementById("line") !== null){
				document.getElementById("line").remove();
			};
			line = s.line(coordinates[0],coordinates[1],coordinates[2],coordinates[3]);
			line.attr({
			  id:"line",
			  stroke: "rgb(255,255,255)",
			  strokeWidth:10
				});
			};
			actual_deg = new_deg;

			rotation = randr/180*Math.PI;
			actual_deg = actual_deg - rotation;
				if (actual_deg < 0){
					actual_deg = actual_deg + 2* Math.PI;
				};
			console.log("new_deg"+ new_deg);
			console.log("actual_deg"+ actual_deg);
			if (document.getElementById("probe") !== null){
				document.getElementById("probe").remove();
				};
			probe = s.circle(540,400,50);
			deg = Math.round(actual_deg/Math.PI * 180);
			var pr = colorspace[deg][0];
			var pg = colorspace[deg][1];
			var pb = colorspace[deg][2];
			var str1 = 'rgb(';
			var str2 = ',';
			var str3 = ')';
			var probe_clr = str1.concat(pr.toString(), str2, pg.toString(), str2, pb.toString(), str3);
			console.log(probe_clr);
			probe.attr({
				  id:"probe",
				  stroke: probe_clr,
				  fill: probe_clr,
				  strokeWidth:10
				});

			document.addEventListener("mouseup",finishdrag,false)
		};
	};

	var finishdrag = function (e){
		dragging = false;
	};


	var tonext = function(e){
		if (e.charCode == 32){
			var last_angle = actual_deg;
			var last_x = new_x;
			var last_y = new_y;
			console.log(last_angle);
			var rt2 = new Date().getTime() - response2_start;
			document.getElementById("svgMain").removeEventListener("mousedown",getClickPosition, false);
			if (ifrotate == true){
				document.getElementById("line").removeEventListener("mousedown",clickdown,false);
			};
			if (ifdrag == true){
				document.removeEventListener("mousemove", dragtomove, false);
				document.removeEventListener("mouseup",finishdrag,false);
			};
			document.removeEventListener("keypress",tonext,false);
			psiTurk.recordTrialData({'xPos':last_x,
                                     'yPos':last_y,
                                     'deg_report': last_angle,
                                     'WMRT': rt2
                                     });
			ITI();
		};
	};

	var ITI = function(){
		var s = Snap('#svgMain');
		s.clear();
		var background = s.circle(540, 400, 50);
		background.attr({
		  id: "soa",
		  fill: "none",
		  stroke:"black",
		  strokeWidth:10
		})
		handle7 = setTimeout(function(){
				next()},500);
	};

	var get_line_loc = function(d){
		a0 = 540;
		b0 = 400;
		if (side == 1){
			var a1 = a0 + 327* Math.cos(d-0.5 * Math.PI);
			var b1 = b0 + 327* Math.sin(d-0.5 * Math.PI);
			var a2 = a0 + 350* Math.cos(d-0.5 * Math.PI);
			var b2 = b0 + 350* Math.sin(d-0.5 * Math.PI);
		};
		if (side == 2){
			var a1 = a0 - 327* Math.cos(1.5 * Math.PI-d);
			var b1 = b0 + 327* Math.sin(1.5 * Math.PI-d);
			var a2 = a0 - 350* Math.cos(1.5 * Math.PI-d);
			var b2 = b0 + 350* Math.sin(1.5 * Math.PI-d);
		};
		var locs = [a1, b1, a2, b2];
		return locs;
	};


	// Load the stage.html snippet into the body of the page
	psiTurk.showPage('stage.html');

	// Register the response handler that is defined above to handle any
	// key down events.
	$("body").focus().keydown(response_handler);

	// Start the test

	next();
};


/********************
* Task block       *
********************/
var StroopExperiment = function() {


	var wordon, // time word is presented
	    listening = false;

	//0 tgt_ori 1 WM_ori 2 rotation 3 trial# 4 dis_type 5 t_loc 6 d_loc

	stims = _.shuffle(stimuli);
	//console.log(stims);
	//stims = stims.slice(0, 5);
	trial_count = 0;
	var next = function() {
		if (stims.length===0) {
			d3.select("svg").remove();
			finish();
		}
		else {
			document.getElementById("results").innerHTML = " ";

			var s = Snap('#svgMain');
			s.clear();
			stim = stims.shift();
			console.log(stim);
			clearTimeout();
			show_fixation();
			handle = setTimeout(function(){
				show_cue();},500);
			handle2 = setTimeout(function(){
				SOA1();},1000);
			handle3 = setTimeout(function(){
				show_word();},2000);
			handle4 = setTimeout(function(){
				SOA2()},5500);
			handle5 = setTimeout(function(){
				show_probe()},6000);
			document.removeEventListener("mousedown",getClickPosition, false);
		}
	};



	var response_handler = function(e) {
		if (!listening) return;

		var keyCode = e.keyCode,
			response;

		switch (keyCode) {
			case 69:
				// "E"
				if (condition == 0){
					response="left";
					break;
				};
				if (condition == 1){
					response="left";
					break;
				};
			case 70:
				// "F"
				if (condition == 0){
					response="right";
					break;
				};
				if (condition == 1){
					response="right";
					break;
				};
			default:
				response = "";
				break;
		}
		if (response.length>0) {
			listening = false;
			//var acc_resp = "blue";
			var hit = response == acc_resp;
			//console.log(hit);
			var rt = new Date().getTime() - wordon;
			if ( rt < 3500){
				psiTurk.recordTrialData({'phase':"TEST",
                                     'tgt_clr': stim[7],
										 'dis_clr':stim[8],
										 'rotation':stim[6],
										 'trial#':trial_count,
										 'tgt_loc': stim[9],
										 't_d_dis': stim[10],
										 'condition': condition,//control for response bias
										 'acc_resp':acc_resp,
										 'response':response,
										 'hit':hit,
										 'rt':rt}
                                   );
                  };
			clearTimeout(handle4);
			clearTimeout(handle5);
            SOA1();
            handle6 = setTimeout(function(){
				show_probe()},500);
		}
	};

	var finish = function() {
	    $("body").unbind("keydown", response_handler); // Unbind keys
	    currentview = new Questionnaire();
	};


var circle_locs = Array(
					Array(540,260),
					Array(661,330),
					Array(661,470),
					Array(540,540),
					Array(419,470),
					Array(419,330)
					);

	var get_lure_loc = function(){
		var t_loc = stim[9];
		var svgdim = document.getElementById("svgMain").getBoundingClientRect();
		switch (t_loc) {
			case 1:
				var circledim = document.getElementById("circle1").getBoundingClientRect();
				break;
			case 2:
				var circledim = document.getElementById("circle2").getBoundingClientRect();
				break;
			case 3:
				var circledim = document.getElementById("circle3").getBoundingClientRect();
				break;
			case 4:
				var circledim = document.getElementById("circle4").getBoundingClientRect();
				break;
			case 5:
				var circledim = document.getElementById("circle5").getBoundingClientRect();
				break;
			case 6:
				var circledim = document.getElementById("circle6").getBoundingClientRect();
				break;
			};
		//console.log(circledim);
		circle_x = circledim.left-svgdim.left+circledim.width/2;
		circle_y = circledim.top-svgdim.top+circledim.width/2;
		var x0 = circle_x;
		//console.log(x0);
		var y0 = circle_y;
		//console.log(y0);
		lure_deg = 45+Math.round(Math.random())*90;
		console.log(lure_deg);
		if (lure_deg==135){
			acc_resp = "left";
		};
		if (lure_deg==45){
			acc_resp = "right";
		};
		var x1 = x0 + 40* Math.cos(lure_deg / 180 * Math.PI - Math.PI / 2);
		var y1 = y0 + 40* Math.sin(lure_deg / 180 * Math.PI - Math.PI / 2);
		var x2 = x0 - 40* Math.cos(lure_deg / 180 * Math.PI - Math.PI / 2);
		var y2 = y0 - 40* Math.sin(lure_deg / 180 * Math.PI - Math.PI / 2);
		var locs = [x1, y1, x2, y2];
		//console.log(locs);

		return locs;
	};

	var get_cue_loc = function(){
		a0 = 540;
		b0 = 400;
		var cue_deg = stim[0];
		var a1 = a0 + 40* Math.cos(cue_deg / 180 * Math.PI - Math.PI / 2);
		var b1 = b0 + 40* Math.sin(cue_deg / 180 * Math.PI - Math.PI / 2);
		var a2 = a0 - 40* Math.cos(cue_deg / 180 * Math.PI - Math.PI / 2);
		var b2 = b0 - 40* Math.sin(cue_deg / 180 * Math.PI - Math.PI / 2);
		var locs = [a1, b1, a2, b2];
		return locs;
	};



	var show_fixation = function(){
		document.body.style.cursor = 'none';
		var s = Snap('#svgMain');
		var horizontal = s.line(520,400,560,400);
		horizontal.attr({
		  id:"fix1",
		  stroke: "rgb(255, 255, 255)",
		  strokeWidth:10
		});
		var vertical = s.line(540, 380, 540, 420);
		vertical.attr({
		  id:"fix2",
		  stroke: "rgb(255, 255, 255)",
		  strokeWidth:10
		});
	};

	var SOA1 = function(){
		var s = Snap('#svgMain');
		s.clear();
		var background = s.circle(540, 400, 50);
		background.attr({
		  id: "soa",
		  fill: "none",
		  stroke:"black",
		  strokeWidth:10
		})
	};

	var SOA2 = function(){
		listening = false;
		var s = Snap('#svgMain');
		s.clear();
		var background = s.circle(540, 400, 50);
		background.attr({
		  id: "soa2",
		  fill: "none",
		  stroke:"black",
		  strokeWidth:10
		})
		psiTurk.recordTrialData({'phase':"TEST",
										 'tgt_clr': stim[7],
										 'dis_clr':stim[8],
										 'rotation':stim[6],
										 'trial#':trial_count,
										 'tgt_loc': stim[9],
										 't_d_dis': stim[10],
										 'condition': condition,//control for response bias
										 'acc_resp':acc_resp,
										 'response':'none',
										 'hit':'false',
										 'rt':0}
                                   );
	};

	var show_cue = function(){
		var s = Snap('#svgMain');
		s.clear();
		var r = stim[0];
		var g = stim[1];
		var b = stim[2];
		var str1 = 'rgb(';
		var str2 = ',';
		var str3 = ')';
		var tgt_clr = str1.concat(r.toString(), str2, g.toString(), str2, b.toString(), str3);
		var circle1 = s.circle(540, 400, 50);
		circle1.attr({
		  id:"cue",
		  fill: tgt_clr,
		  stroke:tgt_clr,
		  strokeWidth:10
		});
	};


	var show_word = function() {
		var s = Snap('#svgMain');
		s.clear();
		var colorstroke = ["white", "white", "white","white","white", "white"];
		var colorfill = ["none", "none", "none","none","none","none"];
		//console.log(acc_resp);
		var t_loc = stim[9];
		var t_d_dist = stim[10];
		lure_loc = t_loc + t_d_dist;
		if (lure_loc > 6){
			lure_loc = lure_loc-6;
		};
		var dr = stim[3];
		var dg = stim[4];
		var db = stim[5];
		var str1 = 'rgb(';
		var str2 = ',';
		var str3 = ')';
		var dis_clr = str1.concat(dr.toString(), str2, dg.toString(), str2, db.toString(), str3);
		console.log(dis_clr);
		colorstroke[lure_loc-1] = dis_clr;
		colorfill[lure_loc-1] = dis_clr;
		//console.log(colorstroke);
		//console.log(colorfill);
		var circle1 = s.circle(circle_locs[0][0], circle_locs[0][1], 50);
		circle1.attr({
		  id:"circle1",
		  fill: colorfill[0],
		  stroke:colorstroke[0],
		  strokeWidth:10
		});
		var circle2 = s.circle(circle_locs[1][0], circle_locs[1][1], 50);
		circle2.attr({
			id:"circle2",
			fill: colorfill[1],
			stroke:colorstroke[1],
			strokeWidth:10
		});

		var circle3 = s.circle(circle_locs[2][0], circle_locs[2][1], 50);
		circle3.attr({
			id:"circle3",
			fill: colorfill[2],
			stroke:colorstroke[2],
			strokeWidth:10
		});

		var circle4 = s.circle(circle_locs[3][0], circle_locs[3][1], 50);
		circle4.attr({
			id: "circle4",
			fill: colorfill[3],
			stroke:colorstroke[3],
			strokeWidth:10
		});

		var circle5 = s.circle(circle_locs[4][0], circle_locs[4][1], 50);
		circle5.attr({
			id:"circle5",
			fill: colorfill[4],
			stroke:colorstroke[4],
			strokeWidth:10
		});
		var circle6 = s.circle(circle_locs[5][0], circle_locs[5][1], 50);
		circle6.attr({
			id:"circle6",
			fill: colorfill[5],
			stroke:colorstroke[5],
			strokeWidth:10
		});
		var rand_rot = [0, 10, 20, 30, 40, 50];
		var rand = rand_rot[Math.floor(Math.random() * rand_rot.length)];
		rand_str = rand.toString();
		var str1 = 'R';
		var str2 = ', 540, 400';
		var str = str1.concat(rand_str,str2);
		//console.log(str);
		circle1.transform(str);
		circle2.transform(str);
		circle3.transform(str);
		circle4.transform(str);
		circle5.transform(str);
		circle6.transform(str);

		var svgdim = document.getElementById("svgMain").getBoundingClientRect();
		circledim = document.getElementById("circle1").getBoundingClientRect();
		circle_x = circledim.left-svgdim.left+circledim.width/2;
		circle_y = circledim.top-svgdim.top+circledim.width/2;
		var x0 = circle_x;
		var y0 = circle_y;
		lure_deg = Math.round(Math.random()+1)*90;
		var x1 = x0 + 40* Math.cos(lure_deg / 180 * Math.PI - Math.PI / 2);
		var y1 = y0 + 40* Math.sin(lure_deg / 180 * Math.PI - Math.PI / 2);
		var x2 = x0 - 40* Math.cos(lure_deg / 180 * Math.PI - Math.PI / 2);
		var y2 = y0 - 40* Math.sin(lure_deg / 180 * Math.PI - Math.PI / 2);
		var line1 = s.line(x1,y1,x2,y2);
		line1.attr({
			 id:"line1",
			 stroke: "white",
			 strokeWidth:10
		});

		circledim = document.getElementById("circle2").getBoundingClientRect();
		circle_x = circledim.left-svgdim.left+circledim.width/2;
		circle_y = circledim.top-svgdim.top+circledim.width/2;
		var x0 = circle_x;
		var y0 = circle_y;
		lure_deg = Math.round(Math.random()+1)*90;
		var x1 = x0 + 40* Math.cos(lure_deg / 180 * Math.PI - Math.PI / 2);
		var y1 = y0 + 40* Math.sin(lure_deg / 180 * Math.PI - Math.PI / 2);
		var x2 = x0 - 40* Math.cos(lure_deg / 180 * Math.PI - Math.PI / 2);
		var y2 = y0 - 40* Math.sin(lure_deg / 180 * Math.PI - Math.PI / 2);
		var line2 = s.line(x1,y1,x2,y2);
		line2.attr({
			 id:"line2",
			 stroke: "white",
			 strokeWidth:10
		});

		circledim = document.getElementById("circle3").getBoundingClientRect();
		circle_x = circledim.left-svgdim.left+circledim.width/2;
		circle_y = circledim.top-svgdim.top+circledim.width/2;
		var x0 = circle_x;
		var y0 = circle_y;
		lure_deg = Math.round(Math.random()+1)*90;
		var x1 = x0 + 40* Math.cos(lure_deg / 180 * Math.PI - Math.PI / 2);
		var y1 = y0 + 40* Math.sin(lure_deg / 180 * Math.PI - Math.PI / 2);
		var x2 = x0 - 40* Math.cos(lure_deg / 180 * Math.PI - Math.PI / 2);
		var y2 = y0 - 40* Math.sin(lure_deg / 180 * Math.PI - Math.PI / 2);
		var line3 = s.line(x1,y1,x2,y2);
		line3.attr({
			 id:"line3",
			 stroke: "white",
			 strokeWidth:10
		});

		circledim = document.getElementById("circle4").getBoundingClientRect();
		circle_x = circledim.left-svgdim.left+circledim.width/2;
		circle_y = circledim.top-svgdim.top+circledim.width/2;
		var x0 = circle_x;
		var y0 = circle_y;
		lure_deg = Math.round(Math.random()+1)*90;
		var x1 = x0 + 40* Math.cos(lure_deg / 180 * Math.PI - Math.PI / 2);
		var y1 = y0 + 40* Math.sin(lure_deg / 180 * Math.PI - Math.PI / 2);
		var x2 = x0 - 40* Math.cos(lure_deg / 180 * Math.PI - Math.PI / 2);
		var y2 = y0 - 40* Math.sin(lure_deg / 180 * Math.PI - Math.PI / 2);
		var line4 = s.line(x1,y1,x2,y2);
		line4.attr({
			 id:"line4",
			 stroke: "white",
			 strokeWidth:10
		});

		circledim = document.getElementById("circle5").getBoundingClientRect();
		circle_x = circledim.left-svgdim.left+circledim.width/2;
		circle_y = circledim.top-svgdim.top+circledim.width/2;
		var x0 = circle_x;
		var y0 = circle_y;
		lure_deg = Math.round(Math.random()+1)*90;
		var x1 = x0 + 40* Math.cos(lure_deg / 180 * Math.PI - Math.PI / 2);
		var y1 = y0 + 40* Math.sin(lure_deg / 180 * Math.PI - Math.PI / 2);
		var x2 = x0 - 40* Math.cos(lure_deg / 180 * Math.PI - Math.PI / 2);
		var y2 = y0 - 40* Math.sin(lure_deg / 180 * Math.PI - Math.PI / 2);
		var line5 = s.line(x1,y1,x2,y2);
		line5.attr({
			 id:"line5",
			 stroke: "white",
			 strokeWidth:10
		});

		circledim = document.getElementById("circle6").getBoundingClientRect();
		circle_x = circledim.left-svgdim.left+circledim.width/2;
		circle_y = circledim.top-svgdim.top+circledim.width/2;
		var x0 = circle_x;
		var y0 = circle_y;
		lure_deg = Math.round(Math.random()+1)*90;
		var x1 = x0 + 40* Math.cos(lure_deg / 180 * Math.PI - Math.PI / 2);
		var y1 = y0 + 40* Math.sin(lure_deg / 180 * Math.PI - Math.PI / 2);
		var x2 = x0 - 40* Math.cos(lure_deg / 180 * Math.PI - Math.PI / 2);
		var y2 = y0 - 40* Math.sin(lure_deg / 180 * Math.PI - Math.PI / 2);
		var line6 = s.line(x1,y1,x2,y2);
		line6.attr({
			 id:"line6",
			 stroke: "white",
			 strokeWidth:10
		});
		var coordinates = get_lure_loc();
		tgt_loc = stim[9];
		switch (tgt_loc) {
			case 1:
				document.getElementById("line1").remove();
				break;
			case 2:
				document.getElementById("line2").remove();
				break;
			case 3:
				document.getElementById("line3").remove();
				break;
			case 4:
				document.getElementById("line4").remove();
				break;
			case 5:
				document.getElementById("line5").remove();
				break;
			case 6:
				document.getElementById("line6").remove();
				break;
			};
		var tgt = s.line(coordinates[0],coordinates[1],coordinates[2],coordinates[3]);
		tgt.attr({
			id:"tgt",
			 stroke: "white",
			 strokeWidth:10
		});
		wordon = new Date().getTime();
		listening = true;
	};

	var show_probe = function(){
		document.body.style.cursor = 'auto';
		s = Snap('#svgMain');
		s.clear();
		var clrwheel = s.image("/static/images/colorwheel.png",212.8,72.8, 654.4,654.4);
		//var probe_ins = s.image("/static/images/ProbeInstruction.png",150,740,800,60);
		randr = Math.floor(Math.random() * 360);
		rand_str = randr.toString();
		var str1 = 'R';
		var str2 = ', 540, 400';
		var str = str1.concat(rand_str,str2);
		clrwheel.transform(str);
		response2_start = new Date().getTime();
		document.getElementById("svgMain").addEventListener("mousedown",getClickPosition, false);
	};

	var getClickPosition = function(evt) {
		var e = evt.target;
		var dim = document.getElementById("svgMain").getBoundingClientRect();
		xPos = evt.clientX-dim.left;
		yPos = evt.clientY-dim.top;
		new_x = xPos;
		new_y = yPos;
		if (xPos>540){
			side = 1;
			deg = Math.PI/2 + Math.atan((yPos-400)/(xPos-540));
		};
		if (xPos<540){
			side = 2;
			deg = 1.5*Math.PI + Math.atan((yPos-400)/(xPos-540));
		};
		if (xPos == 540){
			if (yPos <= 400){
				side = 3;
				deg = 0;
				var coordinates = [540, 72.8, 540, 95.8];
			};
			if (yPos > 400){
				side = 4;
				deg = Math.PI;
				var coordinates = [540, 727.2, 540, 800];
			};
		};

		new_deg = deg;
		actual_deg = deg;

		rotation = randr/180*Math.PI;
		actual_deg = actual_deg - rotation;
			if (actual_deg < 0){
				actual_deg = actual_deg + 2* Math.PI;
			};
		//console.log("new_deg"+ new_deg);
		//console.log("actual_deg"+ actual_deg);

		if (xPos != 400){
			var coordinates = get_line_loc(deg);
		};
		if (document.getElementById("line") !== null){
			document.getElementById("line").remove();
			};
		line = s.line(coordinates[0],coordinates[1],coordinates[2],coordinates[3]);
		line.attr({
			  id:"line",
			  stroke: "rgb(255,255,255)",
			  strokeWidth:10
			});
		if (document.getElementById("probe") !== null){
			document.getElementById("probe").remove();
			};
		probe = s.circle(540,400,50);
		deg = Math.round(actual_deg/Math.PI * 180);
		var pr = colorspace[deg][0];
		var pg = colorspace[deg][1];
		var pb = colorspace[deg][2];
		var str1 = 'rgb(';
		var str2 = ',';
		var str3 = ')';
		var probe_clr = str1.concat(pr.toString(), str2, pg.toString(), str2, pb.toString(), str3);
		//console.log(probe_clr);
		probe.attr({
			  id:"probe",
			  stroke: probe_clr,
			  fill: probe_clr,
			  strokeWidth:10
			});

		ifrotate = false;
		dragging = false;
		ifdrag = false;
		var down_x, down_y, last_angle;
		document.addEventListener("keypress", tonext, false);
		document.getElementById("line").addEventListener("mousedown",clickdown,false);
	};

	var clickdown = function(e){
		ifrotate = true;
		var dim = document.getElementById("svgMain").getBoundingClientRect();
		down_x = e.pageX-dim.left;
		down_y = e.pageY-dim.top;
		e.preventDefault();
		e.stopPropagation();
		dragging = true;
		document.addEventListener("mousemove", dragtomove, false);
	};

	var dragtomove = function(e){
		if(dragging){
			ifdrag = true;
			var dim = document.getElementById("svgMain").getBoundingClientRect();
			new_x = e.pageX-dim.left;
			new_y = e.pageY-dim.top;
			//console.log(new_x);
			if (new_x != down_x && new_y != down_y){//start rotate
				if (new_x>540){
					side = 1;
					new_deg = Math.PI/2 + Math.atan((new_y-400)/(new_x-540));
				};
				if (new_x<540){
					side = 2;
					new_deg = 1.5*Math.PI + Math.atan((new_y-400)/(new_x-540));
				};
				if (new_x == 540){
					if (new_y <= 400){
						side = 3;
						new_deg = 0;
						var coordinates = [540, 72.8, 540, 95.8];
					};
					if (new_y > 400){
						side = 4;
						new_deg = Math.PI;
						var coordinates = [540, 727.2, 540, 800];
					};
				};
			if (xPos != 400){
				var coordinates = get_line_loc(new_deg);
			};
			if (document.getElementById("line") !== null){
				document.getElementById("line").remove();
			};
			line = s.line(coordinates[0],coordinates[1],coordinates[2],coordinates[3]);
			line.attr({
			  id:"line",
			  stroke: "rgb(255,255,255)",
			  strokeWidth:10
				});
			};
			actual_deg = new_deg;

			rotation = randr/180*Math.PI;
			actual_deg = actual_deg - rotation;
				if (actual_deg < 0){
					actual_deg = actual_deg + 2* Math.PI;
				};
			//console.log("new_deg"+ new_deg);
			//console.log("actual_deg"+ actual_deg);
			if (document.getElementById("probe") !== null){
				document.getElementById("probe").remove();
				};
			probe = s.circle(540,400,50);
			deg = Math.round(actual_deg/Math.PI * 180);
			var pr = colorspace[deg][0];
			var pg = colorspace[deg][1];
			var pb = colorspace[deg][2];
			var str1 = 'rgb(';
			var str2 = ',';
			var str3 = ')';
			var probe_clr = str1.concat(pr.toString(), str2, pg.toString(), str2, pb.toString(), str3);
			//console.log(probe_clr);
			probe.attr({
				  id:"probe",
				  stroke: probe_clr,
				  fill: probe_clr,
				  strokeWidth:10
				});

			document.addEventListener("mouseup",finishdrag,false)
		};
	};

	var finishdrag = function (e){
		dragging = false;
	};


	var tonext = function(e){
		if (e.charCode == 32){
			var last_angle = actual_deg;
			var last_x = new_x;
			var last_y = new_y;
			//console.log(last_angle);
			var rt2 = new Date().getTime() - response2_start;
			document.getElementById("svgMain").removeEventListener("mousedown",getClickPosition, false);
			if (ifrotate == true){
				document.getElementById("line").removeEventListener("mousedown",clickdown,false);
			};
			if (ifdrag == true){
				document.removeEventListener("mousemove", dragtomove, false);
				document.removeEventListener("mouseup",finishdrag,false);
			};
			document.removeEventListener("keypress",tonext,false);
			psiTurk.recordTrialData({'xPos':last_x,
                                     'yPos':last_y,
                                     'deg_report': last_angle,
                                     'WMRT': rt2
                                     });
			ITI();
		};
	};


	var ITI = function(){
		var s = Snap('#svgMain');
		s.clear();
		var background = s.circle(540, 400, 50);
		background.attr({
		  id: "soa",
		  fill: "none",
		  stroke:"black",
		  strokeWidth:10
		})
		trial_count++;
		handle7 = setTimeout(function(){
				ifbreak()},500);
	};

	var ifbreak = function(){
		if (trial_count % 100 == 0 && trial_count != 400){
			var s = Snap('#svgMain');
			s.clear();
			var blockbreak = s.image("/static/images/break.png", 280,300);
			document.addEventListener("keypress",nextblock,false);
		}
		else{
			next();
		};
	};

	var nextblock = function(e){
		if (e.keyCode == 32){
			document.removeEventListener("keypress",nextblock,false);
			clearTimeout(handle7);
			next();
		}
	};

	var get_line_loc = function(d){
		a0 = 540;
		b0 = 400;
		if (side == 1){
			var a1 = a0 + 327* Math.cos(d-0.5 * Math.PI);
			var b1 = b0 + 327* Math.sin(d-0.5 * Math.PI);
			var a2 = a0 + 350* Math.cos(d-0.5 * Math.PI);
			var b2 = b0 + 350* Math.sin(d-0.5 * Math.PI);
		};
		if (side == 2){
			var a1 = a0 - 327* Math.cos(1.5 * Math.PI-d);
			var b1 = b0 + 327* Math.sin(1.5 * Math.PI-d);
			var a2 = a0 - 350* Math.cos(1.5 * Math.PI-d);
			var b2 = b0 + 350* Math.sin(1.5 * Math.PI-d);
		};
		var locs = [a1, b1, a2, b2];
		return locs;
	};



	// Load the stage.html snippet into the body of the page
	psiTurk.showPage('stage.html');

	// Register the response handler that is defined above to handle any
	// key down events.
	$("body").focus().keydown(response_handler);

	// Start the test
	next();
};


/****************
* Questionnaire *
****************/

var Questionnaire = function() {

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

	/*function ping(url) {
		var encodedURL = encodeURIComponent(url);
		var startDate = new Date();
		var endDate = null;
		$.ajax({
		  url: "http://query.yahooapis.com/v1/public/yql?q=select%20*%20from%20html%20where%20url%3D%22" + encodedURL + "%22&format=json",
		  type: "get",
		  async: false,
		  dataType: "json",
		  success: function(data) {
			if (data.query.results != null) {
				endDate = new Date();
			} else {
				endDate = null;
			}
		  },
		  error: function(){
			endDate = null;
		  }
		});

		if (endDate == null) {
			throw "Not responsive...";
		}

		return endDate.getTime() - startDate.getTime();
	};
	var responseInMillis = ping("example.com");*/


};

// Task object to keep track of the current phase
var currentview;
/*******************
 * Run Task
 ******************/
$(window).load( function(){
    psiTurk.doInstructions(
    	instructionPages, // a list of pages you want to display in sequence
    	function() { currentview = new Practice1(); } // what you want to do when you are done with instructions
    );
});
