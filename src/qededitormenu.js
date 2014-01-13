/*******************************************************
 * QedEditorMenu -class
 *******************************************************/
function QedEditorMenu(items){
    this.menuitems = [];
    var newitem;
    for (var i = 0; i < items.plus.length; i++){
        newitem = new QedEditorMenuItem('plus', items.plus[i]);
        this.menuitems.push(newitem);
    }
    for (var i = 0; i < items.minus.length; i++){
        newitem = new QedEditorMenuItem('minus', items.minus[i]);
        this.menuitems.push(newitem);
    }
    if (items.undo){
        newitem = new QedEditorMenuItem('undo', 'Undo');
        this.menuitems.push(newitem);
    }
    if (items.redo){
        newitem = new QedEditorMenuItem('redo', 'Redo');
        this.menuitems.push(newitem);
    }
}
_ = QedEditorMenu.prototype;
_.html = function(){
    /***************************
     * Return the menu as html.
     ***************************/
    var result = '';
    for (var i = 0; i<this.menuitems.length; i++){
        result += this.menuitems[i].html();
    }
    result = '<ul id="qededitormenu">\n' + result + '</ul>\n';
    return result;
}
_.menuInit = function(){
    jQuery('#qededitormenu').parents('td').eq(0).find('.mathquill-editable').blur().focusout();
    jQuery('#qededitormenu a').eq(0).focus();
    jQuery('#qededitormenu li').eq(0).addClass('selected');
    jQuery('#qededitormenu li').each(function(){
        var $tdelem = jQuery(this).parents('tr').eq(0).find('td').eq(1);
        if ($tdelem.attr('class').match(/relation/gi) == 'relation'){
            var splitelem = 'relation';
            var location = $tdelem.attr('loc');
        } else {
            var splitelem = $tdelem.attr('class').match(/(task|term|relation|motivation|assumption|observation|obsmotivation|derivmotivation|subderivation)/gi)[0].replace('obsmotivation','observation');
            var location = $tdelem.attr('loc');
        }
        var opmap = {'+': 'add', '–': 'remove', '↶': 'undo', '↷': 'redo'}
        var oper = opmap[jQuery(this).find('.menuoperation').html()];
        var elem = jQuery(this).find('.menuname').html();
        var edata = {'oper': oper, 'elem': elem, 'loc': location, 'splitelem': splitelem};
        jQuery(this).click(edata, QedEditor.oprHandler);
        jQuery(this).mouseenter(function(){
            jQuery(this).addClass('selected');
        });
        jQuery(this).mouseleave(function(){
            jQuery(this).removeClass('selected');
        });
        jQuery(this).keydown(function(e){
            if (e.keyCode == 13 || e.keyCode == 38 || e.keyCode == 40 || e.keyCode == 27 || e.keyCode == 9){
                e.stopPropagation();
                e.preventDefault();
            }
        });
        jQuery(this).keypress(function(e){
            if (e.keyCode == 13 || e.keyCode == 38 || e.keyCode == 40 || e.keyCode == 27 || e.keyCode == 9){
                e.stopPropagation();
                e.preventDefault();
            }
        });
        jQuery(this).keyup(function(event){
            var $lielems = jQuery(this).parent().find('li');
            var liindex = $lielems.index(jQuery(this));
            switch (event.keyCode){
                case 40:
                    $lielems.removeClass('selected');
                    $lielems.eq((liindex + 1) % $lielems.length)
                        .addClass('selected').find('a').focus();
                    event.stopPropagation();
                    event.preventDefault();
                    break;
                case 38:
                    $lielems.removeClass('selected');
                    $lielems.eq((liindex - 1) % $lielems.length)
                        .addClass('selected').find('a').focus();
                    event.stopPropagation();
                    event.preventDefault();
                    break;
                case 13:
                    event.stopPropagation();
                    event.preventDefault();
                    jQuery(this).click();
                    break;
                case 27:
                    jQuery('#qededitormenuwrapper').remove();
                    QedEditor.buttonpanel.lastfocus.focus();
                    event.stopPropagation();
                    event.preventDefault();
                    break;
                case 9:
                    event.preventDefault();
                    event.stopPropagation();
                default:
                    break;
            }
        });
    });
    jQuery('#qededitormenuwrapper.minus, #qededitormenuwrapper.plus').mouseleave(function(){
        jQuery('#qededitormenuwrapper').remove();
    });
}

/*******************************************************
 * QedEditorMenuItem -class
 *******************************************************/
function QedEditorMenuItem(operation, itemname, label){
    this.operation = operation;
    this.sdelement = itemname;
    if (typeof(label) == 'undefined'){
        this.label = '';
        this.label = itemname;
    } else {
        this.label = label;
    }
}
_ = QedEditorMenuItem.prototype;
_.html = function(){
    /***************************
     * Return the menuitem as html.
     ***************************/
    var liclasses = ['qededitormenuitem'];
    liclasses.push(this.sdelement);
    liclasses.push(this.operation);
    var symbol = '';
    switch (this.operation){
        case 'plus':
            symbol = '+';
            break;
        case 'minus':
            symbol = '–';
            break;
        case 'undo':
            symbol = '↶';
            break;
        case 'redo':
            symbol = '↷';
            break;
        default:
            symbol = this.operation;
            break;
    }
    var result = '';
    testilogit.sdelement = this.sdelement;
    result += '<li class="'+liclasses.join(' ')+'">\n<a href="javascript:;">' +
        '<span class="menuoperation">'+symbol+'</span>' +
        '<span class="menulabel">'+QedEditor.locales[this.label][QedEditor.options.lang]+'</span>' +
        '<span class="menuname">'+this.sdelement+'</span>' +
        '</a>\n</li>\n';
    return result;
}



