/********************************************
 * SdTask -class
 ********************************************/
function SdTask(task){
    this.text = task;
}
_ = SdTask.prototype;
_.text = '';
_.json = function(){
    return JSON.stringify(this.jsonobject());
}
_.jsonobject = function(){
    return this.text;
}
_.html = function(editmode, loc, extraparams){
    var bullet = '$\\bullet$';
    var beforebuttons = '';
    var afterbuttons = '';
    var minusbuttons = [];
    var plusbuttons = [];
    if (!(extraparams === undefined)){
        if (!(extraparams['ass'] || extraparams['obs'] || extraparams['dermot'])){
//            beforebuttons = '<a href="javascript:;" class="removetask sdremovebutton" title="remove task"><span>-</span></a>';
            minusbuttons.push('task');
        }
        if (extraparams['ass']){
//            afterbuttons = '<a href="javascript:;" class="addassumption sdaddbutton" title="add assumption"><span>(+)</span></a>';
            plusbuttons.push('assumption');
        } else {
//            afterbuttons = '<a href="javascript:;" class="addassumption sdaddbutton" title="add assumption"><span>(+)</span></a><a href="javascript:;" class="addobservation sdaddbutton" title="add observation"><span>[+]</span></a>';
            plusbuttons.push('assumption');
            plusbuttons.push('observation');
        }
        if (extraparams['issub']){
            minusbuttons.push('subderivation');
        }
        if (minusbuttons.length > 0){
            beforebuttons = '<a href="javascript:;" class="sdremovebutton"><span>–</span></a>';
        }
        if (plusbuttons.length > 0){
            afterbuttons = '<a href="javascript:;" class="sdaddbutton""><span>+</span></a>';
        }
    }
    minusbuttons = '<span class="minusbuttons" menuitems="'+minusbuttons.join(' ')+'"></span>';
    plusbuttons = '<span class="plusbuttons" menuitems="'+plusbuttons.join(' ')+'"></span>';
    beforebuttons = '<div class="sdbeforebuttons">'+minusbuttons+beforebuttons+'</div>';
    afterbuttons = '<div class="sdafterbuttons">'+plusbuttons+afterbuttons+'</div>';
    var tdclasses = ['task'];
    if (editmode == 'show' || editmode == 'edit'){
        bullet = bullet.replace(/\$([^\$]+)\$/g, '<span class="mathquill-embedded-latex">$1</span>');
        addbuttons = '';
    }
    var result = this.text;
    if (editmode == 'show'){
        result = result.replace(/\$([^\$]+)\$/g, '<span class="mathquill-embedded-latex">$1</span>');
    } else if (editmode == 'edit'){
        result = '<span class="mathquill-textbox">'+result+'</span>';
    }
    result = '<tr><td class="bullet">'+beforebuttons+bullet+'</td><td class="'+tdclasses.join(' ')+'" loc="'+loc+'">'+result+afterbuttons+'</td></tr>\n';
    return result;
}
_.lyx = function(loc, extraparams){
    // LyX TÖÖKKÖ
    var bullet = '$\\bullet$';
    var result = this.text;
    result = '<tr><td class="bullet">'+bullet+'</td><td class= loc="'+loc+'">'+result+'</td></tr>\n';
    return result;
}
_.getSaveData = function(){
    return this.text;
}
