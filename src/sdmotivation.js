/********************************************
 * SdMotivation -class
 ********************************************/
function SdMotivation(motivationstr, subderivs, virgin, mottype, context, parent, derivations){
    /**********************************************************
     * motivationstr: string of motivation text
     * subderivs:     array of names of subderivations,
     * virgin:        boolean - true, if new empty motivation
     * mottype:       string - 'step'/'observation'/'derivation'
     * context:       string - context of derivation ('tiddlywiki', 'moodle', etc.)
     * derivations:   object - data for subderivations
     * ********************************************************/
    this.parent = parent;
    this.text = motivationstr;
    this.subderivation = [];
    this.mottype = mottype;
    if (typeof(virgin) == 'undefined'){
        virgin = false;
    }
    this.virgin = virgin;
    if (!(subderivs === undefined) && !!subderivs){
        for (var i=0; i<subderivs.length; i++){
            var subder = new SdSubDeriv(subderivs[i], context, this.parent.editor, derivations);
            this.subderivation.push(subder);
        }
    }
}
_ = SdMotivation.prototype;
_.text = '';
_.subderivation = [];
_.json = function(){
    return JSON.stringify(this.jsonobject());
}
_.jsonobject = function(){
    // TODO
    var result = [this.text];
    for (var subi = 0; subi < this.subderivation.length; subi++){
        result.push(this.subderivation[subi].jsonobject());
    }
//    alert(JSON.stringify(result));
    return result;
}
_.html = function(editmode, loc, extraparams){
    if (extraparams === undefined){
        extraparams = {};
    }
    var tdclasses = [];
    var beforebuttons = '';
    var afterbuttons = '';
    var minusbuttons = [];
    var plusbuttons = [];
    if (this.virgin){
        tdclasses.push('virgin');
    }
    var className = 'motivation';
    var tdBefore = '';
    if (this.mottype == 'observation'){
        className = 'obsmotivation';
    } else if (this.mottype == 'derivation') {
//        beforebuttons = '<a href="javascript:;" class="removedermot sdremovebutton"><span>{-}</span></a>';
        minusbuttons.push('derivationmotivation');
        beforebuttons = '<a href="javascript:;" class="sdremovebutton"><span>–</span></a>';
        minusbuttons = '<span class="minusbuttons" menuitems="'+minusbuttons.join(' ')+'"></span>';
        beforebuttons = '<div class="sdbeforebuttons">'+minusbuttons+beforebuttons+'</div>';
        tdBefore = '<tr><td>'+beforebuttons+'<span class="mathquill-embedded-latex">\\Vdash </span></td>';
        className = 'derivmotivation';
    }
    if (this.mottype == 'step' || this.mottype == 'observation'){
//        afterbuttons = '<a href="javascript:;" class="addsubder sdaddbutton"><span>&bull;+</span></a>';
        plusbuttons.push('subderivation');
        afterbuttons = '<a href="javascript:;" class="sdaddbutton"><span>+</span></a>';
        plusbuttons = '<span class="plusbuttons" menuitems="'+plusbuttons.join(' ')+'"></span>';
        afterbuttons = '<div class="sdafterbuttons">'+plusbuttons+afterbuttons+'</div>';
    }
    tdclasses.push(className);
    var result = this.text;
    var hiddenclass = '';
    var hiddensd = false;
    if (editmode == 'show'){
        result = result.replace(/\$([^\$]+)\$/g, '<span class="mathquill-embedded-latex">$1</span>');
    } else if (editmode == 'edit'){
        result = '<span class="mathquill-textbox">'+result+'</span>';
    }
    result = tdBefore + '<td class="'+tdclasses.join(' ')+'" loc="'+loc+'"><span class="motivationstring">' + result + '</span>'+afterbuttons+'</td>';

    /**** Check if subderivations are hidden *****************/
    for (var i = 0; i<this.subderivation.length; i++){
        hiddensd = hiddensd || this.subderivation[i].hidden;
    }
    if (hiddensd){
        hiddenclass = 'sdhidden';
    }

    /**** Add subderivations *********************************/
/*    var subbeforebuttons = '<a href="javascript:;" class="removesubder sdremovebutton" title="remove subderivation"><span>&bull;-</span></a>';
    var subafterbuttons = '<a href="javascript:;" class="addsubder sdaddbutton" title="add subderivation"><span>&bull;+</span></a>';
    subbeforebuttons = '<div class="sdbeforebuttons">'+subbeforebuttons+'</div>';
    subafterbuttons = '<div class="sdafterbuttons">'+subafterbuttons+'</div>';*/
    for (var i=0; i<this.subderivation.length; i++){
//        result += '</tr>\n<tr class="'+hiddenclass+'"><td class="subder" loc="'+loc+'_subderivation_'+i+'">'+subbeforebuttons+'</td><td class="subderivation">'
        result += '</tr>\n<tr class="'+hiddenclass+'"><td class="subder"></td><td class="subderivation" loc="'+loc+'_subderivation_'+i+'">'
        result += this.subderivation[i].htmlSub(editmode, loc+'_subderivation_'+i);
//        result += '\n'+subafterbuttons+'</td>\n';
        result += '\n</td>\n';
    }
    result += '</tr>\n';
    return result;
}
_.lyx = function(loc, extraparams){
    // LyX TÖÖKKÖ
    if (extraparams === undefined){
        extraparams = {};
    }
    var tdBefore = '';
    if (this.mottype == 'observation'){
        className = 'obsmotivation';
    } else if (this.mottype == 'derivation') {
        tdBefore = '<tr><td>⊩</td>';
        className = 'derivmotivation';
    }
    tdclasses.push(className);
    var result = this.text;
    result = '<span class="mathquill-textbox">'+result+'</span>';
    result = tdBefore + '<td class="'+tdclasses.join(' ')+'" loc="'+loc+'"><span class="motivationstring">' + result + '</span></td>';


    /**** Add subderivations *********************************/
    for (var i=0; i<this.subderivation.length; i++){
        result += '</tr>\n<tr class=""><td class="subder"></td><td class="subderivation" loc="'+loc+'_subderivation_'+i+'">'
        result += this.subderivation[i].lyxSub(loc+'_subderivation_'+i);
        result += '\n</td>\n';
    }
    result += '</tr>\n';
    return result;
}
_.getSaveData = function(){
    var subdnames = [];
    for (var i = 0; i<this.subderivation.length; i++){
        subdnames.push(this.subderivation[i].name);
    }
    return {'text': this.text, 'subderiv': subdnames, 'virgin': this.virgin};
}

_.getSubSaveData = function(){
    var subderivs = [];
    for (var i = 0; i<this.subderivation.length; i++){
        var datas = this.subderivation[i].getSaveData();
        for (var j = 0; j<datas.length; j++){
            subderivs.push(datas[j]);
        }
    }
    return subderivs;
}

_.addSubderivation = function(name, pos, context, editor){
    /******************************************************************
     * Add (an empty) subderivation in motivation
     ******************************************************************/
    if (typeof(name) != 'string' || name == ''){
        return;
    }
    if (context === undefined){
        context = '';
    }
    var emptysubder = new SdSubDeriv(name, context, editor);
    this.subderivation.splice(pos,0,emptysubder);
}

_.addSubderivationObject = function(subder, pos){
    /******************************************************************
     * Add (existing) subderivation in motivation
     ******************************************************************/
    this.subderivation.splice(pos, 0, subder);
}

_.removeSubderivation = function(pos, rootderiv){
    /******************************************************************
     * Remove a subderivation from motivation recursively.
     * pos:       number - index of subderivation in motivation
     * rootderiv: string - name of the main derivation TODO: remove rooderiv argument
     ******************************************************************/
    var subder = this.subderivation[pos];
    var removed = [subder.name];
    for (var i = 0; i < subder.observation.length; i++){
        for (var j = 0; j < subder.observation[i].motivation.subderivation.length; j++){
            var remsd = subder.observation[i].motivation.removeSubderivation(j, rootderiv);
            removed = removed.concat(remsd);
        }
    }
    for (var i = 0; i < subder.motivation.length; i++){
        for (var j = 0; j < subder.motivation[i].subderivation.length; j++){
            var remsd = subder.motivation[i].removeSubderivation(j, rootderiv);
            removed = removed.concat(remsd);
        }
    }
    this.subderivation.splice(pos,1);
    return removed;
}

_.hideSubders = function(){
    for (var i = 0; i<this.subderivation.length; i++){
        this.subderivation[i].hidden = true;
    }
}

_.unhideSubders = function(){
    for (var i = 0; i<this.subderivation.length; i++){
        this.subderivation[i].hidden = false;
    }
}

_.switchHideSubders = function(){
    var hiddensd = false;
    for (var i = 0; i<this.subderivation.length; i++){
        hiddensd = hiddensd || this.subderivation[i].hidden;
    }
    if (hiddensd){
        this.unhideSubders();
    } else {
        this.hideSubders();
    }
}

