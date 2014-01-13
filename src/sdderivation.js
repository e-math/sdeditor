/********************************************
 * SdDerivation -class
 * Class for modelling a structured derivation
 * 
 * 
 * 
 ********************************************/
function SdDerivation(context, editor){
    /*********************************************
     * context: string - context of derivation ('tiddlywiki',...)
     *********************************************/
    this.editor = editor;
    this.name = '';
    this.task = [];
    this.assumption = [];
    this.observation = [];
    this.derivmotivation = [];
    this.term = [];
    this.relation = [];
    this.motivation = [];
    this.check = '';
    this.context = context;
}

SdDerivation.options = {};
SdDerivation.options.TiddlyWiki = {
    "saveTiddler": "QedDerivationsData",
    "recycleTiddler": "QedDerivationsRecycleBin"
}
// SdDerivation.options.Moodle = {
//     "questionID": ''
// }

SdDerivation.alphatonum = function(alpha){
    /***************************************
     * Converts alphabetical label to a number
     * a -> 0, b -> 1, ..., z -> 25, aa -> 26,
     * ab -> 27, ..., az -> 51,...
     ***************************************/
    var ll = 0;
    for (var i = 0; i<alpha.length; i++){
        if (alpha.length > 1 && i == 0){
            ll += alpha.charCodeAt(i)-96;
        } else {
            ll = 26*ll;
            ll += alpha.charCodeAt(i)-97;
        };
    };
    return ll;
}

SdDerivation.numtoalpha = function(num){
    /***************************************
     * Converts number to alphabetical label
     * 0 -> a, 1 -> b, ..., 25 -> z, 26 -> aa,
     * 27 -> ab, ...
     ***************************************/
    var remain=0;
    var result = '';
    while (result == '' || num > 25){
        remain = num % 26;
        result = String.fromCharCode(remain+97)+result;
        num = Math.floor(num / 26);
    };
    if (num > 0){
        remain = num % 26;
        result = String.fromCharCode(remain+96)+result;
    }
    return result
}

SdDerivation.shiftLabel = function(label, step){
    /*********************************************
     * Shift label 'step' steps. Positive -> forward, negative -> backwards.
     * label: string
     * step:  number
     *********************************************/
    if (step === undefined){
        step = 1;
    }
    ll = SdDerivation.alphatonum(label);
    ll += step;
    result = SdDerivation.numtoalpha(ll);
    return result
}
_ = SdDerivation.prototype;
_.name = '';
_.task = [];
_.assumption = [];
_.observation = [];
_.derivmotivation = [];
_.term = [];
_.relation = [];
_.motivation = [];
_.check = '';
_.hidden = false;
_.context = '';

// _.derivationExists = function(name, extraparams){
//     /*********************************************
//      * Check if derivation with given name exists. Returns boolean.
//      * Depends on the context, how saved derivations are checked.
//      * name: string - name of derivation
//      * extraparams: object of extra parameters.
//      *********************************************/
//     if (typeof(extraparams) == 'undefined'){
//         var extraparams = {};
//     }
//     switch(this.context){
//         case 'tiddlywiki':
//             var result;
//             var savetiddler = SdDerivation.options.TiddlyWiki.saveTiddler;
//             if (typeof(extraparams.tiddler) != 'undefined'){
//                 alert(name);
//                 savetiddler = extraparams.tiddler;
//                 result = !(typeof(DataTiddler.getData(savetiddler, 'derivations')[name]) == 'undefined');
//             } else {
//                 result = !(typeof(DataTiddler.getData(savetiddler, name)) == 'undefined');
//             }
//             return result;
//             break;
//         case 'moodlesa':
//             var questionId = this.name.replace(/sub[0-9]+$/,'');
//             var $savearea = jQuery('#'+questionId+' .ablock input[type="text"]');
//             var savestring = $savearea.val();
//             var savedata = '{}';
//             try {
//                 savedata = JSON.parse(savestring);
//             } catch(err) {
//                 savedata = {"derivations": {}, "recycled": {}};
//             }
//             if (typeof(savedata.derivations) == 'undefined'){
//                 savedata.derivations = {};
//             }
//             return (typeof(savedata.derivations[name]) != 'undefined');
//             break;
//         default:
//             return false;
//     }
// }

// _.getTiddlyDeriv = function(derivName, savetiddler){
//     /*********************************************
//      * Get derivation from tiddlywiki with DataTiddler-plugin
//      * derivName: string - name of derivation
//      * savetiddler: name of datatiddler
//      *********************************************/
//     var tiddler = SdDerivation.options.TiddlyWiki.saveTiddler;
//     var derivation;
//     if (typeof(savetiddler) != 'undefined'){
//         tiddler = savetiddler;
//         var emptyder = {};
//         emptyder[derivName] = {"task": [], "assumption": [], "observation": [], "derivmotivation": [], "term": [{"text": "", "virgin": false}], "relation": [], "motivation": [], "check": ""};
//         derivation = DataTiddler.getData(tiddler, 'derivations', emptyder)[derivName];
//     } else {
//         derivation = DataTiddler.getData(tiddler, derivName, {"task": [], "assumption": [], "observation": [], "derivmotivation": [], "term": [{"text": "", "virgin": false}], "relation": [], "motivation": [], "check": ""});
//     }
//     return derivation;
// }

// _.getMoodleSADeriv = function(derivName){
//     /*************************************************************
//      *************************************************************/
//     var questionId = derivName.replace(/sub[0-9]+$/,'');
//     var $savearea = jQuery('#'+questionId+' .ablock input[type="text"]');
//     var savestring = $savearea.val();
//     var savedata = '{}';
//     try {
//         savedata = JSON.parse(savestring);
//     } catch(err) {
//         savedata = {"derivations": {}, "recycled": {}};
//     }
//     if (typeof(savedata.derivations) == 'undefined'){
//         savedata.derivations = {};
//     }
//     var derivation = (typeof(savedata.derivations[derivName]) != 'undefined')?
//         savedata.derivations[derivName] : {"task": [], "assumption": [], "observation": [], "derivmotivation": [], "term": [{"text": "", "virgin": false}], "relation": [], "motivation": [], "check": ""};
//     return derivation;
// }

// _.open = function(derivName, extraparams){
//     /*********************************************
//      * Open derivation with given name.
//      * Implementation of open depends on the context.
//      * derivName: string - name of derivation
//      * extraparams: other parameters as object
//      *********************************************/
//     if (typeof(extraparams) == 'undefined'){
//         var extraparams = {};
//     }
//     var derivation = {};
//     switch(this.context){
//         case 'tiddlywiki':
//             derivation = this.getTiddlyDeriv(derivName, extraparams.tiddler);
//             break;
//         case 'moodlesa':
//             derivation = this.getMoodleSADeriv(derivName);
//             break;
//         default:
//             return 'Invalid context!';
//     }
//     this.name = derivName;
//     if (derivation.task.length > 0){
//         var task = new SdTask(derivation.task[0]);
//         this.task = [task];
//     } else {
//         this.task = [];
//     }
//     this.assumption = [];
//     for (var i=0; i<derivation.assumption.length; i++){
//         var ass = new SdAssumption(derivation.assumption[i].label, derivation.assumption[i].text);
//         this.assumption.push(ass);
//     }
//     this.observation = [];
//     for (var i=0; i<derivation.observation.length; i++){
//         var obs = new SdObservation(derivation.observation[i].label,
//                                     derivation.observation[i].motivation,
//                                     derivation.observation[i].text,
//                                     this.context,
//                                     extraparams
//                                    );
//         this.observation.push(obs);
//     }
//     this.derivmotivation = [];
//     if (derivation.derivmotivation.length > 0){
//         var dermot = new SdMotivation(derivation.derivmotivation[0].text, derivation.derivmotivation[0].subderiv, false, 'derivation', this.context, extraparams);
//         this.derivmotivation.push(dermot);
//     }
//     this.term = [];
//     for (var i=0; i<derivation.term.length; i++){
//         var term = new SdTerm(derivation.term[i].text, derivation.term[i].virgin);
//         this.term.push(term);
//     }
//     this.relation = [];
//     for (var i=0; i<derivation.relation.length; i++){
//         var rel = new SdRelation(derivation.relation[i].text, derivation.term[i].virgin);
//         this.relation.push(rel);
//     }
//     this.motivation = [];
//     for (var i=0; i<derivation.motivation.length; i++){
//         var mot = new SdMotivation(derivation.motivation[i].text, derivation.motivation[i].subderiv, derivation.motivation[i].virgin, 'step', this.context, extraparams);
//         this.motivation.push(mot);
//     }
//     this.check = derivation.check;
//     this.hidden = derivation.hidden;
// }

_.init = function(derivName, derivations){
    /*********************************************
     * Open derivation with given name.
     * Implementation of open depends on the context.
     * derivName:   string - name of derivation
     * derivations: object  - data derivation and each subderivation
     *********************************************/
    var emptyder = {
        "task": [],
        "assumption": [],
        "observation": [],
        "derivmotivation": [],
        "term": [{"text": "", "virgin": false}],
        "relation": [],
        "motivation": [],
        "check": ""
    };
    var derivation = derivations[derivName];
    if (typeof(derivation) == 'undefined'){
        derivation = emptyder;
    }
    this.name = derivName;
    if (derivation.task.length > 0){
        var task = new SdTask(derivation.task[0]);
        this.task = [task];
    } else {
        this.task = [];
    }
    this.assumption = [];
    for (var i=0; i<derivation.assumption.length; i++){
        var ass = new SdAssumption(derivation.assumption[i].label, derivation.assumption[i].text);
        this.assumption.push(ass);
    }
    this.observation = [];
    for (var i=0; i<derivation.observation.length; i++){
        var obs = new SdObservation(derivation.observation[i].label,
                                    derivation.observation[i].motivation,
                                    derivation.observation[i].text,
                                    this.context,
                                    this,
                                    derivations
                                   );
        this.observation.push(obs);
    }
    this.derivmotivation = [];
    if (derivation.derivmotivation.length > 0){
        var dermot = new SdMotivation(derivation.derivmotivation[0].text,
                                      derivation.derivmotivation[0].subderiv,
                                      false,
                                      'derivation',
                                      this.context,
                                      this,
                                      derivations);
        this.derivmotivation.push(dermot);
    }
    this.term = [];
    for (var i=0; i<derivation.term.length; i++){
        var term = new SdTerm(derivation.term[i].text, derivation.term[i].virgin);
        this.term.push(term);
    }
    this.relation = [];
    for (var i=0; i<derivation.relation.length; i++){
        var rel = new SdRelation(derivation.relation[i].text, derivation.term[i].virgin);
        this.relation.push(rel);
    }
    this.motivation = [];
    for (var i=0; i<derivation.motivation.length; i++){
        var mot = new SdMotivation(derivation.motivation[i].text,
                                   derivation.motivation[i].subderiv,
                                   derivation.motivation[i].virgin,
                                   'step',
                                   this.context,
                                   this,
                                   derivations);
        this.motivation.push(mot);
    }
    this.check = derivation.check;
    this.hidden = derivation.hidden;
}

_.getSaveData = function(){
    /*********************************************
     * Get the derivation data for saving.
     * Returns an array of datas for derivation and each subderivation.
     *********************************************/
    var result = {};
    var subderivs = [];
    result["task"] = [];
    for (var i = 0; i < this.task.length; i++){
        result["task"].push(this.task[i].getSaveData());
    }
    result["assumption"] = [];
    for (var i = 0; i < this.assumption.length; i++){
        result["assumption"].push(this.assumption[i].getSaveData());
    }
    result["observation"] = [];
    for (var i = 0; i < this.observation.length; i++){
        result["observation"].push(this.observation[i].getSaveData());
        var subders = this.observation[i].getSubSaveData();
        for (var j=0; j<subders.length; j++){
            subderivs.push(subders[j]);
        }
    }
    result["derivmotivation"] = [];
    for (var i = 0; i < this.derivmotivation.length; i++){
        result["derivmotivation"].push(this.derivmotivation[i].getSaveData());
        var subders = this.derivmotivation[i].getSubSaveData();
        for (var i=0; i<subders.length; i++){
            subderivs.push(subders[i]);
        }
    }
    result["term"] = [];
    for (var i = 0; i < this.term.length; i++){
        result["term"].push(this.term[i].getSaveData());
    }
    result["relation"] = [];
    for (var i = 0; i < this.relation.length; i++){
        result["relation"].push(this.relation[i].getSaveData());
    }
    result["motivation"] = [];
    for (var i = 0; i < this.motivation.length; i++){
        result["motivation"].push(this.motivation[i].getSaveData());
        var subders = this.motivation[i].getSubSaveData();
        for (var j=0; j<subders.length; j++){
            subderivs.push(subders[j]);
        }
    }
    result["check"] = this.check;
    result["hidden"] = this.hidden;
    subderivs.push({'name': this.name, 'data': result});
    return subderivs;
}
// _.save = function(extraparams, derivName){
//     /******************************************************
//      * Save derivation with given name.
//      * Calls for different save-functions for different contexts.
//      * derivName: string - name of derivation
//      * extraparams: other parameters as object
//      ******************************************************/
//     if (derivName === undefined){
//         derivName = this.name;
//     }
//     if (typeof(extraparams) == 'undefined'){
//         var extraparams = {};
//     }
//     switch(this.context){
//         case 'tiddlywiki':
//             this.saveTiddly(derivName, extraparams.tiddler);
//             break;
//         case 'moodlesa':
//             this.saveMoodleSA(derivName);
//             break;
//         default:
//             return 'Invalid context!';
//     }
// }
// _.saveTiddly = function(derivName, savetiddler){
//     /******************************************************
//      * Save derivation with given name in tiddlywiki with DataTiddler-plugin.
//      * derivName: string - name of derivation
//      * savetiddler: string - name of datatiddler
//      ******************************************************/
//     var tiddler = SdDerivation.options.TiddlyWiki.saveTiddler;
//     var derivations = this.getSaveData();
//     if (typeof(savetiddler) != 'undefined'){
//         // If name of datatiddler is given
//         tiddler = savetiddler;
//         var alldata = DataTiddler.getData(tiddler, 'derivations');
//         for (var i = 0; i<derivations.length; i++){
//             alldata[derivations[i].name] = derivations[i].data;
//         }
//         DataTiddler.setData(tiddler, 'derivations', alldata);
//     } else {
//         // If we save in default datatiddler
//         for (var i = 0; i<derivations.length; i++){
//             DataTiddler.setData(tiddler, derivations[i].name, derivations[i].data);
//         }
//     }
// }
// _.saveMoodleSA = function(derivName){
//     if (typeof(derivName) == 'undefined'){
//         derivName = this.name;
//     }
//     var questionId = derivName.replace(/sub[0-9]+$/,'');
//     var $savearea = jQuery('#'+questionId+' .ablock input[type="text"]');
//     var savestring = $savearea.val();
//     var savedata = '{}';
//     try {
//         savedata = JSON.parse(savestring);
//     } catch(err) {
//         savedata = {"derivations": {}, "recycled": {}};
//     }
//     if (typeof(savedata.derivations) == 'undefined'){
//         savedata.derivations = {};
//     }
//     var derivations = this.getSaveData();
//     for (var i = 0; i<derivations.length; i++){
//         savedata.derivations[derivations[i].name] = derivations[i].data;
//     }
//     savestring = JSON.stringify(savedata);
//     $savearea.val(savestring);
//     if (this.saveajax){
//         var formUrl = $('form#responseform').attr('action') + '#' + questionId;
//         var $ajaxanswer = jQuery('<div class="ajaxanswer"></div>');
//         var formdata = {};
//         formdata['resp' + questionId.slice(1) + '_'] = savestring;
//         formdata['resp' + questionId.slice(1) + '_submit'] = 'Submit';
//         formdata['timeup'] = 0;
//         formdata['questionids'] = questionId.slice(1);
//         testilogit.ajaxresponse = jQuery.post(formUrl, formdata);
//     }
// }
// _.deleteDeriv = function(rootderiv, extraparams){
//     /******************************************************
//      * Delete this derivation from save storage.
//      * Different implementations for different contexts.
//      * rootderiv: string - name of the main derivation (optional)
//      *                     If not given, root = this
//      * extraparams: object - other parameters
//      ******************************************************/
//     if (typeof(rootderiv) == 'undefined'){
//         rootderiv = this.name;
//     }
//     if (typeof(extraparams) == 'undefined'){
//         var extraparams = {};
//     }
//     switch(this.context){
//         case 'tiddlywiki':
//             if (rootderiv == this.name){
//                 this.deleteTiddly(extraparams.tiddler);
//             } else {
//                 this.recycleTiddly(rootderiv, extraparams.tiddler);
//             }
//             break;
//         case 'moodlesa':
//             if (rootderiv == this.name){
//                 this.deleteMoodleSA();
//             } else {
//                 this.recycleMoodleSA(rootderiv);
//             }
//             break;
//         default:
//             return 'Invalid context!';
//     }    
// }
// _.deleteTiddly = function(savetiddler){
//     /******************************************************
//      * Delete this derivation from TiddlyWiki's DataTiddler.
//      * savetiddler: string - name of datatiddler
//      ******************************************************/
//     var tiddler = SdDerivation.options.TiddlyWiki.saveTiddler;
//     if (typeof(savetiddler) != 'undefined'){
//         tiddler = savetiddler;
//         var alldata = DataTiddler.getData(tiddler, 'derivations',{});
//         delete alldata[this.name];
//         DataTiddler.setData(tiddler, 'derivations', alldata);
//     } else {
//         DataTiddler.setData(tiddler, this.name);
//     }
// }
// _.deleteMoodleSA = function(){
//     /******************************************************
//      * Delete this derivation from Moodle's short answer question inputbox.
//      ******************************************************/
//     var questionId = this.name.replace(/sub[0-9]+$/,'');
//     var $savearea = jQuery('#'+questionId+' .ablock input[type="text"]');
//     var savestring = $savearea.val();
//     var savedata = '{}';
//     try {
//         savedata = JSON.parse(savestring);
//     } catch(err) {
//         savedata = {"derivations": {}, "recycled": {}};
//     }
//     delete savedata.derivations[this.name];
//     savestring = JSON.stringify(savedata);
//     $savearea.val(savestring);
// }
// 
// _.recycleTiddly = function(rootderiv, savetiddler){
//     /******************************************************
//      * Don't delete yet, but mark this derivation for recycle
//      * savetiddler: string - name of datatiddler
//      ******************************************************/
//     var tiddler = SdDerivation.options.TiddlyWiki.recycleTiddler;
//     if (typeof(savetiddler) != 'undefined'){
//         tiddler = savetiddler;
//         var alldata = DataTiddler.getData(tiddler, 'recycled', {});
//         var data = alldata[rootderiv];
//         if (typeof(data) == 'undefined'){
//             data = [];
//         }
//         if (data.indexOf(this.name) == -1){
//             data.push(this.name);
//         }
//         alldata[rootderiv] = data;
//         DataTiddler.setData(tiddler, 'recycled', alldata);
//     } else {
//         var data = DataTiddler.getData(tiddler, rootderiv, []);
//         if (data.indexOf(this.name) == -1){
//             data.push(this.name);
//         }
//         DataTiddler.setData(tiddler, rootderiv, data);
//     }
// }
// _.recycleMoodleSA = function(rootderiv){
//     /******************************************************
//      * Don't delete yet, but mark this derivation for recycle
//      ******************************************************/
//     var questionId = this.name.replace(/sub[0-9]+$/,'');
//     var $savearea = jQuery('#'+questionId+' .ablock input[type="text"]');
//     var savestring = $savearea.val();
//     var savedata = '{}';
//     try {
//         savedata = JSON.parse(savestring);
//     } catch(err) {
//         savedata = {"derivations": {}, "recycled": {}};
//     }
//     if (typeof(savedata.recycled) == 'undefined'){
//         savedata.recycled = {};
//     }
//     var data = savedata.recycled[rootderiv];
//     if (typeof(data) == 'undefined'){
//         data = [];
//     }
//     if (data.indexOf(this.name) == -1){
//         data.push(this.name);
//     }
//     savedata.recycled[rootderiv] = data;
//     savestring = JSON.stringify(savedata);
//     $savearea.val(savestring);
// }
// _.recycleCancel = function(rootderiv, extraparams){
//     /******************************************************
//      * Cancel deleting by removing mark for recycle
//      ******************************************************/
//     if (typeof(extraparams) == 'undefined'){
//         var extraparams = {};
//     }
//     switch(this.context){
//         case 'tiddlywiki':
//             this.recycleCancelTiddly(rootderiv, extraparams.tiddler);
//             break;
//         case 'moodlesa':
//             this.recycleCancelMoodleSA(rootderiv);
//             break;
//         default:
//             return 'Invalid context!';
//     }
// }
// _.recycleCancelTiddly = function(rootderiv, savetiddler){
//     /******************************************************
//      * Cancel deleting by removing mark for recycle
//      * Implementation for TiddlyWiki
//      ******************************************************/
//     var tiddler = SdDerivation.options.TiddlyWiki.recycleTiddler;
//     if (typeof(savetiddler) != 'undefined'){
//         tiddler = savetiddler;
//         var alldata = DataTiddler.getData(tiddler, 'recycled', {});
//         var data = (typeof(alldata[rootderiv]) != 'undefined') ? alldata[rootderiv] : [];
//         var datapos = data.indexOf(this.name);
//         if (datapos != -1){
//             data.splice(datapos, 1);
//         }
//         if (data.length == 0){
//             delete alldata[rootderiv];
//         }
//         DataTiddler.setData(tiddler, 'recycled', alldata);
//     } else {
//         var data = DataTiddler.getData(tiddler, rootderiv, []);
//         var datapos = data.indexOf(this.name);
//         if (datapos != -1){
//             data.splice(datapos, 1);
//         }
//         if (data.length == 0){
//             DataTiddler.setData(tiddler, rootderiv);
//         } else {
//             DataTiddler.setData(tiddler, rootderiv, data);
//         }
//     }
// }
// 
// _.recycleCancelMoodleSA = function(rootderiv){
//     /******************************************************
//      * Cancel deleting by removing mark for recycle
//      * Implementation for Moodle's short answer questions
//      ******************************************************/
//     var questionId = this.name.replace(/sub[0-9]+$/,'');
//     var $savearea = jQuery('#'+questionId+' .ablock input[type="text"]');
//     var savestring = $savearea.val();
//     var savedata = '{}';
//     try {
//         savedata = JSON.parse(savestring);
//     } catch(err) {
//         savedata = {"derivations": {}, "recycled": {}};
//     }
//     if (typeof(savedata.recycled) == 'undefined'){
//         savedata.recycled = {};
//     }
//     var data = savedata.recycled[rootderiv];
//     if (typeof(data) == 'undefined'){
//         data = [];
//     }
//     var datapos = data.indexOf(this.name);
//     if (datapos != -1){
//         data.splice(datapos, 1);
//     }
//     if (data.length == 0){
//         delete savedata.recycled[rootderiv];
//     } else {
//         savedata.recycled[rootderiv] = data;
//     }
//     savestring = JSON.stringify(savedata);
//     $savearea.val(savestring);    
// }

_.findLocation = function(loc){
    /******************************************************************
     * Find the location in derivation by location string.
     * loc: string - directions for element in derivation tree.
     * example:
     * loc = derivation_observation_1_motivation_subderivation_2_term_3
     ******************************************************************/
    var locarr = loc.split('_');
    locarr.shift();
    var place = this;
    var l = '';
    var prev = '';
    while (locarr.length > 0){
        if (prev == 'observation' && locarr[0] == 'motivation' && /^[0-9]+$/.test(locarr[1])){
            prev = l;
            l = locarr.shift();
            locarr.shift();
        } else {
            prev = l;
            l = locarr.shift();
        }
        place = place[l];
    }
    return place;
}

_.addTask = function(task){
    /******************************************************************
     * Add task
     ******************************************************************/
    if (typeof(task) == 'string'){
        task = new SdTask(task);
    }
    this.task = [task];
}

_.removeTask = function(){
    /******************************************************************
     * Remove task
     ******************************************************************/
    this.task = [];
}

_.addStep = function(pos, data){
    /******************************************************************
     * Add step in position pos
     ******************************************************************/
    if (typeof(data) == 'undefined'){
        var emptymot = {'text': '', 'subderiv': []};
        data = {'relation': '', 'motivation': emptymot, 'term': ''};
    }
    var virginrel = (data.relation == '' || data.relation == ' ');
    var relation = new SdRelation(data.relation, virginrel);
    var motivation = new SdMotivation(data.motivation.text,
                                      data.motivation.subders,
                                      true,
                                      'step',
                                      this.context,
                                      this,
                                      {}
                                     );
    var term = new SdTerm(data.term, true);
    this.term.splice(parseInt(pos)+1,0,term);
    this.relation.splice(pos,0,relation);
    this.motivation.splice(pos,0,motivation);
}

_.removeStep = function(pos){
    /******************************************************************
     * Remove step in position pos
     ******************************************************************/
    this.relation.splice(pos,1);
    this.motivation.splice(pos,1);
    this.term.splice(parseInt(pos)+1,1);
}

_.addAssumption = function(pos, data){
    /******************************************************************
     * Add assumption in position pos
     ******************************************************************/
    if (typeof(data) == 'undefined'){
        data = '';
    }
    var label = SdDerivation.numtoalpha(pos);
    var assumption = new SdAssumption(label, data);
    for (var i = pos; i < this.assumption.length; i++){
        this.assumption[i].shiftLabel(1);
    }
    this.assumption.splice(pos,0,assumption);
}

_.removeAssumption = function(pos){
    /******************************************************************
     * Remove assumption in position pos
     ******************************************************************/
    for (var i = pos+1; i < this.assumption.length; i++){
        this.assumption[i].shiftLabel(-1);
    }
    this.assumption.splice(pos,1);
}

_.addObservation = function(pos, observation){
    /******************************************************************
     * Add observation in position pos
     ******************************************************************/
    if (pos >= this.observation.length){
        var label = this.observation.length +1;
    } else {
        var label = this.observation[pos].label;
    }
    if (typeof(observation) == 'undefined' || observation == ''){
        var emptymot = {'text': '', 'subderiv': []};
        var observation = new SdObservation(label, emptymot, '', this.context, this, {});
    }
    for (var i = pos; i < this.observation.length; i++){
        this.observation[i].shiftLabel(1);
    }
    this.observation.splice(pos,0,observation);
}

_.removeObservation = function(pos){
    /******************************************************************
     * Remove observation in position pos
     ******************************************************************/
    for (var i = pos+1; i < this.observation.length; i++){
        this.observation[i].shiftLabel(-1);
    }
    this.observation.splice(pos,1);
}

_.addDermot = function(dermot){
    /******************************************************************
     * Add derivation motivation
     ******************************************************************/
    if (typeof(dermot) == 'undefined'){
        dermot = '';
    }
    var newdermot = new SdMotivation(dermot, [], true, 'derivation', this.context, this, {});
    this.derivmotivation = [newdermot];
}

_.removeDermot = function(){
    /******************************************************************
     * Remove derivation motivation
     ******************************************************************/
    this.derivmotivation = [];
}

_.addSubderivation = function(loc, pos, name){
    /******************************************************************
     * Add (an empty) subderivation
     * loc:  string - location-string of motivation
     * pos:  number - index of subderivation in this motivation
     * name: string - name of the subderivation (optional)
     ******************************************************************/
    if (typeof(name) == 'undefined' || name == ''){
        var locarray = loc.split('_');
        name = locarray[0] + 'sub';
        var subnum = 0;
        var freesub = false;
        var maxcount = 10000; // for safety
        while (!freesub && subnum < maxcount){
            if (this.editor.derivationExists(name+subnum)){
                subnum++;
            } else {
                freesub = true;
            }
        }
        name = name+subnum;
    }
    var mot = this.findLocation(loc);
    mot.addSubderivation(name, pos, this.context);
}

_.addSubderivationObject = function(loc, pos, subder){
    /******************************************************************
     * Add (an existing) subderivation
     * loc:    string - location-string of motivation
     * pos:    number - index of subderivation in this motivation
     * subder: SdSubderivation - subderivation object
     ******************************************************************/
    var mot = this.findLocation(loc);
    mot.addSubderivationObject(subder, pos);    
}

_.removeSubderivation = function(loc, pos){
    /******************************************************************
     * Remove subderivation recursively
     * loc: string - location-string for motivation
     * pos: number - index of subderivation in motivation
     ******************************************************************/
    var mot = this.findLocation(loc);
    var rootDeriv = loc.split('_')[0];
    var removed = mot.removeSubderivation(pos, rootDeriv);
    // TODO: remove rootDeriv argument
    return removed;
}
_.html = function(editmode, loc){
    /******************************************************************
     * Return this structured derivation as html string.
     * editmode = 'show'|'edit'|'showcontent'|null
     *   This controls, if math is shown as mathquill-embedded-latex (show),
     *   as mathquill-textbox / mathquill-editable (edit),
     *   as mathquill-embedded-latex without surrounding div (showcontent) or just
     *   as math between $-signs to be rendered with something else (null/other).
     * loc = location in subderivation as a string
     *   (for example 'deriv_observation_1_motivation_subderivation_2_term_3')
     *   used with subderivations.
     ******************************************************************/
    loc = (typeof(loc) === 'undefined')?this.name:loc;
    var prefix = '';
    var suffix = '';
    if (!this.issubderivation){
        if (editmode == 'edit'){
/*            prefix += '<a href="javascript:;" class="button command_qedclose command_editorclose" title="Close"></a>\n';
            prefix += '<a href="javascript:;" class="button command_qedundo command_editorundo" title="Undo"><span>↶</span></a>\n';
            prefix += '<a href="javascript:;" class="button command_qedredo command_editorredo" title="Redo"><span>↷</span></a>\n';*/
            // TODO: Move these buttons to QedEditor!!!
        } else if (editmode == 'showcontent'){
            editmode = 'show';
            prefix += '<a href="javascript:;" class="button command_qededit"></a>\n';
            prefix = '<div class="qededitorbuttons">\n' + prefix + '</div>\n';
        } else {
            prefix += '\n<div class="structuredderivation" sdname="'+this.name+'">\n';
            prefix += '<a href="javascript:;" class="button command_qededit"></a>\n<div class="sdbackground">\n';            
            prefix = '<div class="qededitorbuttons">\n' + prefix + '</div>\n';
            suffix = '</div>\n</div>';
        }
    }
    var result = prefix;
    result += '<table class="sdtable">\n<tbody>\n';

    /**** Task, assumptions, observations and derivationmotivation *********/
    var extraparams = '';
    var parts = ['task', 'assumption', 'observation', 'derivmotivation'];
    for (var i=0; i<parts.length; i++){
        for (var j=0; j<this[parts[i]].length; j++){
            switch (parts[i]){
                case 'task':
                    extraparams = {'ass': (this.assumption.length > 0), 'obs': (this.observation.length > 0), 'dermot': (this.derivmotivation.length > 0), 'issub': this.issubderivation };
                    break;
                case 'assumption':
                    extraparams = {'last': (j == this.assumption.length - 1)};
                    break;
                case 'observation':
                    extraparams = {};
                    break;
                case 'derivmotivation':
                    extraparams = {};
                    break;
                default:
                    extraparams = {};
            }
            result += this[parts[i]][j].html(editmode, loc+'_'+parts[i]+'_'+j, extraparams);
        }
    }
    
    /**** Steps (term, relation, motivation) *****************/
    if (this.term.length > 0){
        var last = (this.term.length == 1 && this.issubderivation);
        if (this.task.length > 0){
            if (this.derivmotivation.length > 0){
                result += this.term[0].html(editmode, loc+'_term_0', {'termtype': '', 'last': last});
            } else {
                result += this.term[0].html(editmode, loc+'_term_0', {'termtype': 'vdash', 'last': last});
            }
        } else {
            var first = this.issubderivation;
            result += this.term[0].html(editmode, loc+'_term_0', {'termtype': 'bullet', 'last': last, 'first': first});
        }
        for (var i = 0; i < this.motivation.length; i++){
            result += this.relation[i].html(editmode, loc+'_relation_'+i);
            result += this.motivation[i].html(editmode, loc+'_motivation_'+i);
            last = (i == this.motivation.length-1 && this.issubderivation);
            if (this.motivation[i].subderivation.length > 0){
                result += this.term[i+1].html(editmode, loc+'_term_'+(i+1), {'termtype': 'ldots', 'last': last});
            } else {
                result += this.term[i+1].html(editmode, loc+'_term_'+(i+1), {'termtype': '', 'last': last});
            }
        }
    }
    if (!(this.issubderivation)){
        var square = '<tr><td>$\\square$</td><td></td></tr>';
        if (editmode == 'show' || editmode == 'edit'){
            square = square.replace(/\$([^\$]+)\$/g, '<span class="mathquill-embedded-latex">$1</span>');
        }
        result += square;
    }
    result += '</tbody>\n</table>\n';
    result += suffix;
    return result;
}

_.lyx = function(loc){
    /******************************************************************
     * Return this structured derivation as a string.
     * outtype = 'html'|'lyx'|...
     *   Type of output string
     * editmode = 'show'|'edit'|'showcontent'|null
     *   This controls, if math is shown as mathquill-embedded-latex (show),
     *   as mathquill-textbox / mathquill-editable (edit),
     *   as mathquill-embedded-latex without surrounding div (showcontent) or just
     *   as math between $-signs to be rendered with something else (null/other).
     * loc = location in subderivation as a string
     *   (for example 'deriv_observation_1_motivation_subderivation_2')
     *   used with subderivations.
     ******************************************************************/
    loc = (typeof(loc) === 'undefined')?this.name:loc;
    var prefix = '';
    var suffix = '';
    if (!this.issubderivation){
        //// LyX TÖÖKKÖ
        prefix = ''
        suffix = '';
    }
    var result = prefix;
    result += '<table class="sdtable">\n<tbody>\n';

    /**** Task, assumptions, observations and derivationmotivation *********/
    var extraparams = '';
    var parts = ['task', 'assumption', 'observation', 'derivmotivation'];
    for (var i=0; i<parts.length; i++){
        for (var j=0; j<this[parts[i]].length; j++){
            switch (parts[i]){
                case 'task':
                    extraparams = {'ass': (this.assumption.length > 0), 'obs': (this.observation.length > 0), 'dermot': (this.derivmotivation.length > 0), 'issub': this.issubderivation };
                    break;
                case 'assumption':
                    extraparams = {'last': (j == this.assumption.length - 1)};
                    break;
                case 'observation':
                    extraparams = {};
                    break;
                case 'derivmotivation':
                    extraparams = {};
                    break;
                default:
                    extraparams = {};
            }
            result += this[parts[i]][j].lyx(loc+'_'+parts[i]+'_'+j, extraparams);
        }
    }
    
    /**** Steps (term, relation, motivation) *****************/
    if (this.term.length > 0){
        var last = (this.term.length == 1 && this.issubderivation);
        if (this.task.length > 0){
            if (this.derivmotivation.length > 0){
                result += this.term[0].lyx(loc+'_term_0', {'termtype': '', 'last': last});
            } else {
                result += this.term[0].lyx(loc+'_term_0', {'termtype': 'vdash', 'last': last});
            }
        } else {
            var first = this.issubderivation;
            result += this.term[0].lyx(loc+'_term_0', {'termtype': 'bullet', 'last': last, 'first': first});
        }
        for (var i = 0; i < this.motivation.length; i++){
            result += this.relation[i].lyx(loc+'_relation_'+i);
            result += this.motivation[i].lyx(loc+'_motivation_'+i);
            last = (i == this.motivation.length-1 && this.issubderivation);
            if (this.motivation[i].subderivation.length > 0){
                result += this.term[i+1].lyx(loc+'_term_'+(i+1), {'termtype': 'ldots', 'last': last});
            } else {
                result += this.term[i+1].lyx(loc+'_term_'+(i+1), {'termtype': '', 'last': last});
            }
        }
    }
    if (!(this.issubderivation)){
        ////  LyX TÖÖKKÖ
        var square = '<tr><td>$\\square$</td><td></td></tr>';
        result += square;
    }
    result += '</tbody>\n</table>\n';
    result += suffix;
    return result;
}


_.json = function(){
    return JSON.stringify(this.jsonobject());
}
_.jsonobject = function(){
    var jsonobj = {};
    jsonobj["derivations"] = [];
    var derivobj = {};
    derivobj["name"] = this.name;
    derivobj["task"] = [];
    for (var i=0; i<this.task.length; i++){
        derivobj["task"].push(this.task[i].jsonobject());
    }
    derivobj["assumptions"] = [];
    for (var i=0; i<this.assumption.length; i++){
        derivobj["assumptions"].push(this.assumption[i].jsonobject());
    }
    derivobj["observations"] = [];
    for (var i=0; i<this.observation.length; i++){
        derivobj["observations"].push(this.observation[i].jsonobject());
    }
    derivobj["chain"] = {};
    derivobj["chain"]["terms"] = [];
    for (var i=0; i<this.term.length; i++){
        derivobj["chain"]["terms"].push(this.term[i].jsonobject());
    }
    derivobj["chain"]["relations"] = [];
    for (var i=0; i<this.relation.length; i++){
        derivobj["chain"]["relations"].push(this.relation[i].jsonobject());
    }
    derivobj["chain"]["motivations"] = [];
    for (var i=0; i<this.motivation.length; i++){
        derivobj["chain"]["motivations"].push(this.motivation[i].jsonobject());
    }
    jsonobj["derivations"].push(derivobj);
    return jsonobj;
}

_.eventDo = function(eEvent){
    /******************************************************
     * Execute given editor event
     * eEvent: EditorEvent -object describing the editor action.
     ******************************************************/
    var result = false;
    switch (eEvent.event){
        /**** Add events ***************************************************/
        case 'add':
            switch (eEvent.item){
                case 'task':
                    var derivation = this.findLocation(eEvent.location);
                    derivation.addTask(eEvent.newData());
                    result = true;
                    break;
                case 'taskass':
                    var derivation = this.findLocation(eEvent.location);
                    derivation.addTask(eEvent.newData());
                    derivation.addAssumption(0, '');
                    if (derivation.term.length == 1){
                        derivation.term[0].text = '';
                    }
                    result = true;
                    break;
                case 'taskobs':
                    var derivation = this.findLocation(eEvent.location);
                    derivation.addTask(eEvent.newData());
                    derivation.addObservation(0, '');
                    if (derivation.term.length == 1){
                        derivation.term[0].text = '';
                    }
                    result = true;
                    break;
                case 'assumption':
                    var derivation = this.findLocation(eEvent.location);
                    derivation.addAssumption(eEvent.position, eEvent.newData());
                    result = true;
                    break;
                case 'observation':
                    var derivation = this.findLocation(eEvent.location);
                    derivation.addObservation(eEvent.position, eEvent.newData());
                    result = true;
                    break;
                case 'derivationmotivation':
                    var derivation = this.findLocation(eEvent.location);
                    derivation.addDermot(eEvent.newData());
                    result = true;
                    break;
                case 'step':
                    var derivation = this.findLocation(eEvent.location);
                    derivation.addStep(eEvent.position, eEvent.newData());
                    result = true;
                    break;
                case 'subderivation':
                    if (eEvent.newData() == ''){
                        this.addSubderivation(eEvent.location, eEvent.position, eEvent.newData());
                    } else {
                        this.addSubderivationObject(eEvent.location, eEvent.position, eEvent.newData());
                    }
                    result = true;
                    break;
                default:
                    result = true;
                    break;
            }
            break;
        /**** Remove events ************************************************/
        case 'remove':
            switch (eEvent.item){
                case 'task':
                    var derivation = this.findLocation(eEvent.location);
                    derivation.removeTask();
                    result = true;
                    break;
                case 'taskass':
                    var derivation = this.findLocation(eEvent.location);
                    derivation.removeTask();
                    derivation.removeAssumption(0);
                    if (derivation.term.length == 1){
                        derivation.term[0].text = eEvent.newData();
                    }
                    result = true;
                    break;
                case 'taskobs':
                    var derivation = this.findLocation(eEvent.location);
                    derivation.removeTask();
                    derivation.removeObservation(0);
                    if (derivation.term.length == 1){
                        derivation.term[0].text = eEvent.newData();
                    }
                    result = true;
                    break;
                case 'assumption':
                    var derivation = this.findLocation(eEvent.location);
                    derivation.removeAssumption(eEvent.position);
                    result = true;
                    break;
                case 'observation':
                    var derivation = this.findLocation(eEvent.location);
                    derivation.removeObservation(eEvent.position);
                    result = true;
                    break;
                case 'derivationmotivation':
                    var derivation = this.findLocation(eEvent.location);
                    derivation.removeDermot();
                    result = true;
                    break;
                case 'step':
                    var derivation = this.findLocation(eEvent.location);
                    derivation.removeStep(eEvent.position);
                    result = true;
                    break;
                case 'subderivation':
                    result = this.removeSubderivation(eEvent.location, eEvent.position);
                    break;
                default:
                    result = true;
                    break;
            }
            break;
        /**** Edit events **************************************************/
        case 'edit':
            var element = this.findLocation(eEvent.location);
            if (typeof(element.virgin) != 'undefined' && element.virgin){
                element.virgin = false;
            }
            element.text = eEvent.newData();
            result = true;
            break;
        default:
            break;
            result = true;
    }
    return result;
}



/********************************************
 * SdSubDerivation -subclass
 ********************************************/
function SdSubDeriv(derivName, context, editor, derivations){
    if (typeof(derivations) == 'undefined'){
        var derivations = {};
    }
    this.editor = editor;
    this.name = '';
    this.task = [];
    this.assumption = [];
    this.observation = [];
    this.derivmotivation = [];
    this.term = [];
    this.relation = [];
    this.motivation = [];
    this.check = '';
    this.hidden = false;
    this.issubderivation = true;
    this.context = context;
    this.init(derivName, derivations);
}
_ = SdSubDeriv.prototype = new SdDerivation;
_.htmlSub = function(editmode, loc){
    var result = this.html(editmode, loc);
    var divclasses = 'sdsubderivation';
    if (this.hidden){
        divclasses += ' sdhiddensub';
    }
    result = '\n\n\n<div class="' + divclasses +'">\n' + result + '</div>\n\n\n';
    return result;
}
_.lyxSub = function(loc){
    var result = this.lyx(loc);
    result = '\n\n\n<div class="">\n' + result + '</div>\n\n\n';
    return result;
}
