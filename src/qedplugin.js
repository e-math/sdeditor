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