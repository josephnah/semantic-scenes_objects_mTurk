/* config.js
 *
 * This file contains the code necessary to load the configuration
 * for the experiment.
 */

// Enum-like object mapping experiment phase names to ids, in the
// order that the phases should be presented.
var EXPERIMENT = Object.freeze({
    practice: 0,
    experiment: 1,
    length: 2
});


var DisplayStimuli = function(disp_window, )