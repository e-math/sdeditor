/****************************************************
 * Sdeditor 0.3
 * Petri Salmela
 * Petri Sallasmaa
 * Ralph-Johan Back
 * 28.6.2011
 *
 * License: GNU Lesser General Public License (LGPL)
 ****************************************************/

var _; // temp variable for prototypes

/********************************************
 * QedEditor -class
 ********************************************/
function QedEditor(derivname, element, context, extraparams){
    /*********************************************
     * derivname: string - name of derivation
     * element:   html-element (or jQuery object) - container for editor
     * context:   string - context of editor ('tiddlywiki',...)
     * extraparams: other parameters as object.
     *********************************************/
    this.extraparams = {};
    if (typeof(extraparams) != 'undefined'){
        this.extraparams = extraparams;
    }
    this.name = derivname;
    this.context = context;
    this.element = jQuery('<div class="qededitor qedcontext'+this.context+'"></div>');
    jQuery(element).append(this.element);
    this.element[0].editor = this;
    this.plugins = [];
    this.derivation = new SdDerivation(this.context, this);
    this.open(this.name);
//     this.derivation.open(this.name, extraparams);
    this.undoStack = new Eventstack(0);
    this.redoStack = new Eventstack(0);
//     this.cleanRecycleBin();
    this.nextFocus = '';
    this.installPlugins();
    this.init();
}
QedEditor.inited = false;
QedEditor.options = {
    'lang': 'en'
};
QedEditor.locales = {
   'task': {
       'en': 'task',
       'fi': 'tehtävä',
       'sv': 'uppgift',
       'et': 'ülesanne'
   },
   'taskass': {
       'en': 'assumption',
       'fi': 'oletus',
       'sv': 'antagande',
       'et': 'eeldus'
   },
   'assumption': {
       'en': 'assumption',
       'fi': 'oletus',
       'sv': 'antagande',
       'et': 'eeldus'
   },
   'taskobs': {
       'en': 'observation',
       'fi': 'havainto',
       'sv': 'observation',
       'et': 'tähelepanek'
   },
   'observation': {
       'en': 'observation',
       'fi': 'havainto',
       'sv': 'observation',
       'et': 'tähelepanek'
   },
   'term': {
       'en': 'term',
       'fi': 'termi',
       'sv': 'term',
       'et': 'avaldis'
   },
   'relation': {
       'en': 'relation',
       'fi': 'relaatio',
       'sv': 'relation',
       'et': 'seos'
   },
   'motivation': {
       'en': 'motivation',
       'fi': 'perustelu',
       'sv': 'motivering',
       'et': 'selgitus'
   },
   'step': {
       'en': 'step',
       'fi': 'askel',
       'sv': 'steg',
       'et': 'samm'
   },
   'subderivation': {
       'en': 'subderivation',
       'fi': 'alipäättely',
       'sv': 'delhärledning',
       'et': 'alalahendus'
   },
   'derivation': {
       'en': 'derivation',
       'fi': 'päättelyketju',
       'sv': 'härledning',
       'et': 'lahendus'
   },
   'derivationmotivation': {
       'en': 'derivationmotivation',
       'fi': 'päättelyketjun perustelu',
       'sv': 'motivering av härledningen',
       'et': 'lahenduse selgitus'
   },
   'Undo': {
       'en': 'undo',
       'fi': 'kumoa',
       'sv': 'ångra',
       'et': 'tühista käsk'
   },
   'Redo': {
       'en': 'redo',
       'fi': 'tee uudelleen',
       'sv': 'återställ',
       'et': 'taasta käsk'
   },
   'relations': {
       'en': 'relations',
       'fi': 'relaatiot',
       'sv': 'relationer',
       'et': 'seosed'
   },
   'misc': {
       'en': 'misc',
       'fi': 'sekalaista',
       'sv': 'övrigt',
       'et': 'mitmesugust'
   },
   'greeks': {
       'en': 'greeks',
       'fi': 'kreikkalaiset',
       'sv': 'grekiska',
       'et': 'kreeka'
   }
}
QedEditor.options.TiddlyWiki = {
    "saveTiddler": "QedDerivationsData",
    "recycleTiddler": "QedDerivationsRecycleBin"
}
_ = QedEditor.prototype;
_.init = function(){
    if (typeof(QedEditor.inited) == 'undefined' || !QedEditor.inited){
        jQuery(document).keyup(function(e){
            if (e.keyCode == '13' && (e.ctrlKey || e.altKey)){
                if( e.shiftKey){
                    var editors = jQuery('.qededitor.qedediting');
                    if (typeof(QedEditor.buttonpanel.lastfocus) != 'undefined'){
                        var last_focus_editor = (QedEditor.buttonpanel.lastfocus).parents('.qededitor');
                        var editorindex = editors.index(last_focus_editor);
                        var focuselem = editors.eq((editorindex + 1) % editors.length).find('.mathquill-editable').last();
                        focuselem.focus();
                    } else {
                        var focuselem = jQuery('.qededitor .mathquill-editable').eq(0)
                        focuselem.focus();
                    }
                    
                } else {
                    if (typeof(QedEditor.buttonpanel.lastfocus) != 'undefined'){
                        var focuselem = jQuery(QedEditor.buttonpanel.lastfocus)
                        focuselem.focus();
                    } else {
                        var focuselem = jQuery('.qededitor .mathquill-editable')
                        focuselem.focus();
                    }
                }
                testilogit.focuselem = focuselem;
                focuselem.parents('.qededitor')[0].editor.scrollInView(focuselem);
            }
        });
//         jQuery('body').click(function(){
//             jQuery('#qededitormenuwrapper').remove();
//         });
        QedEditor.inited = true;
    }
    if (this.context == 'moodlesa' && (jQuery(this.element).parent().hasClass('qedsaveajax') ||jQuery(this.element).parent().hasClass('qedajaxsave'))){
        this.derivation.saveajax = true;
    } else {
        this.derivation.saveajax = false;
    }
}
_.show = function(){
    /*********************************************
     * Show editor in read-only mode
     *********************************************/
    var htmlText = this.derivation.html('show');
    jQuery(this.element).empty().append(htmlText);
    this.element.find('.mathquill-editable').mathquill('editable');
    this.element.find('.mathquill-textbox').mathquill('textbox');
    this.element.find('.mathquill-embedded-latex').mathquill();
    this.element.find('a.command_qededit').click(function(){
        jQuery(this).parents('.qededitor')[0].editor.edit();
        return false;
    });

    /**** Hide/show subderivations ****************************************/
    this.element.find('td.ldots').click(function(){
        var termloc = jQuery(this).next().attr('loc');
        var locparts = termloc.split('_');
        var elemtype = locparts[locparts.length-2];
        if (elemtype == 'observation'){
            locparts.push('motivation');
        } else if (elemtype == 'term'){
            locparts[locparts.length-2] = 'motivation';
            locparts[locparts.length-1] = parseInt(locparts[locparts.length-1])-1;
        }
        var loc = locparts.join('_');
        var editor = jQuery(this).parents('.qededitor')[0].editor;
        var derivation = editor.derivation;
        var mot = derivation.findLocation(loc);
        mot.switchHideSubders();
        editor.save();
//         derivation.save(editor.extraparams);

        var subloc = loc + '_subderivation_';
        var $subdertd = jQuery(this).parent().siblings()
            .children('td[loc*="'+subloc+'"]');
        var $subdertr = $subdertd.parent();
        for (var i = 0; i < $subdertr.length; i++){
            if ($subdertr.eq(i).hasClass('sdhidden')){
                $subdertd.eq(i).children('div.sdsubderivation').hide();
                $subdertr.eq(i).removeClass('sdhidden');
                $subdertd.eq(i).children('div.sdsubderivation').slideDown('slow');
                $subdertd.eq(i).find('.mathquill-rendered-math').mathquill('redraw');
            } else {
                $subdertd.eq(i).children('div.sdsubderivation').slideUp('slow',function(){
                    jQuery(this).parents('tr').eq(0).addClass('sdhidden');
                    jQuery(this).children('div.subderivation').show();
                });
            }
        }
//        jQuery(this).parents('.qededitor')[0].editor.show();
    });

}
_.edit = function(){
    /*********************************************
     * Show editor in read-write mode
     *********************************************/
    if (jQuery('#mathbuttonpanel').length == 0){
        jQuery('#mathbuttonwrapper').append(QedEditor.buttonpanel.html(''));
        QedEditor.buttonpanel.initClicks();
    }
    var buttonclass = '';
    var htmlText = '<div class="structuredderivation" sdname="'+this.name+'">\n';
    htmlText += '<div class="qededitorbuttons">\n';
    htmlText += '<a href="javascript:;" class="button command_qedclose command_editorclose" title="Close"></a>\n';
    buttonclass = this.undoStack.isempty() ? '':' active';
    htmlText += '<a href="javascript:;" class="button command_qedundo command_editorundo' + buttonclass+'" title="Undo"><span>&#x21b6;</span></a>\n';
    buttonclass = this.redoStack.isempty() ? '':' active';
    htmlText += '<a href="javascript:;" class="button command_qedredo command_editorredo' + buttonclass+'" title="Redo"><span>&#x21b7;</span></a>\n';
    htmlText += this.pluginButtons();
    htmlText += '</div>\n';
    htmlText += this.derivation.html('edit', this.name);
    htmlText += '\n</div>';
    var $element = jQuery(this.element);
    $element.empty().append(htmlText);
    $element.find('div.structuredderivation').addClass('sdediting');
    $element.addClass('qedediting');
    this.element.find('.mathquill-editable').mathquill('editable');
    this.element.find('.mathquill-textbox').mathquill('textbox');
    this.element.find('.mathquill-embedded-latex').mathquill();
    
    /**** Init events ****************************************************/

    /**** Hide/show subderivations ****************************************/
    this.element.find('td.ldots').click(function(){
        var termloc = jQuery(this).next().attr('loc');
        var locparts = termloc.split('_');
        var elemtype = locparts[locparts.length-2];
        if (elemtype == 'observation'){
            locparts.push('motivation');
        } else if (elemtype == 'term'){
            locparts[locparts.length-2] = 'motivation';
            locparts[locparts.length-1] = parseInt(locparts[locparts.length-1])-1;
        }
        var loc = locparts.join('_');
        var editor = jQuery(this).parents('.qededitor')[0].editor;
        var derivation = editor.derivation;
        var mot = derivation.findLocation(loc);
        mot.switchHideSubders();
        editor.save();
//         derivation.save(editor.extraparams);
//töökkö
        
        var subloc = loc + '_subderivation_';
        var $subdertd = jQuery(this).parent().siblings()
            .children('td[loc*="'+subloc+'"]');
        var $subdertr = $subdertd.parent();
        for (var i = 0; i < $subdertr.length; i++){
            if ($subdertr.eq(i).hasClass('sdhidden')){
                $subdertd.eq(i).children('div.sdsubderivation').hide();
                $subdertr.eq(i).removeClass('sdhidden');
                $subdertd.eq(i).children('div.sdsubderivation').slideDown('slow');
                $subdertd.eq(i).find('.mathquill-rendered-math').mathquill('redraw');
            } else {
                $subdertd.eq(i).children('div.sdsubderivation').slideUp('slow',function(){
                    jQuery(this).parents('tr').eq(0).addClass('sdhidden');
                    jQuery(this).children('div.subderivation').show();
                });
            }
        }
    });

    /**** Click of "editor close" ****************************************/
    $element.find('a.command_qedclose').click(function(){
        var $parent = jQuery(this).parents('div.structuredderivation');
        $parent.removeClass('sdediting');
        $parent.parents('.qededitor').eq(0).removeClass('qedediting');
        $editor = $parent.parents('div.qededitor');
        $editor[0].editor.save();
//         $editor[0].editor.derivation.save($editor[0].editor.extraparams);
        $editor[0].editor.show();
        if (jQuery('.sdediting').length == 0){
            jQuery('#mathbuttonpanel').remove();
        }
        return false;
    });

    /**** Click of "editor undo" ****************************************/
    $element.find('a.command_qedundo').click(function(){
        jQuery(this).parents('div.qededitor')[0].editor.undo();
        return false;
    });

    /**** Click of "editor redo" ****************************************/
    $element.find('a.command_qedredo.active').click(function(){
        jQuery(this).parents('div.qededitor')[0].editor.redo();
        return false;
    });
    $element.find('a.command_qedredo').not('.active').click(function(){
        return false;
    });

    /**** Focusout of mathquill-editable -boxes ***************************/
    $element.find('.mathquill-editable').focusout(function(e){
        $mqbox = jQuery(this);
        var $editor = $mqbox.parents('div.qededitor');
        var location = $mqbox.parents('td').attr('loc');
        var edittype = $mqbox.parents('td').attr('class');
        var derivation = $editor[0].editor.derivation;
        var changedPos = derivation.findLocation(location);
        
        QedEditor.buttonpanel.lastfocus = $mqbox;
        $mqbox.parents('tr:eq(0)').removeClass('sdeditfocuson');
        var newtext = $mqbox.mathquill('latex').replace(/</g,'\\lt ').replace(/>/g,'\\gt ');
        var oldtext = derivation.findLocation(location).text;
        if (oldtext != newtext){
            if (typeof(changedPos.virgin) != 'undefined' && changedPos.virgin){
                $mqbox.parents('td.virgin').removeClass('virgin');
            }
            $mqbox.parents('.qededitor').eq(0).find('a.command_qedundo').addClass('active');
            $mqbox.parents('.qededitor').eq(0).find('a.command_qedredo').removeClass('active');
            var data = [newtext, oldtext];
            var editevent = new EditorEvent('edit', edittype, location, '', data);
            $editor[0].editor.doEvent(editevent);
        }
    }).click(function(){
        jQuery(this).parents('tr:eq(0)').addClass('sdeditfocuson');
    }).focus(function(){
        jQuery(this).parents('tr:eq(0)').addClass('sdeditfocuson');
    });

    /**** Key events on mathquill-editable -boxes ***************************/
    $element.find('.mathquill-editable').keyup(function(e){
        var editor = jQuery(this).parents('.qededitor')[0].editor;
        if (e.keyCode == '13' && !(e.ctrlKey || e.altKey)){
            jQuery(e.currentTarget).focusout().blur();
        } else if (e.keyCode == '38' && (e.ctrlKey || e.altKey)){
            var $editables = jQuery(e.currentTarget).parents('.qededitor').eq(0).find('.mathquill-editable:visible');
            var position = $editables.index(jQuery(e.currentTarget));
            if (position > 0){
                jQuery(e.currentTarget).focusout().blur();
                $editables.eq(position-1).focus();
                editor.scrollInView($editables.eq(position-1));
            }
        } else if (e.keyCode == '40' && (e.ctrlKey || e.altKey)){
            var $editables = jQuery(e.currentTarget).parents('.qededitor').eq(0).find('.mathquill-editable:visible');
            var position = $editables.index(jQuery(e.currentTarget));
            if (position < $editables.length-1){
                jQuery(e.currentTarget).focusout().blur();
                $editables.eq(position+1).focus();
                editor.scrollInView($editables.eq(position+1));
            }
        } else if (e.keyCode == '13' && (e.ctrlKey || e.altKey)){
            var $tdelement = jQuery(this).parents('td').eq(0);
            var $trelement = $tdelement.parents('tr').eq(0);
            jQuery('#qededitormenuwrapper').remove();
            $trelement.find('td').eq(1).append('<div id="qededitormenuwrapper"></div>');
            var $menuwrapper = $trelement.find('#qededitormenuwrapper');
            var menuitems = {'minus': [],
                            'plus': [],
                            'undo': !editor.undoStack.isempty(),
                            'redo': !editor.redoStack.isempty()
            };
            var $minusitems =$trelement.find('.sdbeforebuttons .minusbuttons');
            if ($minusitems.attr('menuitems')){
                menuitems.minus = $minusitems.attr('menuitems').split(' ');
            }
            var $plusitems = $trelement.find('.sdafterbuttons .plusbuttons');
            if ($plusitems.attr('menuitems')){
                menuitems.plus = $plusitems.attr('menuitems').split(' ');
            }
            var editormenu = new QedEditorMenu(menuitems);
            $menuwrapper.append(editormenu.html());
            editormenu.menuInit();
            e.stopPropagation();
            e.preventDefault();
        } else {
/*            var kc = e.keyCode;
            var cc = e.charCode;
            alert(kc + ','+cc + ','+e.metaKey + ','+e.ctrlKey + ','+e.altKey);*/
//             Leave this for testing of new key commands.
        }
    });
    /**** Mouse enter events on minus buttons ***************************/
    $element.find('.sdbeforebuttons').click(function(e){
        var editor = jQuery(this).parents('.qededitor')[0].editor;
        var $tdelement = jQuery(this).parents('td').eq(0);
        jQuery('#qededitormenuwrapper').remove();
        jQuery(this).append('<div id="qededitormenuwrapper" class="minus"></div>');
        var $menuwrapper = $tdelement.find('#qededitormenuwrapper');
        var menuitems = {'minus': [],
                        'plus': [],
                        'undo': false,
                        'redo': false
/*                        'undo': !editor.undoStack.isempty(),
                        'redo': !editor.redoStack.isempty()*/
        };
        var $minusitems =$tdelement.find('.minusbuttons');
        if ($minusitems.attr('menuitems')){
            menuitems.minus = $minusitems.attr('menuitems').split(' ');
        }
        var editormenu = new QedEditorMenu(menuitems);
        $menuwrapper.append(editormenu.html());
        editormenu.menuInit();
    });
    /**** Mouse enter events on plus buttons ***************************/
    $element.find('.sdafterbuttons').click(function(e){
        var editor = jQuery(this).parents('.qededitor')[0].editor;
        var $tdelement = jQuery(this).parents('td').eq(0);
        jQuery('#qededitormenuwrapper').remove();
        jQuery(this).append('<div id="qededitormenuwrapper" class="plus"></div>');
        var $menuwrapper = $tdelement.find('#qededitormenuwrapper');
        var menuitems = {'minus': [],
                        'plus': [],
                        'undo': false,
                        'redo': false
/*                        'undo': !editor.undoStack.isempty(),
                        'redo': !editor.redoStack.isempty()*/
        };
        var $plusitems =$tdelement.find('.plusbuttons');
        if ($plusitems.attr('menuitems')){
            menuitems.plus = $plusitems.attr('menuitems').split(' ');
        }
        var editormenu = new QedEditorMenu(menuitems);
        $menuwrapper.append(editormenu.html());
        editormenu.menuInit();
    });
    
    this.initPlugins();
    this.setFocus();
}
_.doEvent = function(event){
    if (event.event != 'undo' && event.event != 'redo'){
        var result = this.derivation.eventDo(event);
        if (event.event == 'remove' && event.item == 'subderivation'){
            for (var i = 0; i < result.length; i++){
                this.deleteDeriv(result[i], true);
            }
        }
        this.redoStack.clear();
        this.undoStack.push(event.invert());
    } else if (event.event == 'undo'){
        this.undo();
    } else if (event.event == 'redo'){
        this.redo();
    }
//     this.derivation.save(this.extraparams);
    this.save();
    if (event.event != 'edit' && event.event != 'undo' && event.event != 'redo'){
        this.edit();
    }
}

_.undo = function(){
    var event = this.undoStack.pop();
    if (typeof(event) != 'undefined'){
        if (event.event == 'add' && event.item == 'subderivation'){
//            var subder = new SdDerivation(this.context);
//             subder.open(event.newData(), this.extraparams);
//            var subderdata = this.getDerivs(event.newData());
            var subdernames = this.getDerNames(event.newData());
//            var subder = new SdSubDeriv(event.newData, this.context, this.editor, subderdata);
//            subder.init(event.newData, subderdata);
            for (var i = 0; i < subdernames.length; i++){
                this.recycleCancel(subdernames[i]);
            }
//            subder.recycleCancel(this.derivation.name, this.extraparams);
            var derivations = this.getDerivs(this.derivation.name);
            var subder = new SdSubDeriv(event.newData(), this.context, this.editor, derivations);
            var subaddevent = new EditorEvent(event.event, event.item, event.location, event.position, [subder, '']);
            this.derivation.eventDo(subaddevent);
        } else {
            this.derivation.eventDo(event);
        }
        this.redoStack.push(event.invert());
//        this.derivation.save(this.extraparams);
        this.save();
        this.edit();
    }
}

_.redo = function(){
    var event = this.redoStack.pop();
    if (typeof(event) != 'undefined'){
        this.derivation.eventDo(event);
        this.undoStack.push(event.invert());
//         this.derivation.save(this.extraparams);
        this.save();
        this.edit();
    }
}
_.setFocus = function(location){
    if (typeof(location) == 'undefined'){
        location = this.nextFocus;
    }
    if (location == ''){
        location = jQuery(this.element).find('.mathquill-editable').eq(0).parents('td').attr('loc');
    }
    var $elem = jQuery(this.element).find('td[loc='+location+'] .mathquill-editable');
    if ($elem.length > 0){
        $elem.focus();
    } else {
        var $terms = jQuery(this.element).find('td.term');
        location = $terms.eq($terms.length-1).attr('loc');
        this.setFocus(location);
    }
}
_.scrollInView = function(elem){
    // TODO: works for Moodle, but how about Tiddlywiki. Check which element should be scrolled!
    switch (this.context){
        case 'moodlesa':
            var scrollparent = jQuery(window);
            var scrollbase = jQuery('html');
            var offset = 0;
            var parenttop = scrollbase.scrollTop();
            break;
        case 'tiddlywiki':
            var scrollparent = jQuery('#displayArea');
            var scrollbase = scrollparent;
            var offset = scrollbase.scrollTop() - scrollbase.offset().top;
            var parenttop = scrollbase.offset().top
            break;
        default:
            var scrollparent = jQuery(window);
            var scrollbase = jQuery('html');
    }
    if (jQuery(elem).offset().top - parenttop > scrollparent.height() - 120) {
        scrollbase.stop();
        scrollbase.animate({scrollTop: jQuery(elem).offset().top + offset + 150 - scrollparent.height()}, 300);
    }
    if (jQuery(elem).offset().top - parenttop < 120) {
        scrollbase.stop();
        scrollbase.animate({scrollTop: jQuery(elem).offset().top + offset - 150}, 300);
    }
}

_.derivationExists = function(name){
    /*********************************************
     * Check if derivation with given name exists. Returns boolean.
     * Depends on the context, how saved derivations are checked.
     * name: string - name of derivation
     *********************************************/
    if (typeof(extraparams) == 'undefined'){
        var extraparams = {};
    }
    switch(this.context){
        case 'tiddlywiki':
            var result;
            var savetiddler = QedEditor.options.TiddlyWiki.saveTiddler;
            if (typeof(this.extraparams.tiddler) != 'undefined'){
                savetiddler = this.extraparams.tiddler;
            }
            result = (typeof(DataTiddler.getData(savetiddler, 'derivations',{})[name]) != 'undefined');
// töökkö (savehere)
//             if (savetiddler != QedEditor.options.TiddlyWiki.saveTiddler){
//                 result = (typeof(DataTiddler.getData(savetiddler, 'derivations',{})[name]) != 'undefined');
//             } else {
//                 result = (typeof(DataTiddler.getData(savetiddler, name)) != 'undefined');
//             }
            return result;
            break;
        case 'moodlesa':
            var questionId = this.name;
            var $savearea = jQuery('#'+questionId+' .ablock input[type="text"]');
            var savestring = $savearea.val();
            var savedata = '{}';
            try {
                savedata = JSON.parse(savestring);
            } catch(err) {
                savedata = {"derivations": {}, "recycled": {}};
            }
            if (typeof(savedata.derivations) == 'undefined'){
                savedata.derivations = {};
            }
            return (typeof(savedata.derivations[name]) != 'undefined');
            break;
        case 'moodledesc':
            var questionId = this.name;
            var $savearea = jQuery('#'+questionId+' .qtext .data');
            var savestring = $savearea.html();
            var savedata = '{}';
            try {
                savedata = JSON.parse(savestring);
            } catch(err) {
                savedata = {"derivations": {}, "recycled": {}};
            }
            if (typeof(savedata.derivations) == 'undefined'){
                savedata.derivations = {};
            }
            return (typeof(savedata.derivations[name]) != 'undefined');
        default:
            return false;
    }
}

_.getDerivsWithPrefix = function(namepref){
    /*********************************************
     * Get a list of derivations with given prefix in its name.
     * Depends on the context, how saved derivations are checked.
     * namepref: string - prefix of name of derivation
     *********************************************/
    if (typeof(extraparams) == 'undefined'){
        var extraparams = {};
    }
    switch(this.context){
        case 'tiddlywiki':
            var result = [];
            var savetiddler = QedEditor.options.TiddlyWiki.saveTiddler;
            if (typeof(this.extraparams.tiddler) != 'undefined'){
                savetiddler = this.extraparams.tiddler;
            }
            var length = namepref.length;
            var derivations = DataTiddler.getData(savetiddler, 'derivations',{});
            for (name in derivations){
                if (name.substr(0, length) == namepref){
                    result.push(name);
                }
            }
            return result;
            break;
        case 'moodlesa':
            var questionId = this.name;
            var $savearea = jQuery('#'+questionId+' .ablock input[type="text"]');
            var savestring = $savearea.val();
            var savedata = '{}';
            try {
                savedata = JSON.parse(savestring);
            } catch(err) {
                savedata = {"derivations": {}, "recycled": {}};
            }
            if (typeof(savedata.derivations) == 'undefined'){
                savedata.derivations = {};
            }
            result = [];
            var length = namepref.length;
            var derivations = savedata.derivations;
            for (name in derivations){
                if (name.substr(0, length) == namepref){
                    result.push(name);
                }
            }
            return result;
            break;
        case 'moodledesc':
            var questionId = this.name;
            var $savearea = jQuery('#'+questionId+' .qtext .data');
            var savestring = $savearea.html();
            var savedata = '{}';
            try {
                savedata = JSON.parse(savestring);
            } catch(err) {
                savedata = {"derivations": {}, "recycled": {}};
            }
            if (typeof(savedata.derivations) == 'undefined'){
                savedata.derivations = {};
            }
            result = [];
            var length = namepref.length;
            var derivations = savedata.derivations;
            for (name in derivations){
                if (name.substr(0, length) == namepref){
                    result.push(name);
                }
            }
            return result;
        default:
            return false;
    }
}

_.open = function(derivName){
    /*********************************************
     * Open derivation with given name.
     * Implementation of open depends on the context.
     * derivName: string - name of derivation
     *********************************************/
    var derivations = this.getDerivs(derivName);
    this.derivation.init(derivName, derivations);
}

_.getDerivs = function(derivName, context, tiddler){
    /*********************************************
     * Get data of derivation with given name and its subderivations.
     * Implementation of get depends on the context.
     * derivName: string - name of derivation
     *********************************************/
    if (typeof(context) == 'undefined'){
        context = this.context;
    }
    if (typeof(tiddler) == 'undefined'){
        tiddler = this.extraparams.tiddler;
    }
    var derivations = {};
    switch(context){
        case 'tiddlywiki':
            var savetiddler = QedEditor.options.TiddlyWiki.saveTiddler;
//             if (typeof(this.extraparams.tiddler) != 'undefined'){
//                 savetiddler = this.extraparams.tiddler;
            if (typeof(tiddler) != 'undefined'){
                savetiddler = tiddler;
            }
            derivations[derivName] = this.getTiddlyDeriv(derivName, savetiddler);
            var subderivs = this.getDerivsWithPrefix(derivName + 'sub');
            for (var i = 0; i < subderivs.length; ++i){
                derivations[subderivs[i]] = this.getTiddlyDeriv(subderivs[i], savetiddler);
            }
            break;
        case 'moodlesa':
            derivations[derivName] = this.getMoodleSADeriv(derivName);
            var subderivs = this.getDerivsWithPrefix(derivName + 'sub');
            for (var i = 0; i < subderivs.length; ++i){
                derivations[subderivs[i]] = this.getMoodleSADeriv(subderivs[i], savetiddler);
            }
            break;
        case 'moodledesc':
            derivations[derivName] = this.getMoodleDescDeriv(derivName);
            var subderivs = this.getDerivsWithPrefix(derivName + 'sub');
            for (var i = 0; i < subderivs.length; ++i){
                derivations[subderivs[i]] = this.getMoodleDescDeriv(subderivs[i], savetiddler);
            }
            break;
        default:
            derivations[derivName]={};
    }
    return derivations;
}

_.getTiddlyDeriv = function(derivName, savetiddler){
    /*********************************************
     * Get derivation from tiddlywiki with DataTiddler-plugin
     * derivName: string - name of derivation
     * savetiddler: name of datatiddler
     *********************************************/
    var derivation;
// töökkö (savehere)
//     if (savetiddler != QedEditor.options.TiddlyWiki.saveTiddler){
        var emptyder = {};
        emptyder[derivName] = {
            "task": [],
            "assumption": [],
            "observation": [],
            "derivmotivation": [],
            "term": [{"text": "", "virgin": false}],
            "relation": [],
            "motivation": [],
            "check": ""
        };
        var derdata = DataTiddler.getData(savetiddler, 'derivations', emptyder);
        if (typeof(derdata[derivName]) == 'undefined'){
            derivation = emptyder[derivName];
        } else {
            derivation = derdata[derivName];
        }
// töökkö (savehere)
//     } else {
//         derivation = DataTiddler.getData(savetiddler, derivName, {"task": [], "assumption": [], "observation": [], "derivmotivation": [], "term": [{"text": "", "virgin": false}], "relation": [], "motivation": [], "check": ""});
//     }
    return derivation;
}

_.getMoodleSADeriv = function(derivName){
    var questionId = this.name;
    var $savearea = jQuery('#'+questionId+' .ablock input[type="text"]');
    var savestring = $savearea.val();
    var savedata = '{}';
    try {
        savedata = JSON.parse(savestring);
    } catch(err) {
        savedata = {"derivations": {}, "recycled": {}};
    }
    if (typeof(savedata.derivations) == 'undefined'){
        savedata.derivations = {};
    }
    var derivation = (typeof(savedata.derivations[derivName]) != 'undefined')?
        savedata.derivations[derivName] : {"task": [], "assumption": [], "observation": [], "derivmotivation": [], "term": [{"text": "", "virgin": false}], "relation": [], "motivation": [], "check": ""};
    return derivation;
}

_.getMoodleDescDeriv = function(derivName){
    var questionId = this.name;
    var $savearea = jQuery('#'+questionId+' .qtext .data');
    var savestring = $savearea.html();
    var savedata = '{}';
    try {
        savedata = JSON.parse(savestring);
    } catch(err) {
        savedata = {"derivations": {}, "recycled": {}};
    }
    if (typeof(savedata.derivations) == 'undefined'){
        savedata.derivations = {};
    }
    var derivation = (typeof(savedata.derivations[derivName]) != 'undefined')?
        savedata.derivations[derivName] : {"task": [], "assumption": [], "observation": [], "derivmotivation": [], "term": [{"text": "", "virgin": false}], "relation": [], "motivation": [], "check": ""};
    return derivation;
}

_.getDerNames = function(derivName, context, tiddler){
    /*********************************************
     * Get names of derivation and its subderivations.
     * Implementation of get depends on the context.
     * derivName: string - name of derivation
     *********************************************/
    if (typeof(context) == 'undefined'){
        context = this.context;
    }
    if (typeof(tiddler) == 'undefined'){
        tiddler = this.extraparams.tiddler;
    }
    var dernames = [];
    switch(context){
        case 'tiddlywiki':
            var savetiddler = QedEditor.options.TiddlyWiki.saveTiddler;
            if (typeof(tiddler) != 'undefined'){
                savetiddler = tiddler;
            }
            dernames = this.getTiddlyDerNames(derivName, savetiddler);
            break;
        case 'moodlesa':
            dernames = this.getMoodleSADerNames(derivName);
            break;
        case 'moodledesc':
            dernames = this.getMoodleDescDerNames(derivName);
            break;
        default:
            break;
    }
    return dernames;
}

_.getTiddlyDerNames = function(derivName, savetiddler){
    /*********************************************
     * Get names of derivation and its subderivations from tiddlywiki with DataTiddler-plugin
     * derivName: string - name of derivation
     * savetiddler: name of datatiddler
     *********************************************/
    var dernames = [derivName];
    var derivation;
// töökkö (savehere)
//     if (savetiddler != QedEditor.options.TiddlyWiki.saveTiddler){
        var emptyder = {};
        emptyder[derivName] = {
            "task": [],
            "assumption": [],
            "observation": [],
            "derivmotivation": [],
            "term": [{"text": "", "virgin": false}],
            "relation": [],
            "motivation": [],
            "check": ""
        };
        var derdata = DataTiddler.getData(savetiddler, 'derivations', emptyder);
        if (typeof(derdata[derivName]) == 'undefined'){
            derivation = emptyder[derivName];
        } else {
            derivation = derdata[derivName];
        }
// töökkö (savehere)
//     } else {
//         derivation = DataTiddler.getData(savetiddler, derivName, {"task": [], "assumption": [], "observation": [], "derivmotivation": [], "term": [{"text": "", "virgin": false}], "relation": [], "motivation": [], "check": ""});
//     }
    for (var i = 0; i < derivation.observation.length; i++){
        for (var j = 0; j < derivation.observation[i].motivation.subderiv.length; j++){
            dernames = dernames.concat(this.getTiddlyDerNames(derivation.observation[i].motivation.subderiv[j], savetiddler));
        }
    }
    for (var i = 0; i < derivation.motivation.length; i++){
        for (var j = 0; j < derivation.motivation[i].subderiv.length; j++){
            dernames = dernames.concat(this.getTiddlyDerNames(derivation.motivation[i].subderiv[j], savetiddler));
        }
    }
    return dernames;
}

_.getMoodleSADerNames = function(derivName){
    var questionId = this.name;
    var $savearea = jQuery('#'+questionId+' .ablock input[type="text"]');
    var savestring = $savearea.val();
    var savedata = '{}';
    var dernames = [derivName];
    try {
        savedata = JSON.parse(savestring);
    } catch(err) {
        savedata = {"derivations": {}, "recycled": {}};
    }
    if (typeof(savedata.derivations) == 'undefined'){
        savedata.derivations = {};
    }
    var derivation = (typeof(savedata.derivations[derivName]) != 'undefined')?
        savedata.derivations[derivName] : {"task": [], "assumption": [], "observation": [], "derivmotivation": [], "term": [{"text": "", "virgin": false}], "relation": [], "motivation": [], "check": ""};
    for (var i = 0; i < derivation.observation.length; i++){
        for (var j = 0; j < derivation.observation[i].motivation.subderiv.length; j++){
            dernames = dernames.concat(this.getTiddlyDernames(derivation.observation[i].motivation.subderiv[j]));
        }
    }
    for (var i = 0; i < derivation.motivation.length; i++){
        for (var j = 0; j < derivation.motivation[i].subderiv.length; j++){
            dernames = dernames.concat(this.getTiddlyDernames(derivation.motivation[i].subderiv[j]));
        }
    }
    return dernames;
}

_.getMoodleDescDerNames = function(derivName){
    var questionId = this.name;
    var $savearea = jQuery('#'+questionId+' .qtext .data');
    var savestring = $savearea.html();
    var savedata = '{}';
    var dernames = [derivName];
    try {
        savedata = JSON.parse(savestring);
    } catch(err) {
        savedata = {"derivations": {}, "recycled": {}};
    }
    if (typeof(savedata.derivations) == 'undefined'){
        savedata.derivations = {};
    }
    var derivation = (typeof(savedata.derivations[derivName]) != 'undefined')?
        savedata.derivations[derivName] : {"task": [], "assumption": [], "observation": [], "derivmotivation": [], "term": [{"text": "", "virgin": false}], "relation": [], "motivation": [], "check": ""};
    for (var i = 0; i < derivation.observation.length; i++){
        for (var j = 0; j < derivation.observation[i].motivation.subderiv.length; j++){
            dernames = dernames.concat(this.getTiddlyDernames(derivation.observation[i].motivation.subderiv[j]));
        }
    }
    for (var i = 0; i < derivation.motivation.length; i++){
        for (var j = 0; j < derivation.motivation[i].subderiv.length; j++){
            dernames = dernames.concat(this.getTiddlyDernames(derivation.motivation[i].subderiv[j]));
        }
    }
    return dernames;
}



_.save = function(derivName){
    /***********************************************
     * Save derivation.
     * derivName:  string - saving name of derivation (if undefined, then this.derivation.name)
     ***********************************************/
    if (typeof(derivName) == 'undefined'){
        derivName = this.derivation.name;
    }
    switch(this.context){
        case 'tiddlywiki':
            var savetiddler = QedEditor.options.TiddlyWiki.saveTiddler;
            if (typeof(this.extraparams.tiddler) != 'undefined'){
                savetiddler = this.extraparams.tiddler;
            }
            this.saveTiddly(savetiddler, derivName);
            break;
        case 'moodlesa':
            this.saveMoodleSA(derivName);
            break;
        case 'moodledesc':
            break;
        default:
            return 'Invalid context!';
    }
}

_.saveTiddly = function(savetiddler, derivName){
    /******************************************************
     * Save derivation with given name in tiddlywiki with DataTiddler-plugin.
     * savetiddler: string - name of datatiddler
     * derivName: string - name of derivation to be saved with (TODO)
     ******************************************************/
    var derivations = this.derivation.getSaveData();
    // Get data from tiddler
    var alldata = DataTiddler.getData(savetiddler, 'derivations', {});
    for (var i = 0; i<derivations.length; i++){
        alldata[derivations[i].name] = derivations[i].data;
        if (typeof(alldata[derivations[i].name].plugindata) != 'undefined'){
            derivations[i].data.plugindata = alldata[derivations[i].name].plugindata;
        }
    }
    var oldautosave = config.options.chkAutoSave;
    config.options.chkAutoSave = false;
    DataTiddler.setData(savetiddler, 'derivations', alldata);
    config.options.chkAutoSave = oldautosave;
    // End get data from tiddler
// töökkö (savehere)
//     if (savetiddler != QedEditor.options.TiddlyWiki.saveTiddler){
//         // Savetiddler is not the default datatiddler
//         var alldata = DataTiddler.getData(savetiddler, 'derivations', {});
//         for (var i = 0; i<derivations.length; i++){
//             alldata[derivations[i].name] = derivations[i].data;
//             if (typeof(alldata[derivations[i].name].plugindata) != 'undefined'){
//                 derivations[i].data.plugindata = alldata[derivations[i].name].plugindata;
//             }
//         }
//         DataTiddler.setData(savetiddler, 'derivations', alldata);
//     } else {
//         // savetiddler is the default datatiddler
//         for (var i = 0; i<derivations.length; i++){
//             var alldata = DataTiddler.getData(savetiddler, derivations[i].name, {});
//             if (typeof(alldata[derivations[i].name].plugindata) != 'undefined'){
//                 derivations[i].data.plugindata = alldata[derivations[i].name].plugindata;
//             }
//             DataTiddler.setData(savetiddler, derivations[i].name, derivations[i].data);
//         }
//     }
}

_.saveMoodleSA = function(derivName){
    /******************************************************
     * Save derivations in Moodle's shortanswer question
     ******************************************************/
    if (typeof(derivName) == 'undefined'){
        derivName = this.name;
    }
    var questionId = derivName.replace(/sub[0-9]+$/,'');
    var $savearea = jQuery('#'+questionId+' .ablock input[type="text"]');
    var savestring = $savearea.val();
    var savedata = '{}';
    try {
        savedata = JSON.parse(savestring);
    } catch(err) {
        savedata = {"derivations": {}, "recycled": {}};
    }
    if (typeof(savedata.derivations) == 'undefined'){
        savedata.derivations = {};
    }
    var derivations = this.derivation.getSaveData();
    for (var i = 0; i<derivations.length; i++){
        if (typeof(savedata.derivations[derivations[i].name]) != 'undefined' && typeof(savedata.derivations[derivations[i].name].plugindata) != 'undefined'){
            derivations[i].data.plugindata = savedata.derivations[derivations[i].name].plugindata;
        }
        savedata.derivations[derivations[i].name] = derivations[i].data;
    }
    savestring = JSON.stringify(savedata);
    $savearea.val(savestring);
    if (this.saveajax){
        var formUrl = $('form#responseform').attr('action') + '#' + questionId;
        var $ajaxanswer = jQuery('<div class="ajaxanswer"></div>');
        var formdata = {};
        formdata['resp' + questionId.slice(1) + '_'] = savestring;
        formdata['resp' + questionId.slice(1) + '_submit'] = 'Submit';
        formdata['timeup'] = 0;
        formdata['questionids'] = questionId.slice(1);
        testilogit.ajaxresponse = jQuery.post(formUrl, formdata);
    }
}

_.deleteDeriv = function(derivName, recycle){
    /******************************************************
     * Delete given derivation from save storage.
     * Different implementations for different contexts.
     * derivName: string - name of the derivation to delete
     * recycle:   bool   - whether to recycle or really delete
     ******************************************************/
    switch(this.context){
        case 'tiddlywiki':
            if (!recycle){
                var savetiddler = QedEditor.options.TiddlyWiki.saveTiddler;
                if (typeof(this.extraparams.tiddler) != 'undefined'){
                    savetiddler = this.extraparams.tiddler;
                }
                this.deleteTiddly(savetiddler, derivName);
            } else {
                var savetiddler = QedEditor.options.TiddlyWiki.recycleTiddler;
                if (typeof(this.extraparams.tiddler) != 'undefined'){
                    savetiddler = this.extraparams.tiddler;
                }
                this.recycleTiddly(savetiddler, derivName);
            }
            break;
        case 'moodlesa':
            if (!recycle){
                this.deleteMoodleSA(derivName);
            } else {
                this.recycleMoodleSA(derivName);
            }
            break;
        case 'moodledesc':
            break;
        default:
            return 'Invalid context!';
    }    
}
_.deleteTiddly = function(savetiddler, derivName){
    /******************************************************
     * Delete this derivation from TiddlyWiki's DataTiddler.
     * savetiddler: string - name of datatiddler
     ******************************************************/
// töökkö (savehere)
//     if (savetiddler != QedEditor.options.TiddlyWiki.saveTiddler){
        var alldata = DataTiddler.getData(savetiddler, 'derivations',{});
        delete alldata[derivName];
        DataTiddler.setData(savetiddler, 'derivations', alldata);
// töökkö (savehere)
//     } else {
//         DataTiddler.setData(tiddler, derivName);
//     }
}
_.deleteMoodleSA = function(derivName){
    /******************************************************
     * Delete this derivation from Moodle's short answer question inputbox.
     ******************************************************/
    var questionId = this.name;
    var $savearea = jQuery('#'+questionId+' .ablock input[type="text"]');
    var savestring = $savearea.val();
    var savedata = '{}';
    try {
        savedata = JSON.parse(savestring);
    } catch(err) {
        savedata = {"derivations": {}, "recycled": {}};
    }
    delete savedata.derivations[this.name];
    savestring = JSON.stringify(savedata);
    $savearea.val(savestring);
}

_.recycleTiddly = function(savetiddler, derivName){
    /******************************************************
     * Don't delete yet, but mark given derivation for recycle
     * savetiddler: string - name of datatiddler
     * derivName:   string - name of derivation to recycle
     ******************************************************/
// töökkö (savehere)
//     if (savetiddler != QedEditor.options.TiddlyWiki.recycleTiddler){
        var alldata = DataTiddler.getData(savetiddler, 'recycled', {});
        var data = alldata[this.derivation.name];
        if (typeof(data) == 'undefined'){
            data = [];
        }
        if (data.indexOf(derivName) == -1){
            data.push(derivName);
        }
        alldata[this.derivation.name] = data;
        DataTiddler.setData(savetiddler, 'recycled', alldata);
// töökkö (savehere)
//     } else {
//         var data = DataTiddler.getData(savetiddler, this.derivation.name, []);
//         if (data.indexOf(derivName) == -1){
//             data.push(derivName);
//         }
//         DataTiddler.setData(savetiddler, this.derivation.name, data);
//     }
}
_.recycleMoodleSA = function(derivName){
    /******************************************************
     * Don't delete yet, but mark given derivation for recycle
     * derivName:  string - name of derivation to recycle
     ******************************************************/
    var questionId = this.name;
    var $savearea = jQuery('#'+questionId+' .ablock input[type="text"]');
    var savestring = $savearea.val();
    var savedata = '{}';
    try {
        savedata = JSON.parse(savestring);
    } catch(err) {
        savedata = {"derivations": {}, "recycled": {}};
    }
    if (typeof(savedata.recycled) == 'undefined'){
        savedata.recycled = {};
    }
    var data = savedata.recycled[this.derivation.name];
    if (typeof(data) == 'undefined'){
        data = [];
    }
    if (data.indexOf(derivName) == -1){
        data.push(derivName);
    }
    savedata.recycled[this.derivation.name] = data;
    savestring = JSON.stringify(savedata);
    $savearea.val(savestring);
}
_.recycleCancel = function(derivName){
    /******************************************************
     * Cancel deleting by removing mark for recycle
     * derivName:   string - name of derivation
     ******************************************************/
    switch(this.context){
        case 'tiddlywiki':
            var savetiddler = QedEditor.options.TiddlyWiki.saveTiddler;
            if (typeof(this.extraparams.tiddler) != 'undefined'){
                savetiddler = this.extraparams.tiddler;
            }
            this.recycleCancelTiddly(savetiddler, derivName);
            break;
        case 'moodlesa':
            this.recycleCancelMoodleSA(derivName);
            break;
        default:
            return 'Invalid context!';
    }
}
_.recycleCancelTiddly = function(savetiddler, derivName){
    /******************************************************
     * Cancel deleting by removing mark for recycle
     * Implementation for TiddlyWiki
     * savetiddler:  string -
     * derivName:    string - 
     ******************************************************/
// töökkö (savehere)
//     if (savetiddler != QedEditor.options.TiddlyWiki.recycleTiddler){
        var alldata = DataTiddler.getData(savetiddler, 'recycled', {});
        var data = (typeof(alldata[this.derivation.name]) != 'undefined') ? alldata[this.derivation.name] : [];
        var datapos = data.indexOf(derivName);
        if (datapos != -1){
            data.splice(datapos, 1);
        }
        if (data.length == 0){
            delete alldata[this.derivation.name];
        }
        DataTiddler.setData(savetiddler, 'recycled', alldata);
// töökkö (savehere)
//     } else {
//         var data = DataTiddler.getData(savetiddler, this.derivation.name, []);
//         var datapos = data.indexOf(derivName);
//         if (datapos != -1){
//             data.splice(datapos, 1);
//         }
//         if (data.length == 0){
//             DataTiddler.setData(savetiddler, this.derivation.name);
//         } else {
//             DataTiddler.setData(savetiddler, this.derivation.name, data);
//         }
//     }
}
_.recycleCancelMoodleSA = function(derivName){
    /******************************************************
     * Cancel deleting by removing mark for recycle
     * Implementation for Moodle's short answer questions
     ******************************************************/
    var questionId = this.name;
    var $savearea = jQuery('#'+questionId+' .ablock input[type="text"]');
    var savestring = $savearea.val();
    var savedata = '{}';
    try {
        savedata = JSON.parse(savestring);
    } catch(err) {
        savedata = {"derivations": {}, "recycled": {}};
    }
    if (typeof(savedata.recycled) == 'undefined'){
        savedata.recycled = {};
    }
    var data = savedata.recycled[this.derivation.name];
    if (typeof(data) == 'undefined'){
        data = [];
    }
    var datapos = data.indexOf(derivName);
    if (datapos != -1){
        data.splice(datapos, 1);
    }
    if (data.length == 0){
        delete savedata.recycled[this.derivation.name];
    } else {
        savedata.recycled[this.derivation.name] = data;
    }
    savestring = JSON.stringify(savedata);
    $savearea.val(savestring);    
}


_.cleanRecycleBin = function(){
    /***********************************************
     * Remove leftovers of deleted subderivations
     ***********************************************/
    switch (this.context){
        case 'tiddlywiki':
            var savetiddler = QedEditor.options.TiddlyWiki.recycleTiddler;
            if (typeof(this.extraparams.tiddler) != 'undefined'){
                savetiddler = this.extraparams.tiddler;
            }
            this.cleanRecycleBinTiddly(savetiddler);
            break;
        //case 'moodlesa': (TODO)
        default:
            break;
    }
}

_.cleanRecycleBinTiddly = function(savetiddler){
    /***********************************************
     * Remove leftovers of deleted subderivations
     * TiddlyWiki implementation
     ***********************************************/
// töökkö (savehere)
//     if (savetiddler != QedEditor.options.TiddlyWiki.recycleTiddler){
        var recycledata = DataTiddler.getData(savetiddler, 'recycled', {});
        var subders = recycledata[this.derivation.name];
        for (var i = 0; i < subders.length; i++){
            this.deleteDeriv(subders[i]);
        }
        delete recycledata[this.derivation.name];
        DataTiddler.setData(savetiddler, 'recycled', recycledata);
// töökkö (savehere)
//     } else {
//         var subders = DataTiddler.getData(savetiddler, this.derivation.name, []);
//         for (var i = 0; i < subders.length; i++){
//             this.deleteDeriv(subders[i]);
//         }
//         DataTiddler.setData(savetiddler, this.derivation.name);
//     }
}

/*******************************************************
 * QedEditor-helper functions
 * event handlers etc.
 *******************************************************/
QedEditor.oprHandler = function(e){
    var $editor = jQuery(this).parents('div.qededitor');
    var parts = e.data.loc.replace(/_motivation$/,'').split('_'+e.data.splitelem+'_');
    var position = parseInt(parts.pop());
    var location = parts.join('_'+e.data.splitelem+'_');
    testilogit['data'] = e.data;
    var derivation = $editor[0].editor.derivation.findLocation(location);
    var data = ['',''];
    switch (e.data.oper){
        case 'add':
            switch (e.data.elem){
                case 'task':
                    var tasktext = derivation.term[0].text.replace(/\\text{([^{}]*)}/g, '$$$1$$');
                    tasktext = ('$'+tasktext+'$').replace(/\$\$/g,'');
                    data = [tasktext, ''];
                    position = 0;
                    $editor[0].editor.nextFocus = location + '_task_0';
                    break;
                case 'taskass':
                    var tasktext = derivation.term[0].text.replace(/\\text{([^{}]*)}/g, '$$$1$$');
                    tasktext = ('$'+tasktext+'$').replace(/\$\$/g,'');
                    data = [tasktext, derivation.term[0].text];
                    position = 0;
                    $editor[0].editor.nextFocus = location + '_assumption_0';
                    break;                    
                case 'taskobs':
                    var tasktext = derivation.term[0].text.replace(/\\text{([^{}]*)}/g, '$$$1$$');
                    tasktext = ('$'+tasktext+'$').replace(/\$\$/g,'');
                    data = [tasktext, derivation.term[0].text];
                    position = 0;
                    $editor[0].editor.nextFocus = location + '_observation_0_motivation';
                    break;                  
                case 'assumption':
                    if (e.data.splitelem == 'task'){
                        position = 0;
                    } else {
                        position = position +1;
                    }
                    $editor[0].editor.nextFocus = location + '_assumption_'+position;
                    break;
                case 'observation':
                    if (e.data.splitelem == 'task' || e.data.splitelem == 'assumption'){
                        position = 0;
                    } else {
                        position = position +1;
                    }
                    $editor[0].editor.nextFocus = location + '_observation_'+position+'_motivation';
                    break;
                case 'step':
                    var newrel = '';
                    if (position < 1){
                        newrel = (typeof(derivation.relation[0]) != 'undefined') ? derivation.relation[0].text : '';
                    } else if (position > derivation.relation.length-1){
                        newrel = derivation.relation[derivation.relation.length-1].text;
                    } else {
                        newrel = derivation.relation[position-1].text;
                    }
                    var newmot = {'text': '', 'subders': []};
                    var newterm = derivation.term[position].text;
                    data = [{'relation': newrel,
                            'motivation': newmot,
                            'term': newterm}, ''];
                    if (newrel == ''){
                        $editor[0].editor.nextFocus = location + '_relation_'+position;
                    } else {
                        $editor[0].editor.nextFocus = location + '_motivation_'+position;
                    }
                    break;
                case 'subderivation':
                    if (e.data.splitelem == 'motivation' || e.data.splitelem == 'observation'){
                        location = e.data.loc;
                        position = 0;
                    } else if (e.data.splitelem == 'term'){
                        parts = location.split('_subderivation_');
                        position = parseInt(parts.pop())+1;
                        location = parts.join('_subderivation_');
                    } else {
                        location = e.data.loc.replace(/_subderivation_[0-9]+$/, '');
                        position = parseInt(parts[parts.length-1])+1;
                    }
                    $editor[0].editor.nextFocus = location + '_subderivation_'+position+'_term_0';
                    break;
                case 'derivationmotivation':
                    $editor[0].editor.nextFocus = location + '_derivmotivation_0';
                    break;
                default:
                    alert(e.data.oper + '\n' + e.data.elem)
                    break;
            }
            break;
        case 'remove':
            switch (e.data.elem){
                case 'task':
                    data = ['',derivation.task[0].text];
                    position = 0;
                    $editor[0].editor.nextFocus = location + '_term_0';
                    break;
                case 'taskass':
                    data = ['',derivation.task[0].text];
                    position = 0;
                    $editor[0].editor.nextFocus = location + '_term_0';
                    break;
                case 'taskobs':
                    data = ['',derivation.task[0].text];
                    position = 0;
                    $editor[0].editor.nextFocus = location + '_term_0';
                    break;
                case 'assumption':
                    data = ['',derivation.assumption[position].text];
                    if (derivation.assumption.length == 1){
                        $editor[0].editor.nextFocus = location + '_task_0';

                    } else {
                        if (derivation.assumption.length > position+1){
                            $editor[0].editor.nextFocus = location + '_assumption_'+position;
                        } else {
                            $editor[0].editor.nextFocus = location + '_assumption_'+(position-1);
                        }
                    }
                    break;
                case 'observation':
                    data = ['',derivation.observation[position]];
                    if (derivation.observation.length == 1){
                        if (derivation.assumption.length > 0){
                            $editor[0].editor.nextFocus = location + '_assumption_'+(derivation.assumption.length-1);
                        }else {
                            $editor[0].editor.nextFocus = location + '_task_0';
                        }
                    } else {
                        if (derivation.observation.length > position+1){
                            $editor[0].editor.nextFocus = location + '_observation_'+position;
                        } else {
                            $editor[0].editor.nextFocus = location + '_observation_'+(position-1);
                        }
                    }
                    break;
                case 'step':
                    var oldrel = derivation.relation[position].text;
                    var oldmot = {'text': derivation.motivation[position].text,
                                'subders': []};
                    for (var i = 0; i < derivation.motivation[position].subderivation.length; i++){
                        oldmot.subders.push(derivation.motivation[position].subderivation[i].name);
                    }
                    var oldterm = derivation.term[position+1].text;
                    data = ['', {'relation': oldrel,
                                'motivation': oldmot,
                                'term': oldterm}];
                    $editor[0].editor.nextFocus = location + '_term_'+position;
                    break;
                case 'derivationmotivation':
                    data = ['',derivation.derivmotivation[0].text];
                    $editor[0].editor.nextFocus = location + '_term_0'
                    break;
                case 'subderivation':
                    parts = location.split('_subderivation_');
                    position = parseInt(parts.pop());
                    location = parts.join('_subderivation_');
                    var oldsubder = $editor[0].editor.derivation.findLocation(location).subderivation[position].name;
                    data = ['', oldsubder];
                    $editor[0].editor.nextFocus = location;
                    break;
                default:
                    alert(e.data.oper + '\n' + e.data.elem)
                    break;
            }
            break;
        case 'undo':
        case 'redo':
            location = '';
            position = '';
            data = ['',''];
            break;
        default:
            break;
    }
    var newevent = new EditorEvent(e.data.oper, e.data.elem, location, position, data);
    $editor[0].editor.doEvent(newevent);
    jQuery('#qededitormenuwrapper').remove();
    return false;
}

_.installPlugins = function(){
    /*******************************************
     * Installs all available plugins in this editor instance
     *******************************************/
    for (var i = 0; i < QedEditor.plugins.length; i++){
        if (typeof(QedEditor.plugins[i]) != 'undefined'){
            this.plugins.push(QedEditor.plugins[i].use(this));
        }
    }
}

_.pluginButtons = function(){
    /*******************************************
     * Output html of plugins
     *******************************************/
    var html = '';
    for (var i = 0; i < this.plugins.length; i++){
        html += this.plugins[i].html();
    }
    return html;
}

_.initPlugins = function(){
    /*******************************************
     * Init button clicks for each button of each plugin
     *******************************************/
    var plugs = jQuery(this.element).find('.qededitorbuttons .pluginbuttons');
    for (var i = 0; i < this.plugins.length; i++){
        try {
            this.plugins[i].init();
        } catch (e) {};
        var buttons = plugs.eq(i).find('li.pluginitem a.pluginbutton');
        for (var j = 0; j < this.plugins[i].buttons.length; j++){
            var eventdata = {"editor": this, "plugin": this.plugins[i]};
            buttons.eq(j).click(function(){
                jQuery(this).parents('ul').eq(0).hide();
                setTimeout("jQuery('.pluginbuttons ul').attr('style','')",500);
                return false;
            });
            buttons.eq(j).click(eventdata, this.plugins[i].buttons[j].action);
        }
    }
}


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

/********************************************
 * ButtonPanel -class                       *
 ********************************************/
function ButtonPanel(tablelist) {
    //this.recentlyused =[]; TODO when working
    if(tablelist === undefined) {
        tablelist = defbuttons;
    }
    this.buttontables = [];
    if(tablelist != []) {
        for(var i = 0; i < tablelist.length; i++) {
            table = new ButtonTable(tablelist[i].name, tablelist[i].icon);
            for(var j = 0; j < tablelist[i].elements.length; j++) {
                element = new ButtonElement(tablelist[i].elements[j].name, tablelist[i].elements[j].latex, tablelist[i].elements[j].icon, tablelist[i].elements[j].inside, tablelist[i].elements[j].move);
                table.addElement(element);
            }
            this.buttontables.push(table);
        }
    }
    this.lastfocus = '';
    //this.language = find from content!!; give with param

}

_ = ButtonPanel.prototype;
_.createpanel = function(tablelist) {
    this.buttontables = [];
    if(tablelist != []) {
        for(var i = 0; i < tablelist.length; i++) {
            table = new ButtonTable(tablelist[i].name, tablelist[i].icon);
            for(var j = 0; j < tablelist[i].elements.length; j++) {
                element = new ButtonElement(tablelist[i].elements[j].name, tablelist[i].elements[j].latex, tablelist[i].elements[j].icon);
                table.addElement(element);
            }
            this.buttontables.push(table);
        }
    }
}
_.addTable = function(table) {
    this.buttontables.push(table);
}
_.html = function() {
    var result = '';
    result += '<div id="mathbuttonpanel">\n';
    if(this.buttontables != []) {
        result += '    <ul class="buttontablelist">\n';
        for(var i = 0; i < this.buttontables.length; i++) {
            result += '        <li class="buttontableicon">\n           <a href="javascript:;" class="'+this.buttontables[i].name+'"><span class="buttonicon">' + this.buttontables[i].icon + '</span><span class="buttoncategoryname">'+QedEditor.locales[this.buttontables[i].name][QedEditor.options.lang]+'</span></a>\n<div class="buttoncatwrapper">\n';
            result += this.buttontables[i].html();
            result += '        </div></li>\n';
        }
        result += '    </ul>\n';
    }
    result += '</div>\n';
    return result;
}

_.initClicks = function(){
    jQuery('#mathbuttonpanel .buttonelementtable a.buttonlink').click(function(){
        var latex = jQuery(this).attr('title');
        var has_inside = jQuery(this).attr('inside');
        var $mathquillelem = jQuery(QedEditor.buttonpanel.lastfocus);
        if ($mathquillelem.focus().find('.cursor').parent().hasClass('text') || $mathquillelem.focus().find('.cursor').parent().hasClass('mathquill-textbox')){
            return false;
        }
        var data = $mathquillelem.data('[[mathquill internal data]]');
        var block = data && data.block;
        var cursor = block && block.cursor;
        var selection ='';
        if (cursor && cursor.selection){
            var selection = cursor.selection.latex();
        }
        if(selection != ''){
            if( has_inside=='1' ){
                $mathquillelem.mathquill('write',latex+'{'+cursor.selection.latex()+'}');
            }else if (has_inside =='2'){
                $mathquillelem.mathquill('write',latex+'{'+cursor.selection.latex()+'}{}');
            }else{
                $mathquillelem.mathquill('write',latex);
            }
       }else{
            $mathquillelem.mathquill('write',latex);
        }
        $mathquillelem.focus();
        if (cursor){
            for (var movement = 0; movement < parseInt(has_inside);movement ++){
                cursor.moveLeft();
            }
        }
        return false;
    });
}

/********************************************
 * ButtonTable -class                       *
 ********************************************/
function ButtonTable(name, icon) {
    this.name = name;
    this.icon = icon;
    this.buttonelements = [];
}

_ = ButtonTable.prototype;
_.html = function() {
    var len = this.buttonelements.length;
    var result = '';
    if(len == 0) {
        return ''
    } else{
        var k=Math.ceil(Math.sqrt(len));
        result += '                 <table class="buttonelementtable">\n';
        for(var i = 0; k*i < len; i++) {
            result += '                 <tr>\n';
            for(var j=0; j<k;j++){
                if (k*i+j<len){
                    result += '                 <td>                     <a class="buttonlink '+this.buttonelements[k*i+j].name+'" href="javascript:;" title="' + this.buttonelements[k*i+j].latex + '" inside="' + this.buttonelements[k*i+j].has_inside + '" ><span>' + this.buttonelements[k*i+j].icon + '</span></a></td>\n';
                }else{
                    result += '<td></td>';
                }
            }
            result += '                 </tr>\n';
        }

            result += '                 </table>\n';
    }
    return result;
}
_.addElement = function(newElement) {
    this.buttonelements.push(newElement);
}

/********************************************
 * ButtonElement -class                     *
 ********************************************/
function ButtonElement(name, latex, icon,inside) {
    this.name = name;
    this.latex = latex;
    this.icon = icon;
    if(inside === undefined) {
        inside = 0;
    }
    this.has_inside= inside;
}

/********************************************
 * default Buttons                          *
 ********************************************/
var defbuttons = [
    {
    'name' : 'relations',
    'icon' : 'R',
    'elements' : [
        {
            'name' : 'equal',
            'latex' : '= ',
            'icon' : '='
        },
        {
            'name' : 'lessthan',
            'latex' : '\\lt ',
            'icon' : '&lt;'
        },
        {
            'name' : 'greaterthan',
            'latex' : '\\gt ',
            'icon' : '&gt;'
        },
        {
            'name' : 'lessorequalthan',
            'latex' : '\\leq ',
            'icon' : '&le;'
        },
        {
            'name' : 'greaterorequalthan',
            'latex' : '\\geq ',
            'icon' : '&ge;'
        },
        {
            'name' : 'notequal',
            'latex' : '\\neq ',
            'icon' : '&ne;'
        },
        {
            'name' : 'leftimp',
            'latex' : '\\Leftarrow ',
            'icon' : '&lArr;'
        },
        {
            'name' : 'rightimp',
            'latex' : '\\Rightarrow ',
            'icon' : '&rArr;'
        },
        {
            'name' : 'eqvivalent',
            'latex' : '\\iff ',
            'icon' : '&hArr;'
        }
    ]
    },
    {
    'name' : 'misc',
    'icon' : 'M',
    'elements' : [
        {
            'name' : 'frac',
            'latex' : '\\frac ',
            'icon' : '/',
            'inside': '2'
        },
        {
            'name' : 'sqroot',
            'latex' : '\\sqrt ',
            'icon' : '&radic;',
            'inside' : '1'
        },
/*        {
            'name' : 'centerdot',
            'latex' : '\\cdot ',
            'icon' : '&sdot;'
        },*/
        {
            'name' : 'sub',
            'latex' : '_',
            'icon' : 'X<sub style="color: red; font-weight: bold;">2</sub>',
            'inside' : '1'
        },
        {
            'name' : 'sup',
            'latex' : '^',
            'icon' : 'X<sup style="color: red; font-weight: bold;">2</sup>',
            'inside' : '1'
        },
        {
            'name' : 'isin',
            'latex' : '\\in ',
            'icon' : '&isin;'
        },
/*        {
            'name' : 'parentesis',
            'latex' : '\\left( ',
            'icon' : '('
        },*/
        {
            'name' : 'logicalor',
            'latex' : '\\lor ',
            'icon' : '&or;'
        },
        {
            'name' : 'logicaland',
            'latex' : '\\and ',
            'icon' : '&and;'
        },
        {
            'name' : 'logicalnot',
            'latex' : '\\not ',
            'icon' : '&not;'
        },
        {
            'name' : 'infinity',
            'latex' : '\\inf ',
            'icon' : '&infin;'
        },
        {
            'name' : 'empty',
            'latex' : '\\emptyset ',
            'icon' : '&empty;'
        },
        {
            'name' : 'angle',
            'latex' : '\\angle ',
            'icon' : '&ang;'
        },
        {
            'name' : 'degree',
            'latex' : '^{\\circ } ',
            'icon' : '&deg;'
        },
        {
            'name' : 'approx',
            'latex' : '\\approx ',
            'icon' : '&asymp;'
        },
        {
            'name' : 'plusminus',
            'latex' : '\\pm ',
            'icon' : '&plusmn;'
        }
    ]
    },
/*    {
    'name' : 'numberfields',
    'icon' : '&real;',
    'elements' : [
        {
            'name' : 'natural',
            'latex' : '\\mahtbb{N} ',
            'icon' : 'N'
        },
        {
            'name' : 'integer',
            'latex' : '\\mahtbb{Z} ',
            'icon' : 'Z'
        },
        {
            'name' : 'posintegers',
            'latex' : '\\mathbb{Z}_+ ',
            'icon' : 'Z<sub>+</sub>'
        },
        {
            'name' : 'negintegers',
            'latex' : '\\mathbb{Z}_- ',
            'icon' : 'Z<sub>-</sub>'
        },
        {
            'name' : 'rational',
            'latex' : '\\mahtbb{Q} ',
            'icon' : 'Q'
        },
        {
            'name' : 'real',
            'latex' : '\\mahtbb{R} ',
            'icon' : 'R'
        },
        {
            'name' : 'posreal',
            'latex' : '\\mathbb{R}_+ ',
            'icon' : 'R<sub>+</sub>'
        },
        {
            'name' : 'negreal',
            'latex' : '\\mathbb{R}_- ',
            'icon' : 'R<sub>-</sub>'
        }
    ]
    },*/
    {
    'name' : 'greeks',
    'icon' : '&alpha;',
    'elements' : [
        {
            'name' : 'alpha',
            'latex' : '\\alpha ',
            'icon' : '&alpha;'
        },
        {
            'name' : 'beta',
            'latex' : '\\beta ',
            'icon' : '&beta;'
        },
        {
            'name' : 'gamma',
            'latex' : '\\gamma ',
            'icon' : '&gamma;'
        },
        {
            'name' : 'delta',
            'latex' : '\\delta ',
            'icon' : '&delta;'
        },
        {
            'name' : 'epsilon',
            'latex' : '\\epsilon ',
            'icon' : '&epsilon;'
        },
        {
            'name' : 'zeta',
            'latex' : '\\zeta ',
            'icon' : '&zeta;'
        },
        {
            'name' : 'eta',
            'latex' : '\\eta ',
            'icon' : '&eta;'
        },
        {
            'name' : 'theta',
            'latex' : '\\theta ',
            'icon' : '&theta;'
        },
        {
            'name' : 'iota',
            'latex' : '\\iota ',
            'icon' : '&iota;'
        },
        {
            'name' : 'kappa',
            'latex' : '\\kappa ',
            'icon' : '&kappa;'
        },
        {
            'name' : 'lambda',
            'latex' : '\\lambda ',
            'icon' : '&lambda;'
        },
        {
            'name' : 'mu',
            'latex' : '\\mu ',
            'icon' : '&mu;'
        },
        {
            'name' : 'nu',
            'latex' : '\\nu ',
            'icon' : '&nu;'
        },
        {
            'name' : 'xi',
            'latex' : '\\xi ',
            'icon' : '&xi;'
        },
        {
            'name' : 'pi',
            'latex' : '\\pi ',
            'icon' : '&pi;'
        },
        {
            'name' : 'rho',
            'latex' : '\\rho ',
            'icon' : '&rho;'
        },
        {
            'name' : 'sigma',
            'latex' : '\\sigma ',
            'icon' : '&sigma;'
        },
        {
            'name' : 'tau',
            'latex' : '\\tau ',
            'icon' : '&tau;'
        },
        {
            'name' : 'upsilon',
            'latex' : '\\upsilon ',
            'icon' : '&upsilon;'
        },
        {
            'name' : 'phi',
            'latex' : '\\phi ',
            'icon' : '&phi;'
        },
        {
            'name' : 'chi',
            'latex' : '\\chi ',
            'icon' : '&chi;'
        },
        {
            'name' : 'psi',
            'latex' : '\\psi ',
            'icon' : '&psi;'
        },
        {
            'name' : 'omega',
            'latex' : '\\omega ',
            'icon' : '&omega;'
        }
    ]
}];

QedEditor.buttonpanel = new ButtonPanel();

/********************************************
 * EditorEvent -class                       *
 ********************************************/
function EditorEvent(event,item,loc,pos,data) {
    if (typeof(event)=='string'){
        this.event = event;
        if(typeof(item) == 'undefined') {
            this.item = '';
        }else{
            this.item=item;
        }
        if(typeof(loc) == 'undefined') {
            this.location = '';
        }else{
            this.location=loc;
        }
        if(typeof(pos) == 'undefined') {
            this.position = -1;
        }else{
            this.position = parseInt(pos);
        }
        if(typeof(data) == 'undefined') {
            this.data = ['',''];
        }else{
            this.data = data;
        }
    } else {
        // TODO: check for type
        this.event = event.event;
        this.item = event.item;
        this.location = event.location;
        this.position = event.position;
        this.data = [event.data[0], event.data[1]];
    }
}
_ = EditorEvent.prototype;
_.oldData = function(){
    return this.data[1];
}
_.newData = function(){
    return this.data[0];
}
_.invertThis = function(){
    switch(this.event){
        case 'edit':
            this.data.reverse();
            break;
        case 'add':
            this.event='remove';
            this.data.reverse();
            break;
        case 'remove':
            this.event = 'add';
            this.data.reverse();
            break;
        default:
            return this;
    }
}
_.invert = function(){
    var event = new EditorEvent(this);
    event.invertThis();
    return event;
}



/********************************************
 * Eventstack -class                       *
 ********************************************/
function Eventstack(size, events) {
    if(typeof(events) == 'object' && events.length) {
            this.stackevents = events;
        }else{
            this.stackevents = [];
        }
    this.maxstacksize = size;
     
}
_ = Eventstack.prototype;
_.maxsize = function (size){
    if (typeof(size) == 'number'){
        this.maxstacksize = size;
    }else{
        return this.maxstacksize;
    }
}
_.push = function (item){
    this.stackevents.push(item);
    if (this.stackevents.length > this.maxstacksize && this.maxstacksize > 0){
        this.stackevents.shift();
    }
}
_.pop = function (){
    return this.stackevents.pop();
}
_.clear = function (){
    this.stackevents = [];
}
_.size = function(){
    return this.stackevents.length;
}
_.isempty = function(){
    return this.stackevents.length == 0;
}


/******************************************************************************************************
 * QedPlugin -class
 ******************************************************************************************************/
function QedPlugin(name, iconurl, init, editor){
    this.editor = editor || false;
    this.name = name;
    this.iconurl = iconurl;
    this.buttons = [];
    this.data = {};
    this.init = init || function(){return false;};
}

_ = QedPlugin.prototype;


_.html = function(){
    /*********************************************
     * Output of plugin
     *********************************************/
    var html = '<div class="pluginbuttons" name="'+this.name+'">\n<span class="pluginname"><img src="'+this.iconurl+'" alt="'+this.name+'" style="height: 24px; width: auto;" /></span><ul>\n';
    for (var i = 0; i < this.buttons.length; i++){
        html += this.buttons[i].html();
    }
    html += '</ul>\n</div>\n';
    return html;
}

_.setData = function(data){
    /*********************************************
     * Set plugin data
     *********************************************/
    this.data = data;
}

_.use = function(editor){
    /*********************************************
     * Return a copy of this plugin for given editor
     *********************************************/
    if (typeof(editor) == 'undefined'){
        editor = this.editor;
    }
    var newplugin = new QedPlugin(this.name, this.iconurl, this.init, editor);
    var newbutton;
    for (var i = 0; i < this.buttons.length; i++){
        newplugin.buttons.push(this.buttons[i].use(this));
    }
    return newplugin;
}

_.addButton = function(button){
    /*********************************************
     * Return a copy of this plugin for given editor
     *********************************************/
    button.plugin = this;
    this.buttons.push(button);
}

_.savedata = function(key, datavalue){
    /***********************************************
     * Save data of plugin.
     ***********************************************/
    if (typeof(key) != 'string'){
        return false;
    }
    switch(this.editor.context){
        case 'tiddlywiki':
            var savetiddler = QedEditor.options.TiddlyWiki.saveTiddler;
            if (typeof(this.editor.extraparams.tiddler) != 'undefined'){
                savetiddler = this.editor.extraparams.tiddler;
            }
            this.saveTiddly(savetiddler, key, datavalue);
            break;
        case 'moodlesa':
            this.saveMoodleSA(key, datavalue);
            break;
        case 'moodledesc':
            break;
        default:
            return 'Invalid context!';
    }
}

_.saveTiddly = function(savetiddler, key, datavalue){
    /******************************************************
     * Save data of plugin in tiddlywiki with DataTiddler-plugin.
     * savetiddler: string - name of datatiddler
     * key, datavalue: key and datavalue pair
     ******************************************************/
    var derivname = this.editor.derivation.name;
// töökkö (savehere)
//     if (savetiddler != QedEditor.options.TiddlyWiki.saveTiddler){
        // Savetiddler is not the default datatiddler
        var alldata = DataTiddler.getData(savetiddler, 'derivations', {});
        if (typeof(alldata[derivname].plugindata) == 'undefined'){
            alldata[derivname].plugindata = {};
        }
        if (typeof(alldata[derivname].plugindata[this.name]) == 'undefined'){
            alldata[derivname].plugindata[this.name] = {};
        }
        if (typeof(datavalue) != 'undefined'){
            alldata[derivname].plugindata[this.name][key] = datavalue;
        } else {
            delete alldata[derivname].plugindata[this.name][key];
        }
        DataTiddler.setData(savetiddler, 'derivations', alldata);
// töökkö (savehere)
//     } else {
//         // savetiddler is the default datatiddler
//         var derivdata = DataTiddler.getData(savetiddler, derivname, {});
//         if (typeof(derivdata.plugindata) == 'undefined'){
//             derivdata.plugindata = {};
//         }
//         if (typeof(derivdata.plugindata[this.name]) == 'undefined'){
//             derivdata.plugindata[this.name] = {};
//         }
//         if (typeof(datavalue) != 'undefined'){
//             derivdata.plugindata[this.name][key] = datavalue;
//         } else {
//             delete derivdata.plugindata[this.name][key];
//         }
//         DataTiddler.setData(savetiddler, derivname, derivdata);
//     }
}

_.saveMoodleSA = function(key, datavalue){
    /******************************************************
     * Save data of plugin in Moodle's shortanswer question
     ******************************************************/
    var derivname = this.editor.derivation.name;
    var questionId = derivname.replace(/sub[0-9]+$/,'');
    var $savearea = jQuery('#'+questionId+' .ablock input[type="text"]');
    var savestring = $savearea.val();
    var savedata = '{}';
    try {
        savedata = JSON.parse(savestring);
    } catch(err) {
        savedata = {"derivations": {}, "recycled": {}};
    }
    if (typeof(savedata.derivations) == 'undefined'){
        savedata.derivations = {};
    }
    if (typeof(savedata.derivations[derivname].plugindata) == 'undefined'){
        savedata.derivations[derivname].plugindata = {};
    }
    if (typeof(savedata.derivations[derivname].plugindata[this.name]) == 'undefined'){
        savedata.derivations[derivname].plugindata[this.name] = {};
    }
    if (typeof(datavalue) != 'undefined'){
        savedata.derivations[derivname].plugindata[this.name][key] = datavalue;
    } else {
        delete savedata.derivations[derivname].plugindata[this.name][key];
    }
    savestring = JSON.stringify(savedata);
    $savearea.val(savestring);
    if (this.saveajax){
        var formUrl = $('form#responseform').attr('action') + '#' + questionId;
        var $ajaxanswer = jQuery('<div class="ajaxanswer"></div>');
        var formdata = {};
        formdata['resp' + questionId.slice(1) + '_'] = savestring;
        formdata['resp' + questionId.slice(1) + '_submit'] = 'Submit';
        formdata['timeup'] = 0;
        formdata['questionids'] = questionId.slice(1);
        testilogit.ajaxresponse = jQuery.post(formUrl, formdata);
    }
}

_.getdata = function(key){
    /*********************************************
     * Get data of plugin.
     * Implementation of get depends on the context.
     *********************************************/
    if (typeof(key) != 'string'){
        return false;
    }
    switch(this.editor.context){
        case 'tiddlywiki':
            var savetiddler = QedEditor.options.TiddlyWiki.saveTiddler;
            if (typeof(this.editor.extraparams.tiddler) != 'undefined'){
                savetiddler = this.editor.extraparams.tiddler;
            }
            return this.getdataTiddly(savetiddler, key);
            break;
        case 'moodlesa':
            return this.getdataMoodleSA(key);
            break;
        case 'moodledesc':
            break;
        default:
            return 'Invalid context!';
    }
}

_.getdataTiddly = function(savetiddler, key){
    /*********************************************
     * Get data of plugin from tiddlywiki with DataTiddler-plugin
     * key: string - data key
     * savetiddler: name of datatiddler
     *********************************************/
    var derivname = this.editor.derivation.name;
    var derivation, plugindata;
// töökkö (savehere)
//     if (savetiddler != QedEditor.options.TiddlyWiki.saveTiddler){
        var emptyder = {};
        emptyder[derivname] = {
            "task": [],
            "assumption": [],
            "observation": [],
            "derivmotivation": [],
            "term": [{"text": "", "virgin": false}],
            "relation": [],
            "motivation": [],
            "check": ""
        };
        var derdata = DataTiddler.getData(savetiddler, 'derivations', emptyder);
        if (typeof(derdata[derivname]) == 'undefined'){
            derivation = emptyder[derivname];
        } else {
            derivation = derdata[derivname];
        }
// töökkö (savehere)
//     } else {
//         derivation = DataTiddler.getData(savetiddler, derivname, {"task": [], "assumption": [], "observation": [], "derivmotivation": [], "term": [{"text": "", "virgin": false}], "relation": [], "motivation": [], "check": ""});
//     }
    if (typeof(derivation.plugindata) == 'undefined'){
        plugindata = {};
    } else {
        plugindata = derivation.plugindata;
    }
    if (typeof(plugindata[this.name]) == 'undefined'){
        plugindata = {};
    } else {
        plugindata = plugindata[this.name];
    }
    return plugindata[key];
}

_.getdataMoodleSA = function(key){
    var derivname = this.editor.derivation.name;
    var derivation, plugindata;
    var questionId = this.editor.name;
    var $savearea = jQuery('#'+questionId+' .ablock input[type="text"]');
    var savestring = $savearea.val();
    var savedata = '{}';
    try {
        savedata = JSON.parse(savestring);
    } catch(err) {
        savedata = {"derivations": {}, "recycled": {}};
    }
    if (typeof(savedata.derivations) == 'undefined'){
        savedata.derivations = {};
    }
    var derivation = (typeof(savedata.derivations[derivname]) != 'undefined')?
        savedata.derivations[derivname] : {"task": [], "assumption": [], "observation": [], "derivmotivation": [], "term": [{"text": "", "virgin": false}], "relation": [], "motivation": [], "check": ""};
    if (typeof(derivation.plugindata) == 'undefined'){
        plugindata = {};
    } else {
        plugindata = derivation.plugindata;
    }
    if (typeof(plugindata[this.name]) == 'undefined'){
        plugindata = {};
    } else {
        plugindata = plugindata[this.name];
    }
    return plugindata[key];
}







/*****************************************************************************************************
 * QedPluginButton -class
 *****************************************************************************************************/
function QedPluginButton(name, iconurl, action, plugin){
    this.plugin = plugin || false;
    this.name = name;
    this.iconurl = iconurl;
    this.action = action || function(){ alert(this.name);};
}

_ = QedPluginButton.prototype;

_.html = function(){
    /*********************************************
     * Output of this plugin button
     *********************************************/
    var html = '<li class="pluginitem"><a href="javascript:" class="pluginbutton"><span><img src="'+this.iconurl+'" alt="'+this.name+'" style="height: 24px; width: auto;" />'+this.name+'</span></a></li>\n';
    return html;
}

_.use = function(plugin){
    /*********************************************
     * Return a copy of this button for given plugin
     *********************************************/
    if (typeof(plugin) == 'undefined'){
        plugin = this.plugin;
    }
    var newbutton = new QedPluginButton(this.name, this.iconurl, this.action, plugin);
    return newbutton;
}









QedEditor.plugins = [];
QedEditor.plugindata = {};
QedEditor.addPlugin = function(plugin){
    /******************************************
     * Installs new plugin in the editor
     ******************************************/
    var order = -1;
    for (var i = 0; i < QedEditor.plugindata.plugins.length ; i++){
        if (QedEditor.plugindata.plugins[i].name == plugin.name){
            order = i;
            break;
        }
    }
    if (order != -1 && typeof(plugin) != 'undefined'){
        QedEditor.plugins[order] = plugin;
    }
//     QedEditor.plugins.push(plugin);
//     QedEditor.plugindata[plugin.name] = {};
}