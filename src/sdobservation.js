/********************************************
 * SdObservation -class
 ********************************************/
function SdObservation(label, motivation, observation, context, parent, derivations){
    if (motivation === undefined){
        motivation = {'text': '', 'subderiv': []};
    } 
    if (observation === undefined){
        observation = '';
    }
    if (context === undefined){
        context = '';
    }
    var virgin = false;
    if (motivation.text == ''){
        virgin = true;
    }
    this.virgin = false;
    if (observation == ''){
        this.virgin = true;
    }
    this.parent = parent;
    this.label = label;
    this.motivation = new SdMotivation(motivation.text, motivation.subderiv, virgin, 'observation', context, this.parent, derivations);
    this.text = observation;
}
_ = SdObservation.prototype;
_.label = '';
_.motivation = new SdMotivation;
_.text = '';
_.json = function(){
    return JSON.stringify(this.jsonobject());
}
_.jsonobject = function(){
    return [this.label, this.motivation.jsonobject(), this.text];
}
_.shiftLabel = function(steps){
    if (steps === undefined){
        steps = 1;
    }
    this.label = this.label + steps;
}
_.html = function(editmode, loc, extraparams){
    if (extraparams === undefined){
        extraparams = {};
    }
    var minusbuttons = [];
    var plusbuttons = [];
    var beforebuttons = '';
    var afterbuttons = '';
    var resultmot = this.motivation.html(editmode, loc+'_motivation');
//    beforebuttons += '<a href="javascript:;" class="removeobservation sdremovebutton" title="remove observation"><span>[-]</span></a>';
    minusbuttons.push('observation');
//    afterbuttons += '<a href="javascript:;" class="addobservation sdaddbutton" title="add observation"><span>[+]</span></a>';
    plusbuttons.push('observation');
    var beforebuttons = '<a href="javascript:;" class="sdremovebutton"><span>–</span></a>';
    var afterbuttons = '<a href="javascript:;" class="sdaddbutton"><span>+</span></a>';
    minusbuttons = '<span class="minusbuttons" menuitems="'+minusbuttons.join(' ')+'"></span>';
    plusbuttons = '<span class="plusbuttons" menuitems="'+plusbuttons.join(' ')+'"></span>';
    beforebuttons = '<div class="sdbeforebuttons">'+minusbuttons+beforebuttons+'</div>';
    afterbuttons = '<div class="sdafterbuttons">'+plusbuttons+afterbuttons+'</div>';
    resultmot = '<tr><td>'+beforebuttons+'[' + this.label + ']</td>' + resultmot + '</tr>\n';
    var tdbefore = '';
    var tdclass = '';
    if (this.motivation.subderivation.length > 0){
        tdbefore = '<span class="mathquill-embedded-latex">\\ldots</span>';
        tdclass = 'ldots';
    }
//    var resultobs = '$ '+this.text+'$';
    var resultobs = this.text;
    if (editmode == 'show'){
        resultobs = resultobs.replace(/\$([^\$]+)\$/g, '<span class="mathquill-embedded-latex">$1</span>');
    } else if (editmode == 'edit'){
        resultobs = '<span class="mathquill-textbox">'+resultobs+'</span>';
//        resultobs = resultobs.replace(/\$([^\$]+)\$/g, '<span class="mathquill-textbox">$1</span>');
    }
    var obsclass = this.virgin ? ' virgin' : '';
    resultobs = '<tr><td class="'+tdclass+'">'+tdbefore+'</td><td class="observation'+obsclass+'" loc="'+loc+'">' + resultobs + afterbuttons + '</td></tr>\n';
    var result = resultmot + resultobs;
    return result;
}

_.lyx = function(loc, extraparams){
    // LyX TÖÖKKÖ
    if (extraparams === undefined){
        extraparams = {};
    }
    var resultmot = this.motivation.html(editmode, loc+'_motivation');
    resultmot = '<tr><td>'+beforebuttons+'[' + this.label + ']</td>' + resultmot + '</tr>\n';
    var tdbefore = '';
    if (this.motivation.subderivation.length > 0){
        tdbefore = '<span class="mathquill-embedded-latex">\\ldots</span>';
    }
    var resultobs = this.text;
    resultobs = '<span class="mathquill-textbox">'+resultobs+'</span>';
    resultobs = '<tr><td class="'+tdclass+'">'+tdbefore+'</td><td class="observation'+obsclass+'" loc="'+loc+'">' + resultobs + afterbuttons + '</td></tr>\n';
    var result = resultmot + resultobs;
    return result;
}

_.getSubSaveData = function(){
    return this.motivation.getSubSaveData();
}

_.getSaveData = function(){
    return {"label": this.label, "motivation": this.motivation.getSaveData(), "text": this.text, "virgin": this.virgin};
}

