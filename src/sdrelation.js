/********************************************
 * SdRelation -class
 ********************************************/
function SdRelation(rel, virgin){
    this.text = rel;
    if (typeof(virgin) == 'undefined'){
        virgin = false;
    }
    this.virgin = virgin;
}
_ = SdRelation.prototype;
_.text = '';
_.json = function(){
    return JSON.stringify(this.jsonobject());
}
_.jsonobject = function(){
    return '$'+this.text+'$';
}
_.html = function(editmode, loc, extraparams){
    if (extraparams === undefined){
        extraparams = {};
    }
    var tdclasses = [];
    var beforebuttons = '';
    var afterbuttons = '';
    var minusbuttons = [];
    if (this.text != ''){
        this.virgin = false;
    }
    if (this.virgin){
        tdclasses.push('virgin');
    }
    tdclasses.push('relation');
    var result = '$ '+this.text+'$';
    if (editmode == 'show'){
        result = result.replace(/\$([^\$]+)\$/g, '<span class="mathquill-embedded-latex">$1</span>');
    } else if (editmode == 'edit'){
        result = result.replace(/\$([^\$]+)\$/g, '<span class="mathquill-editable">$1</span>');
//        beforebuttons += '<a href="javascript:;" class="removestep sdremovebutton"><span>-</span></a>';
        minusbuttons.push('step');
    }
    if (minusbuttons.length > 0){
        beforebuttons += '<a href="javascript:;" class="sdremovebutton"><span>–</span></a>';
    }
    minusbuttons = '<span class="minusbuttons" menuitems="'+minusbuttons.join(' ')+'"></span>';
    beforebuttons = '<div class="sdbeforebuttons">'+minusbuttons+beforebuttons+'</div>';
    result = '<tr><td class="'+tdclasses.join(' ')+'" loc="'+loc+'">' + beforebuttons + result + '</td>\n';
    return result;
}
_.lyx = function(loc, extraparams){
    // LyX TÖÖKKÖ
    if (extraparams === undefined){
        extraparams = {};
    }
    var result = '$ '+this.text+'$';
    result = '<tr><td class="" loc="'+loc+'">' + result + '</td>\n';
    return result;
}
_.getSaveData = function(){
    return {"text": this.text, "virgin": this.virgin};
}

