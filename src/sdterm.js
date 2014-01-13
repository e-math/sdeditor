/********************************************
 * SdTerm-class
 ********************************************/
function SdTerm(term, virgin){
    this.text = term;
    if (typeof(virgin) == 'undefined'){
        virgin = false;
    }
    this.virgin = virgin;
}
_ = SdTerm.prototype;
_.text = '';
_.json = function(){
    return JSON.stringify(this.jsonobject());
}
_.jsonobject = function(){
    return '$'+this.text+'$';
}
_.html = function(editmode, loc, extraparams){
    if (extraparams === undefined){
        extraparams = {'termtype': ''};
    }
    var tdclasses = [];
    if (this.virgin){
        tdclasses.push('virgin');
    }
    tdclasses.push('term');
    var termmark = '';
    var beforebuttons = '';
    var afterbuttons = '';
    var middlebuttons = '';
    var minusbuttons = [];
    var plusbuttons = [];
    if (extraparams.termtype == 'bullet'){
        termmark = '$\\bullet$';
//        afterbuttons += '<a href="javascript:;" class="addtask sdaddbutton" title="add task"><span>&bull;+</span></a>';
        plusbuttons.push('task');
        plusbuttons.push('taskass');
        plusbuttons.push('taskobs');
        if (extraparams.first){
            minusbuttons.push('subderivation');
        }
    } else if (extraparams.termtype == 'vdash'){
        termmark = '$\\Vdash$';
//        afterbuttons += '<a href="javascript:;" class="adddermot sdaddbutton" title="add derivation motivation"><span>{+}</span></a>';
        plusbuttons.push('derivationmotivation');
    } else if (extraparams.termtype == 'ldots'){
        termmark = '$\\ldots$';
    };
    if (editmode == 'show' || editmode == 'edit'){
        termmark = termmark.replace(/\$([^\$]+)\$/g, '<span class="mathquill-embedded-latex">$1</span>');
    }
    var result = '$ '+this.text+'$';
    if (editmode == 'show'){
        result = result.replace(/\$([^\$]*)\$/g, '<span class="mathquill-embedded-latex">$1</span>');
    } else if (editmode == 'edit'){
        result = result.replace(/\$([^\$]*)\$/g, '<span class="mathquill-editable">$1</span>');
//        middlebuttons += '<a href="javascript:;" class="addstep"><span class="sdaddbutton">+</span></a>';
        plusbuttons.push('step');
    }
    if (extraparams.last){
        plusbuttons.push('subderivation');
    }
    if (minusbuttons.length > 0){
        beforebuttons = '<a href="javascript:;" class="sdremovebutton"><span>–</span></a>';
    }
    if (plusbuttons.length > 0){
        afterbuttons = '<a href="javascript:;" class="sdaddbutton"><span>+</span></a>';
    }
    minusbuttons = '<span class="minusbuttons" menuitems="'+minusbuttons.join(' ')+'"></span>';
    plusbuttons = '<span class="plusbuttons" menuitems="'+plusbuttons.join(' ')+'"></span>';
    beforebuttons = '<div class="sdbeforebuttons">'+minusbuttons+beforebuttons+'</div>';
    afterbuttons = '<div class="sdafterbuttons">'+plusbuttons+afterbuttons+'</div>';
    result = '<tr><td class="'+extraparams.termtype+'">'+beforebuttons+termmark+'</td><td class="'+tdclasses.join(' ')+'" loc="'+loc+'">' + result + middlebuttons + afterbuttons + '</td></tr>\n';
    return result;

}
_.lyx = function(loc, extraparams){
    // LyX TÖÖKKÖ
    if (extraparams === undefined){
        extraparams = {'termtype': ''};
    }
    var termmark = '';
    if (extraparams.termtype == 'bullet'){
        termmark = '$\\bullet$';
    } else if (extraparams.termtype == 'vdash'){
        termmark = '$\\Vdash$';
    } else if (extraparams.termtype == 'ldots'){
        termmark = '$\\ldots$';
    };
    var result = '$ '+this.text+'$';
    result = '<tr><td class="'+extraparams.termtype+'">'+termmark+'</td><td class="'+tdclasses.join(' ')+'" loc="'+loc+'">' + result  + '</td></tr>\n';
    return result;

}
_.getSaveData = function(){
    return {"text": this.text, "virgin": this.virgin};
}

