/********************************************
 * SdAssumption -class
 ********************************************/
function SdAssumption(label, assumption){
    this.label = label;
    this.text = assumption;
    this.virgin = false;
    if (assumption == ''){
        this.virgin = true;
    }
}
_ = SdAssumption.prototype;
_.label = '';
_.text = '';
_.json = function(){
//    return this.label + ':    ' + this.text;
    return JSON.stringify(this.jsonobject());
}
_.jsonobject = function(){
    return [this.label, this.text];
}
_.shiftLabel = function(steps){
    if (steps === undefined){
        steps = 1;
    }
    this.label = SdDerivation.shiftLabel(this.label, steps);
}
_.html = function(editmode, loc, extraparams){
    var result = this.text;
    var minusbuttons = [];
    var plusbuttons = [];
//    var beforebuttons = '<a href="javascript:;" class="removeassumption sdremovebutton" title="remove assumption"><span>(-)</span></a>';
    minusbuttons.push('assumption');
//    var afterbuttons = '<a href="javascript:;" class="addassumption sdaddbutton" title="add assumption"><span>(+)</span></a>';
    plusbuttons.push('assumption');
    if (!(extraparams === undefined)){
        if (extraparams['last']){
            afterbuttons += '<a href="javascript:;" class="addobservation sdaddbutton" title="add observation"><span>[+]</span></a>';
            plusbuttons.push('observation');
        }
    }
    var beforebuttons = '<a href="javascript:;" class="sdremovebutton"><span>–</span></a>';
    var afterbuttons = '<a href="javascript:;" class="sdaddbutton"><span>+</span></a>';
    minusbuttons = '<span class="minusbuttons" menuitems="'+minusbuttons.join(' ')+'"></span>';
    plusbuttons = '<span class="plusbuttons" menuitems="'+plusbuttons.join(' ')+'"></span>';
    beforebuttons = '<div class="sdbeforebuttons">'+minusbuttons+beforebuttons+'</div>';
    afterbuttons = '<div class="sdafterbuttons">'+plusbuttons+afterbuttons+'</div>';
    if (editmode == 'show'){
        result = result.replace(/\$([^\$]+)\$/g, '<span class="mathquill-embedded-latex">$1</span>');
    } else if (editmode == 'edit'){
        result = '<span class="mathquill-textbox">'+result+'</span>';
    }
    var assclass = this.virgin ? ' virgin' : '';
    result = '<tr><td>'+beforebuttons+'(' + this.label + ')</td><td class="assumption'+assclass+'" loc="'+loc+'">' + result + afterbuttons + '</td></tr>\n';
    return result;
}
_.lyx = function(loc, extraparams){
    // LyX TÖÖKKÖ
    var result = this.text;
    result = '<span class="mathquill-textbox">'+result+'</span>';
    result = '<tr><td>(' + this.label + ')</td><td class="assumption" loc="'+loc+'">' + result + '</td></tr>\n';
    return result;
}
_.getSaveData = function(){
    return {"label": this.label, "text": this.text};
}

