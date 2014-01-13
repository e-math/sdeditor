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


