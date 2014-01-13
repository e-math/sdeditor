//{{{
if (typeof(config) !== 'undefined' && typeof(config.macros) !== 'undefined'){
    config.macros.mqpanel = {
        /******************************
        * Show mqpanel
        ******************************/
        handler: function (place, macroName, params, wikifier, paramString, tiddler)
        {
            if (params.length > 0 && params[0].substr(0,1) === '#'){
                var $mqplace = jQuery(params[0]);
            } else {
                wikify('<html><div id="mathquillpanel"></div></html>', place);
                var $mqplace = jQuery(place).find('#mathquillpanel');
            }
            $mqplace.mqpanel();
        }
    };
};
//}}}

//{{{
/**************************************************************
 * Button panel for Mathquill editable boxes.
 * 29.10.2012
 * Petri Salmela (pesalmel@abo.fi)
 * Petri Sallasmaa (pekasa@utu.fi)
 * E-math project ( http://emath.eu )
 **************************************************************/

(function($){
    // jQuery plugin
    $.fn.mqpanel = function(options){
        // Test for mqpanel commands and trigger command with options.
        if (typeof(options) === 'string'){
            var cmd = options;
            options = arguments[1] || {};
            if (typeof(options) === 'string'){
                options = {name: options};
            }
            // Placeholder variable for returning value.
            options.result = this;
            this.trigger(cmd, options);
            return options.result;
        }
        // Extend default settings with user given options.
        var settings = $.extend({
            theme: "default_theme",             // html class for other styling
            orientation: 'vertical',
            positionx: 0,
            positiony: 100,
            refvert: 'free',
            refhoriz: 'right',
            float: false,
            open: true
        }, options);

        // Return this so that methods of jQuery element can be chained.
        return this.each(function(){
            // Create new MqPanel object.
            var mqpanel = new MqPanel(this, settings);
        });
    }
    
    var MqPanel = function(place, settings){
        var mqpanel = this;
        this.place = $(place);
        this.islocalstorage = MqPanel.supports_html5_storage();
        this.settings = {};
        this.settings.orientation = settings.orientation;
        this.settings.positionx = settings.positionx;
        this.settings.positiony = settings.positiony;
        this.settings.refvert = settings.refvert;
        this.settings.refhoriz = settings.refhoriz;
        if (settings.float){
            this.settings.refvert = 'free';
            this.settings.refhoriz = 'free';
        }
        this.settings.iscatopen = settings.open;
        this.loadSettings();
        this.categories = [];
        this.categorymap = {};
        this.addCategories();
        this.draw();
    }
    
    MqPanel.prototype.draw = function(){
        var mqpanel = this;
        this.place.empty().addClass('mqpanel_wrapper').css('position','fixed')
            .append('<div class="mqpanel"><div class="mqpanel_handle"></div><div class="mqpanel_main"><a href="javascript:;" class="mqpanel_mainbutton"><span>&#x272a;</span></a></div><div class="mqbuttonwrapper" style="display: inline-block;">'+this.getHtml()+'<div class="mqpanelsettings"><a href="javascript:;" class="mqpanelsettings_button">&#x2699;</a></div></div></div>');
        this.panel = this.place.find('.mqpanel');
        this.content = this.place.find('.mqbuttonwrapper');
        this.settingscontainer = this.place.find('.mqpanelsettings');
        if (this.settings.iscatopen){
            this.openCategories(true);
        }
        // Add css styles if they don't exist already.
        if ($('head style#mqpanelstyle').length === 0){
            $('head').append('<style id="mqpanelstyle" type="text/css">'+MqPanel.strings['style']+'</style>');
        }
        
        // Make draggable, if jQuery-ui exists.
        if (typeof($.fn.draggable) === 'function'){
            this.place.draggable({
                disabled: true,
                handle: '.mqpanel_handle',
                snap: 'document',
                snapMode: 'inner',
                containment: 'document',
                cursor: 'move',
                stop: function(event, ui){
                    mqpanel.updateAttrs();
                }
            });
        }
        
        // Use current settings.
        this.useSettings();
        // Make sure, all attributes are applied to all elements.
        this.updateAttrs();
        
        // Init events
        this.initEvents();
    }
    
    MqPanel.prototype.initEvents = function(){
        var mqpanel = this;
        
        // addbuttons -event
        this.place.bind('addbuttons', function(e, options){
            mqpanel.addCategories(options.categories);
            mqpanel.draw();
        });
        
        // removebuttons -event
        this.place.bind('removebuttons', function(e, options){
            mqpanel.removeCategory(options.name);
            mqpanel.draw();
        });
        
        // Focusout on Mathquill-element to save "lastfocus".
        jQuery('body').delegate('.mathquill-editable', 'focusout.mqpanel', function(e){
            mqpanel.lastfocus = $(this);
        });
        // Click on elsewhere closes categories
        jQuery('html').bind('click.mqpanel', function(e){
            mqpanel.panel.find('li.mqpanelcategory.isopen a.mqpanelcatbutton').click();
        });
        // Minimize / maximize
        this.panel.find('a.mqpanel_mainbutton').click(function(e){
            var button = $(this);
            var parent = button.parents('div.mqpanel');
            if (parent.hasClass('isopen')){
                mqpanel.closeCategories();
            } else {
                mqpanel.openCategories();
            }
        });
        // Category buttons
        this.panel.find('ul.mqpanel_categories a.mqpanelcatbutton').click(function(e){
            var button = $(this);
            var parent = button.parents('li.mqpanelcategory');
            if (parent.hasClass('isopen')){
                parent.removeClass('isopen');
            } else {
                parent.siblings('li.mqpanelcategory').removeClass('isopen');
                mqpanel.panel.find('.isopen a.mqpanelsettings_button').click();
                parent.addClass('isopen');
            }
            mqpanel.lastfocus && mqpanel.lastfocus.focus();
            return false;
        });
        // LaTeX-buttons
        this.panel.find('ul.mqpanel_categories ul.mqpanel_buttons li.mqpanelbutton a').click(function(e){
            if (typeof(mqpanel.lastfocus) === 'undefined'){
                return false;
            }
            var latex = jQuery(this).attr('title');
            var has_inside = jQuery(this).attr('inside');
            var $mathquillelem = jQuery(mqpanel.lastfocus);
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
            if(selection !== ''){
                if( has_inside === '1' ){
                    $mathquillelem.mathquill('write',latex + '{'+selection + '}');
                }else if (has_inside === '2'){
                    $mathquillelem.mathquill('write',latex + '{'+selection + '}{}');
                }else if (has_inside === '('){
                    $mathquillelem.mathquill('write',latex);
                    cursor.moveLeft();
                    $mathquillelem.mathquill('write',selection);
                }else if (has_inside === '()'){
                    var parts = latex.split(' ');
                    $mathquillelem.mathquill('write',parts[0] + selection + parts[1]);
                }else{
                    $mathquillelem.mathquill('write',latex);
                }
            }else{
                $mathquillelem.mathquill('write',latex);
                if (has_inside === '(' || has_inside === '()'){
                    cursor.moveLeft();
                }
            }
            $mathquillelem.focus();
            if (cursor){
                var moves = parseInt(has_inside);
                var goright = moves < 0;
                moves = Math.abs(moves);
                for (var movement = 0; movement < moves; movement ++){
                    if (goright){
                        cursor.moveRight();
                    } else {
                        cursor.moveLeft();
                    }
                }
            }
            return false;
        });
        // Settings dialog
        this.settingscontainer.find('a.mqpanelsettings_button').click(function(e){
            mqpanel.showHideSettings();
        });
    }
    
    MqPanel.prototype.openCategories = function(fast){
        if (fast || this.settings.orientation === 'horizontal'){
            this.content.show().css('display','');
        } else {
            this.content.slideDown(200, function(){$(this).css('display','')});
        }
        this.panel.addClass('isopen');
        this.settings.iscatopen = true;
        this.saveSettings();
    }
    
    MqPanel.prototype.closeCategories = function(fast){
        var mqpanel = this;
        if (fast || this.settings.orientation === 'horizontal'){
            this.place.css({width: '', height: ''});
            this.content.hide();
        } else {
            this.content.slideUp(200, function(){mqpanel.place.css({width: '', height: ''});});
        }
        this.panel.removeClass('isopen');
        this.settings.iscatopen = false;
        this.saveSettings();
    }
    
    MqPanel.prototype.addCategories = function(data){
        if (typeof(data) === 'undefined'){
            data = MqPanel.buttonCategories;
        }
        for (var i = 0; i < data.length; i++){
            if (!(data[i].name in this.categorymap)){
                var newcat = new MqPanelCategory(data[i]);
                this.categorymap[newcat.name] = this.categories.length;
                this.categories.push(newcat);
            }
        }
    }
    
    MqPanel.prototype.removeCategory = function(name){
        if (name in this.categorymap){
            this.categories.splice(this.categorymap[name], 1);
            this.categorymap = {};
            for (var i = 0; i < this.categories.length; i++){
                this.categorymap[this.categories[i].name] = i;
            }
        }
    }
    
    MqPanel.prototype.getHtml = function(){
        var html = '<ul class="mqpanel_categories">';
        for (var i = 0; i < this.categories.length; i++){
            html += '<li class="mqpanelcategory">'+this.categories[i].getHtml()+'</li>';
        }
        html += '</ul>';
        return html;
    }
    
    MqPanel.prototype.loadSettings = function(){
        if (this.islocalstorage){
            var settings = JSON.parse(localStorage.getItem('mqpanelsettings') || '{}');
            jQuery.extend(true, this.settings, settings);
        }
    }

    MqPanel.prototype.saveSettings = function(){
        if (this.islocalstorage){
            localStorage.setItem('mqpanelsettings', JSON.stringify(this.settings));
        }
    }
    
    MqPanel.prototype.showHideSettings = function(){
        if (this.settingscontainer.hasClass('isopen')){
            this.settingscontainer.removeClass('isopen').find('.mqpanel_settingsselector').remove();
        } else {
            var mqpanel = this;
            var html = '<div class="mqpanel_settingsselector">';
            html += '<table class="mqpanel_position"><tbody>';
            html += '<tr><td><a href="javascript:;" settings="refvert refhoriz" values="top left"><span>&#x25f0;</span></a><td><td><a href="javascript:;" settings="refvert refhoriz orientation" values="top free horizontal"><span>&#x2b12;</span></a><td><td><a href="javascript:;" settings="refvert refhoriz" values="top right"><span>&#x25f3;</span></a><td></tr>';
            html += '<tr><td><a href="javascript:;" settings="refvert refhoriz orientation" values="free left vertical"><span>&#x25e7;</span></a><td><td><a href="javascript:;" settings="refvert refhoriz" values="free free"><span>&#x25a3;</span></a><td><td><a href="javascript:;" settings="refvert refhoriz orientation" values="free right vertical"><span>&#x25e8;</span></a><td></tr>';
            html += '<tr><td><a href="javascript:;" settings="refvert refhoriz" values="bottom left"><span>&#x25f1;</span></a><td><td><a href="javascript:;" settings="refvert refhoriz orientation" values="bottom free horizontal"><span>&#x2b13;</span></a><td><td><a href="javascript:;" settings="refvert refhoriz" values="bottom right"><span>&#x25f2;</span></a><td></tr>';
            html += '</tbody></table>';
            html += '<ul class="mqpanel_orientation"><li><a href="javascript:;" settings="orientation" values="horizontal">&#x2194;</a></li><li><a href="javascript:;" settings="orientation" values="vertical">&#x2195;</a></li></ul>';
            html += '</div>';
            this.settingscontainer.addClass('isopen').append(html);
            this.settingscontainer.find('.mqpanel_position a, .mqpanel_orientation a').click(function(e){
                var button = $(this);
                var settings = button.attr('settings').split(' ');
                var values = button.attr('values').split(' ');
                for (var i = 0; i < settings.length; i++){
                    mqpanel.settings[settings[i]] = values[i];
                }
                mqpanel.saveSettings();
                mqpanel.useSettings();
                mqpanel.updateAttrs();
                var posx = mqpanel.place.position().left;
                var posy = mqpanel.place.position().top;
                var panheight = mqpanel.place.height() + parseInt(mqpanel.place.css('margin-top')) + parseInt(mqpanel.place.css('margin-bottom'));
                var panwidth = mqpanel.place.width() + parseInt(mqpanel.place.css('margin-left')) + parseInt(mqpanel.place.css('margin-right'));
                if (posy + panheight > $(window).height()){
                    mqpanel.settings.positiony = $(window).height() - panheight;
                }
                if (posx + panwidth > $(window).width()){
                    mqpanel.settings.positionx = $(window).width() - panwidth;
                }
                mqpanel.saveSettings();
                mqpanel.useSettings();
                mqpanel.settingscontainer.find('a.mqpanelsettings_button').click();
            });
        }
    }
    
    MqPanel.prototype.useSettings = function(){
        this.place.attr('refvert', this.settings.refvert);
        this.place.attr('refhoriz', this.settings.refhoriz);
        this.place.attr('orientation', this.settings.orientation);
        this.place.css({width: '', height: '', top: 0, left: 0, bottom: 'auto', right: 'auto'});
        var width = this.place.width();
        var height = this.place.height();
        this.place.css({top: '', left: '', bottom: '', right: ''});
        if (this.settings.refvert === 'free' && this.settings.refhoriz === 'free'){
            this.place.draggable('option', 'disabled', false).draggable('option', 'axis', false);
            this.place.css({'top': this.settings.positiony, 'left': this.settings.positionx});
        } else if (this.settings.refvert === 'free'){
            this.place.draggable('option', 'disabled', false).draggable('option', 'axis', 'y');
            this.place.css({'top': this.settings.positiony, 'left': '', 'right': ''});
        } else if (this.settings.refhoriz === 'free'){
            this.place.draggable('option', 'disabled', false).draggable('option', 'axis', 'x');
            this.place.css({'top': '', 'bottom': '', 'left': this.settings.positionx});
        } else {
            this.place.draggable('option', 'disabled', true).draggable('option', 'axis', false);
            this.place.css({'top': '', 'bottom': '', 'left': '', 'right': ''});
        }
        if (!(height > $(document).height() && width > 300)){
            this.place.css({width: width+'px', height: height+'px'});
        }
    }
    
    MqPanel.prototype.updateAttrs = function(){
        var mqpanel = this;
        if (mqpanel.place.is(':visible')){
            var pos = mqpanel.place.position();
            mqpanel.settings.positionx = pos.left;
            mqpanel.settings.positiony = pos.top;
            mqpanel.saveSettings();
        }
        if (mqpanel.settings.positiony > $(window).height() / 2){
            mqpanel.place.attr('verthalf','bottom');
        } else {
            mqpanel.place.attr('verthalf','top');
        }
        if (mqpanel.settings.positionx > $(window).width() / 2){
            mqpanel.place.attr('horizhalf','right');
        } else {
            mqpanel.place.attr('horizhalf','left');
        }
        if (mqpanel.settings.orientation === 'horizontal'){
            mqpanel.place.find('.mqbuttonwrapper').css('display','');
        }
    }
    

    /**********************************************************
     * Strings: css-styles etc.
     **********************************************************/
    
    MqPanel.strings = {
        style: '/* Hide mathpanel of sdeditor*/'
            +'#mathbuttonwrapper #mathbuttonpanel {display: none;}'
            +'.mqpanel_wrapper ul.mqpanel_categories li.mqpanelcategory ul.mqpanel_buttons, .mqpanel_wrapper .mqpanelsettings .mqpanel_settingsselector,'
                    +'.mqpanel_wrapper .mqpanel {border-radius: 6px; box-shadow: 3px 3px 8px rgba(0,0,0,0.5); border: 1px solid #1ACEFA;'
                    +'background: rgb(214,249,255); /* Old browsers */'
                    +'background: -moz-linear-gradient(top,  rgba(214,249,255,1) 0%, rgba(158,232,250,1) 100%); /* FF3.6+ */'
                    +'background: -webkit-gradient(linear, left top, left bottom, color-stop(0%,rgba(214,249,255,1)), color-stop(100%,rgba(158,232,250,1))); /* Chrome,Safari4+ */'
                    +'background: -webkit-linear-gradient(top,  rgba(214,249,255,1) 0%,rgba(158,232,250,1) 100%); /* Chrome10+,Safari5.1+ */'
                    +'background: -o-linear-gradient(top,  rgba(214,249,255,1) 0%,rgba(158,232,250,1) 100%); /* Opera 11.10+ */'
                    +'background: -ms-linear-gradient(top,  rgba(214,249,255,1) 0%,rgba(158,232,250,1) 100%); /* IE10+ */'
                    +'background: linear-gradient(to bottom,  rgba(214,249,255,1) 0%,rgba(158,232,250,1) 100%); /* W3C */'
                    +'filter: progid:DXImageTransform.Microsoft.gradient( startColorstr=\'#d6f9ff\', endColorstr=\'#9ee8fa\',GradientType=0 ); /* IE6-9 */'
                    +'}'
            +'.mqpanel_wrapper {position: fixed; z-index: 201; font-size: 20px;}'
            +'.mqpanel_wrapper.ui-state-disabled {opacity: 1;}'
            +'.mqpanel_wrapper a:hover {background-color: transparent;}'
            +'.mqpanel_wrapper[refvert="top"] {top: 0;}'
            +'.mqpanel_wrapper[refvert="bottom"] {bottom: 0;}'
            +'.mqpanel_wrapper[refhoriz="left"] {left: 0;}'
            +'.mqpanel_wrapper[refhoriz="right"] {right: 0;}'
            +'.mqpanel_wrapper .mqpanel_handle {min-height: 15px; min-width: 15px; background: #faa; border-radius: 6px 6px 0 0; cursor: move;}'
            +'.mqpanel_wrapper .mqpanel {padding: 0; padding-bottom: 10px; white-space: nowrap;}'
            +'.mqpanel_wrapper .mqpanel a {text-decoration: none; color: blue; text-shadow: 2px 2px 1px white;}'
            +'.mqpanel_wrapper .mqpanel a.mqpanel_mainbutton {display: block; height: 30px; min-width: 40px; text-align: center; line-height: 30px;}'
            +'.mqpanel_wrapper .mqpanel_main {border-bottom: 1px solid #1ACEFA; margin: 0 4px;}'
            +'.mqpanel_wrapper .mqpanel a.mqpanel_mainbutton span {vertical-align: middle;}'
            +'.mqpanel_wrapper ul.mqpanel_categories {display: none; list-style: none; margin: 0 4px; padding: 0;}'
            +'.mqpanel_wrapper .mqpanel.isopen ul.mqpanel_categories {display: block; list-style: none; margin: 0 4px; padding: 0;}'
            +'.mqpanel_wrapper ul.mqpanel_categories li.mqpanelcategory {margin: 0; position: relative; text-align: center; padding: 2px; border-bottom: 1px solid #1ACEFA; border-top: 1px solid white;}'
            +'.mqpanel_wrapper ul.mqpanel_categories li.mqpanelcategory.isopen a.mqpanelcatbutton,'
            +'.mqpanel_wrapper ul.mqpanel_categories li.mqpanelcategory.isopen:hover a.mqpanelcatbutton {border-radius: 6px; border: 1px solid red; box-shadow: inset 0 0 10px rgba(255,0,0,0.5); background: white;}'
            +'.mqpanel_wrapper ul.mqpanel_categories li.mqpanelcategory:hover a.mqpanelcatbutton {border: 1px solid white;}'
            +'.mqpanel_wrapper ul.mqpanel_categories li.mqpanelcategory a.mqpanelcatbutton {display: block; width: 30px; height: 30px; line-height: 30px; border: 1px solid transparent; border-radius: 6px;}'
            +'.mqpanel_wrapper ul.mqpanel_categories li.mqpanelcategory a.mqpanelcatbutton span {vertical-align: middle;}'
            +'.mqpanel_wrapper ul.mqpanel_categories li.mqpanelcategory ul.mqpanel_buttons {position: absolute; left: 35px; top: 0; text-align: left; display: none; list-style: none; width: 78px; margin: 0; padding: 0; border-radius: 6px; white-space: normal;}'
            +'.mqpanel_wrapper ul.mqpanel_categories li.mqpanelcategory.isopen ul.mqpanel_buttons {display: block;}'
            +'.mqpanel_wrapper ul.mqpanel_categories ul.mqpanel_buttons li.mqpanelbutton {display: inline-block; width: 40px; height: 30px; margin: 0; padding: 0; padding: 2px; border-radius: 4px; border: 1px solid transparent; text-align: center; line-height: 30px;}'
            +'.mqpanel_wrapper ul.mqpanel_categories ul.mqpanel_buttons li.mqpanelbutton:hover {border: 1px solid white;}'
            +'.mqpanel_wrapper ul.mqpanel_categories ul.mqpanel_buttons li.mqpanelbutton a {display: block;}'
            +'.mqpanel_wrapper a.mqpanelsettings_button {display: block; height: 30px; width: 30px; margin: 0 auto; text-align: center; line-height: 30px; vertical-align: middle; border-radius: 6px; border: 1px solid transparent;}'
            +'.mqpanel_wrapper a.mqpanelsettings_button:hover {border: 1px solid white;}'
            +'.mqpanel_wrapper .mqpanelsettings {position: relative; border-top: 1px solid white; margin: 0 4px; padding: 2px;}'
            +'.mqpanel_wrapper .mqpanelsettings.isopen .mqpanelsettings_button {border: 1px solid red; box-shadow: inset 0 0 10px rgba(255,0,0,0.5); background: white;}'
            +'.mqpanel_wrapper .mqpanel_settingsselector {position: absolute; left: 40px; bottom: 0; text-align: left; margin: 0; padding: 0; border-radius: 6px;}'
            +'.mqpanel_wrapper[refhoriz="left"] .mqpanel_settingsselector {left: 40px; right: auto; bottom: 0; top: auto;}'
            +'.mqpanel_wrapper[refhoriz="right"] .mqpanel_settingsselector {left: auto; right: 40px; bottom: 0; top: auto;}'
            +'.mqpanel_wrapper[refhoriz="right"] li.mqpanelcategory.isopen ul.mqpanel_buttons {left: auto; right: 40px;}'
            +'.mqpanel_wrapper[refvert="top"] .mqpanel_settingsselector {top: auto; bottom: 0;}'
            +'.mqpanel_wrapper[refvert="bottom"] .mqpanel_settingsselector {top: auto; bottom: 0;}'
            +'.mqpanel_wrapper[orientation="horizontal"] .mqpanel_handle {display: block; border-radius: 6px 0 0 6px; margin: 1px; position: absolute; left:0; top: 0; bottom: 0;}'
            +'.mqpanel_wrapper[refvert="bottom"] .mqpanel_handle {border-radius: 6px 0 0 0;}'
            +'.mqpanel_wrapper[refvert="top"] .mqpanel_handle {border-radius: 0 0 0 6px;}'
            +'.mqpanel_wrapper[refhoriz="left"] .mqpanel_handle {border-radius: 0 6px 0 0;}'
            +'.mqpanel_wrapper[refhoriz="right"] .mqpanel_handle {border-radius: 6px 0 0 0;}'
            +'.mqpanel_wrapper[refvert="top"][refhoriz="left"] .mqpanel_handle, .mqpanel_wrapper[refvert="top"][refhoriz="right"] .mqpanel_handle, .mqpanel_wrapper[refvert="bottom"][refhoriz="left"] .mqpanel_handle, .mqpanel_wrapper[refvert="bottom"][refhoriz="right"] .mqpanel_handle {display: none;}'
            +'.mqpanel_wrapper[refvert="top"][refhoriz="left"] .mqpanel_main, .mqpanel_wrapper[refvert="top"][refhoriz="right"] .mqpanel_main, .mqpanel_wrapper[refvert="bottom"][refhoriz="left"] .mqpanel_main, .mqpanel_wrapper[refvert="bottom"][refhoriz="right"] .mqpanel_main {margin-left: 0;}'
            +'.mqpanel_wrapper[orientation="horizontal"] .mqpanel {padding-right: 10px; padding-bottom: 0;}'
            +'.mqpanel_wrapper[orientation="horizontal"] .mqpanel_main {display: inline-block; margin: 2px 0 2px 15px; border-right: 1px solid #1ACEFA; border-bottom: none;}'
            +'.mqpanel_wrapper[orientation="horizontal"] .mqbuttonwrapper {display: inline-block; margin: 0;}'
            +'.mqpanel_wrapper[orientation="horizontal"] .mqbuttonwrapper ul.mqpanel_categories {display: inline-block; margin: 0;}'
            +'.mqpanel_wrapper[orientation="horizontal"] .mqbuttonwrapper ul.mqpanel_categories li.mqpanelcategory {display: inline-block; padding: 0 4px; border-right: 1px solid #1ACEFA; border-left: 1px solid white; border-top: none; border-bottom: none; border-radius: 0; margin: 2px 0;}'
            +'.mqpanel_wrapper[orientation="horizontal"] .mqpanelsettings {display: inline-block; border-left: 1px solid white; border-top: none; padding-left: 4px; margin: 4px 0;}'
            +'.mqpanel_wrapper[orientation="horizontal"][verthalf="bottom"] .mqpanel_settingsselector {top: auto; bottom: 36px;}'
            +'.mqpanel_wrapper[orientation="horizontal"] ul.mqpanel_categories li.mqpanelcategory.isopen ul.mqpanel_buttons {top: 36px; bottom: auto;}'
            +'.mqpanel_wrapper[orientation="horizontal"] .mqpanel_settingsselector {top: 36px; bottom: auto; left: auto; right: 0;}'
            +'.mqpanel_wrapper[orientation="horizontal"][refvert="top"] .mqpanel_settingsselector {top: 36px; left: auto; right: 0; bottom: auto;}'
            +'.mqpanel_wrapper[orientation="horizontal"][refvert="bottom"] .mqpanel_settingsselector {top: auto; bottom: 40px; left: auto; right: 0;}'
            +'.mqpanel_wrapper ul.mqpanel_categories li.mqpanelcategory ul.mqpanel_buttons, .mqpanel_wrapper .mqpanelsettings .mqpanel_settingsselector {z-index: 21;}'
            +'.mqpanel_wrapper[orientation="vertical"][verthalf="bottom"] ul.mqpanel_categories li.mqpanelcategory.isopen ul.mqpanel_buttons {top: auto; bottom: 0;}'
            +'.mqpanel_wrapper[orientation="vertical"][horizhalf="right"] ul.mqpanel_categories li.mqpanelcategory.isopen ul.mqpanel_buttons {left: auto; right: 36px;}'
            +'.mqpanel_wrapper[orientation="vertical"][horizhalf="right"] .mqpanel_settingsselector {left: auto; right: 40px;}'
            +'.mqpanel_wrapper[orientation="horizontal"][verthalf="bottom"] ul.mqpanel_categories li.mqpanelcategory.isopen ul.mqpanel_buttons {top: auto; bottom: 36px;}'
            +'.mqpanel_wrapper[orientation="horizontal"][horizhalf="right"] ul.mqpanel_categories li.mqpanelcategory.isopen ul.mqpanel_buttons {left: auto; right: 0;}'
            +'.mqpanel_wrapper[orientation="horizontal"][verthalf="bottom"] .mqpanel_settingsselector {top: auto; bottom: 36px;}'
            +'.mqpanel_wrapper[orientation="horizontal"][horizhalf="right"] .mqpanel_settingsselector {left: auto; right: 0;}'
            +'.mqpanel_wrapper[refhoriz="left"] .mqpanel {border-radius: 0 6px 6px 0; box-shadow: 3px 3px 8px rgba(0,0,0,0.5);}'
            +'.mqpanel_wrapper[refhoriz="right"] .mqpanel {border-radius: 6px 0 0 6px; box-shadow: -3px 3px 8px rgba(0,0,0,0.5);}'
            +'.mqpanel_wrapper[refvert="top"] .mqpanel {border-radius: 0 0 6px 6px; box-shadow: 3px 3px 8px rgba(0,0,0,0.5);}'
            +'.mqpanel_wrapper[refvert="bottom"] .mqpanel {border-radius: 6px 6px 0 0; box-shadow: 3px -3px 8px rgba(0,0,0,0.5);}'
            +'.mqpanel_wrapper[refhoriz="right"] .mqpanel_settingsselector {box-shadow: -3px 3px 8px rgba(0,0,0,0.5);}'
            +'.mqpanel_wrapper[refvert="bottom"] .mqpanel_settingsselector {box-shadow: 3px -3px 8px rgba(0,0,0,0.5);}'
            +'.mqpanel_wrapper ul.mqpanel_orientation {list-style: none; text-align: center; font-size: 110%; font-weight: bold; margin: 0; padding: 0; border-top: 1px solid #1ACEFA;}'
            +'.mqpanel_wrapper ul.mqpanel_orientation li {display: inline-block; padding: 0 4px; margin: 2px;}'
            +'.mqpanel_wrapper ul.mqpanel_orientation li a {display: block;}'
            +'.mqpanel_wrapper[orientation="horizontal"] ul.mqpanel_orientation a[values="horizontal"], .mqpanel_wrapper[orientation="vertical"] ul.mqpanel_orientation a[values="vertical"],'
                +'.mqpanel_wrapper[refvert="top"][refhoriz="left"] .mqpanel_position a[values="top left"],'
                +'.mqpanel_wrapper[refvert="top"][refhoriz="free"] .mqpanel_position a[values="top free horizontal"],'
                +'.mqpanel_wrapper[refvert="top"][refhoriz="right"] .mqpanel_position a[values="top right"],'
                +'.mqpanel_wrapper[refvert="free"][refhoriz="left"] .mqpanel_position a[values="free left vertical"],'
                +'.mqpanel_wrapper[refvert="free"][refhoriz="free"] .mqpanel_position a[values="free free"],'
                +'.mqpanel_wrapper[refvert="free"][refhoriz="right"] .mqpanel_position a[values="free right vertical"],'
                +'.mqpanel_wrapper[refvert="bottom"][refhoriz="left"] .mqpanel_position a[values="bottom left"],'
                +'.mqpanel_wrapper[refvert="bottom"][refhoriz="free"] .mqpanel_position a[values="bottom free horizontal"],'
                +'.mqpanel_wrapper[refvert="bottom"][refhoriz="right"] .mqpanel_position a[values="bottom right"]'
                +'{color: red;}'
            +'.mqpanel_wrapper[refvert="bottom"][refhoriz="free"] ul.mqpanel_orientation, .mqpanel_wrapper[refvert="top"][refhoriz="free"] ul.mqpanel_orientation, .mqpanel_wrapper[refvert="free"][refhoriz="left"] ul.mqpanel_orientation, .mqpanel_wrapper[refvert="free"][refhoriz="right"] ul.mqpanel_orientation {display: none;}'
    }
    
    
    /*******************************************************
     * Button category
     *******************************************************/
    
    var MqPanelCategory = function(data){
        if (!data.name || !data.icon || typeof(data.elements) === 'undefined' || typeof(data.elements.length) !== 'number'){
            return false;
        }
        this.name = data.name;
        this.icon = data.icon;
        this.icontype = (data.icon.substr(0,5) === 'data:' ? 'data' : (data.icon.substr(0,5) === 'file:' || data.icon.substr(0,5) === 'http:' ? 'image' : 'text'));
        this.buttons = [];
        for (var i = 0; i < data.elements.length; i++){
            var newbutton = new MqPanelButton(data.elements[i]);
            this.buttons.push(newbutton);
        }
    }
    
    MqPanelCategory.prototype.getHtml = function(){
        var style, text;
        var width = Math.ceil(Math.sqrt(this.buttons.length)) * 46;
        switch (this.icontype){
            case 'data':
            case 'image':
                style = 'background-image: url(' + this.icon + ');';
                text = '';
                break;
            case 'text':
                style = '';
                text = this.icon;
                break;
            default:
                style = '';
                text = 'C';
        }
        var html = '<a href="javascript:;" class="mqpanelcatbutton" style="'+style+'" title="'+this.name+'"><span>'+text+'</span></a>';
        html += '<ul class="mqpanel_buttons" style="width: '+width+'px;">';
        for (var i = 0; i < this.buttons.length; i++){
            html += '<li class="mqpanelbutton">' + this.buttons[i].getHtml() + '</li>';
        }
        html += '</ul>';
        return html;
    }
    
    /*******************************************************
     * Button
     *******************************************************/
    
    var MqPanelButton = function(data){
        if (!data.name || !data.icon || !data.latex){
            return false;
        }
        this.name = data.name;
        this.icon = data.icon;
        this.icontype = (data.icon.substr(0,5) === 'data:' ? 'data' : (data.icon.substr(0,5) === 'file:' || data.icon.substr(0,5) === 'http:' ? 'image' : 'text'));
        this.latex = data.latex;
        this.inside = data.inside || '';
        this.style = data.style || '';
    }
    
    MqPanelButton.prototype.getLatex = function(){
        return this.latex;
    }
    
    MqPanelButton.prototype.getHtml = function(){
        var style, text;
        switch (this.icontype){
            case 'data':
            case 'image':
                style = 'background-image: url(' + this.icon + ');';
                text = '';
                break;
            case 'text':
                style = (this.style === 'small' ? 'font-size: 75%;' : '');
                text = this.icon;
                break;
            default:
                style = '';
                text = 'B';
        }
        return '<a href="javascript:;" style="'+style+'" title="'+this.latex+'"'+ (this.inside ? ' inside="'+this.inside+'"' : '')+'>'+text+'</a>';
    }
    

    
    MqPanel.supports_html5_storage = function() {
        try {
            return 'localStorage' in window && window['localStorage'] !== null;
        } catch (e) {
            return false;
        }
    }
    
    MqPanel.buttonCategories = [
        {
        'name' : 'relations',
        'icon' : '&hArr;',
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
        'icon' : '<i>x</i><sup>2</sup>',
        'elements' : [
            {
                'name' : 'frac',
                'latex' : '\\frac ',
                'icon' : '/',
                'inside': '2'
            },
            {
                'name' : 'centerdot',
                'latex' : '\\cdot ',
                'icon' : '&sdot;'
            },
            {
                'name' : 'sqroot',
                'latex' : '\\sqrt ',
                'icon' : '&radic;',
                'inside' : '1'
            },
            {
                'name' : '3rdroot',
                'latex' : '\\nthroot 3',
                'icon' : '&#x221b;',
                'inside' : '1'
            },
            {
                'name' : 'nthroot',
                'latex' : '\\nthroot ',
                'icon' : '<sup>n</sup>&radic;',
                'inside' : '2'
            },
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
                'name' : 'bar',
                'latex' : '\\bar  ',
                'icon' : '<span style="border-top: 2px solid red;">X</span>',
                'inside': '1'
            },
            {
                'name' : 'underline',
                'latex' : '\\underline  ',
                'icon' : '<span style="border-bottom: 2px solid red;">X</span>',
                'inside': '1'
            },
            {
                'name' : 'isin',
                'latex' : '\\in ',
                'icon' : '&isin;'
            },
            {
                'name' : 'notin',
                'latex' : '\\notin ',
                'icon' : '&notin;'
            },
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
            },
            {
                'name' : 'minusplus',
                'latex' : '\\mp ',
                'icon' : '&#x2213;'
            },
            {
                'name' : 'pipe',
                'latex' : '\\mid ',
                'icon' : '|'
            },
            {
                'name' : 'integral',
                'latex' : '\\int ',
                'icon' : '&int;'
            },
            {
                'name' : 'defined integral',
                'latex' : '\\int_{}^{} ',
                'icon' : '&int;<sub style="position: relative; bottom: -0.4em; left: -0.2em;"><sub>0</sub></sub><sup style="position: relative; left: -0.5em; top: -0.2em;"><sub>1</sub></sup>',
                'inside': '3'
            },
            {
                'name' : 'sum',
                'latex' : '\\sum ',
                'icon' : '&Sigma;'
            },
            {
                'name' : 'sum',
                'latex' : '\\sum_{}^{} ',
                'icon' : '&Sigma;<sup style="position: relative; top: 0.2em;"><sup>n</sup></sup><sub style="position: relative; left: -0.5em;"><sub>i=0</sub></sub>',
                'inside': '3'
            }
        ]
        },
        {
        'name' : 'numberfields',
        'icon' : '&#x2115;',
        'elements' : [
            {
                'name' : 'natural',
                'latex' : '\\NN ',
                'icon' : '&#x2115;'
            },
            {
                'name' : 'integer',
                'latex' : '\\ZZ ',
                'icon' : '&#x2124;'
            },
            {
                'name' : 'posintegers',
                'latex' : '\\ZZ_+ ',
                'icon' : '&#x2124;<sub>+</sub>'
            },
            {
                'name' : 'negintegers',
                'latex' : '\\ZZ_- ',
                'icon' : '&#x2124;<sub>-</sub>'
            },
            {
                'name' : 'rational',
                'latex' : '\\QQ ',
                'icon' : '&#x211a;'
            },
            {
                'name' : 'real',
                'latex' : '\\RR ',
                'icon' : '&#x211d;'
            },
            {
                'name' : 'posreal',
                'latex' : '\\RR_+ ',
                'icon' : '&#x211d;<sub>+</sub>'
            },
            {
                'name' : 'negreal',
                'latex' : '\\RR_- ',
                'icon' : '&#x211d;<sub>-</sub>'
            }
        ]
        },
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
    },
    {
        'name' : 'brackets',
        'icon' : '{ }',
        'elements' : [
            {
                'name' : 'parentheses',
                'latex' : '\\left( ',
                'icon' : '(&nbsp;)',
                'inside': '('
            },
            {
                'name' : 'square brackets',
                'latex' : '\\left[ ',
                'icon' : '[&nbsp;]',
                'inside': '('
            },
            {
                'name' : 'curly brackets',
                'latex' : '\\left{ ',
                'icon' : '{&nbsp;}',
                'inside': '('
            },
            {
                'name' : 'chevrons',
                'latex' : '\\langle ',
                'icon' : '&#x2329;&nbsp;&#x232a;',
                'inside': '('
            },
            {
                'name' : 'absolute value',
                'latex' : '\\left| ',
                'icon' : '|&nbsp;|',
                'inside': '('
            },
            {
                'name' : 'floor',
                'latex' : '\\lfloor \\rfloor',
                'icon' : '&lfloor;&nbsp;&rfloor;',
                'inside': '()'
            },
            {
                'name' : 'ceiling',
                'latex' : '\\lceil \\rceil',
                'icon' : '&lceil;&nbsp;&rceil;',
                'inside': '()'
            }
        ]
    },
    {
        'name' : 'functions',
        'icon' : '<i>f</i>(<i>x</i>)',
        'elements' : [
            {
                'name' : 'sin',
                'latex' : '\\sin \\left( ',
                'icon' : 'sin',
                'inside': '(',
                'style': 'small'
            },
            {
                'name' : 'cos',
                'latex' : '\\cos \\left( ',
                'icon' : 'cos',
                'inside': '(',
                'style': 'small'
            },
            {
                'name' : 'tan',
                'latex' : '\\tan \\left( ',
                'icon' : 'tan',
                'inside': '(',
                'style': 'small'
            },
            {
                'name' : 'arcsin',
                'latex' : '\\arcsin \\left( ',
                'icon' : 'asin',
                'inside': '(',
                'style': 'small'
            },
            {
                'name' : 'arccos',
                'latex' : '\\arccos \\left( ',
                'icon' : 'acos',
                'inside': '(',
                'style': 'small'
            },
            {
                'name' : 'arctan',
                'latex' : '\\arctan \\left( ',
                'icon' : 'atan',
                'inside': '(',
                'style': 'small'
            },
            {
                'name' : 'ln',
                'latex' : '\\ln \\left( ',
                'icon' : 'ln',
                'inside': '(',
                'style': 'small'
            },
            {
                'name' : 'lg',
                'latex' : '\\lg \\left( ',
                'icon' : 'lg',
                'inside': '(',
                'style': 'small'
            },
            {
                'name' : 'log',
                'latex' : '\\log \\left( ',
                'icon' : 'log',
                'inside': '(',
                'style': 'small'
            },
            {
                'name' : 'min',
                'latex' : '\\min \\left( ',
                'icon' : 'min',
                'inside': '(',
                'style': 'small'
            },
            {
                'name' : 'max',
                'latex' : '\\max \\left( ',
                'icon' : 'max',
                'inside': '(',
                'style': 'small'
            }
        ]
    },
    {
        'name' : 'dots',
        'icon' : '...',
        'elements' : [
            {
                'name' : 'dots',
                'latex' : '\\dots ',
                'icon' : '&#x2026;'
            },
            {
                'name' : 'cdots',
                'latex' : '\\cdots ',
                'icon' : '&#x22ef;'
            },
            {
                'name' : 'vdots',
                'latex' : '\\vdots ',
                'icon' : '&#x22ee;'
            },
            {
                'name' : 'ddots',
                'latex' : '\\ddots ',
                'icon' : '&#x22f0;'
            }
        ]
    },
    {
        'name' : 'sets',
        'icon' : '&#x2286;',
        'elements' : [
            {
                'name' : 'subset',
                'latex' : '\\subset ',
                'icon' : '&#x2282;'
            },
            {
                'name' : 'supset',
                'latex' : '\\supset ',
                'icon' : '&#x2283;'
            },
            {
                'name' : 'subseteq',
                'latex' : '\\subseteq ',
                'icon' : '&#x2286;'
            },
            {
                'name' : 'supseteq',
                'latex' : '\\supseteq ',
                'icon' : '&#x2287;'
            },
            {
                'name' : 'union',
                'latex' : '\\cup ',
                'icon' : '&#x222a;'
            },
            {
                'name' : 'intersection',
                'latex' : '\\cap ',
                'icon' : '&#x2229;'
            }
        ]
    },
    {
        'name' : 'arrows',
        'icon' : '&#x21d1;',
        'elements' : [
            {
                'name' : 'leftarrow',
                'latex' : '\\leftarrow ',
                'icon' : '&#x2190;'
            },
            {
                'name' : 'rightarrow',
                'latex' : '\\rightarrow ',
                'icon' : '&#x2192;'
            },
            {
                'name' : 'uparrow',
                'latex' : '\\uparrow ',
                'icon' : '&#x2191;'
            },
            {
                'name' : 'downarrow',
                'latex' : '\\downarrow ',
                'icon' : '&#x2193;'
            },
            {
                'name' : 'Leftarrow',
                'latex' : '\\Leftarrow ',
                'icon' : '&#x21d0;'
            },
            {
                'name' : 'Rightarrow',
                'latex' : '\\Rightarrow ',
                'icon' : '&#x21d2;'
            },
            {
                'name' : 'Uparrow',
                'latex' : '\\Uparrow ',
                'icon' : '&#x21d1;'
            },
            {
                'name' : 'Downarrow',
                'latex' : '\\Downarrow ',
                'icon' : '&#x21d3;'
            },
            {
                'name' : 'updownarrow',
                'latex' : '\\updownarrow ',
                'icon' : '&#x2195;'
            },
            {
                'name' : 'leftrightarrow',
                'latex' : '\\leftrightarrow ',
                'icon' : '&#x2194;'
            },
            {
                'name' : 'Updownarrow',
                'latex' : '\\Updownarrow ',
                'icon' : '&#x21d5;'
            },
            {
                'name' : 'Leftrightarrow',
                'latex' : '\\Leftrightarrow ',
                'icon' : '&#x21d4;'
            },
            {
                'name' : 'nwarrow',
                'latex' : '\\nwarrow ',
                'icon' : '&#x2196;'
            },
            {
                'name' : 'nearrow',
                'latex' : '\\nearrow ',
                'icon' : '&#x2197;'
            },
            {
                'name' : 'searrow',
                'latex' : '\\searrow ',
                'icon' : '&#x2198;'
            },
            {
                'name' : 'swarrow',
                'latex' : '\\swarrow ',
                'icon' : '&#x2199;'
            }
        ]
    }];

})(jQuery)
//}}}