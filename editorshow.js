jQuery(function(){
    
    if (typeof(Storage) !== 'undefined') {
        var saveLocal = function(data){
            localStorage.derivationStorage = JSON.stringify(data);
        }
        
        var loadLocal = function(){
            return JSON.parse(localStorage.derivationStorage);
        }
        
        var saveData = function(){
            allderivations = JSON.parse(jQuery('.ablock input').val());
            saveLocal(allderivations);
        }
        
        var findNewName = function(){
            var i = 1;
            while ('derivation'+i in allderivations.derivations) {
                i++;
            }
            return 'derivation'+i;
        }

        if (typeof(localStorage.derivationStorage) === 'undefined') {
            saveLocal({"derivations":{}});
        }
        window.allderivations = loadLocal();
        jQuery('.ablock input').val(JSON.stringify(allderivations))
            .change(function(){
                saveData();
                //allderivations = JSON.parse(jQuery(this).val());
                //saveLocal(allderivations);
            });
        
        jQuery('#itemlist a#control-save').click(function(){
            window.editor.save();
            saveData();
        });
        jQuery('#itemlist a#control-addnew').click(function(){
            var oldname = window.editor.derivation.name;
            var newname = findNewName();
            jQuery('#'+oldname).attr('id',newname);
            window.editor.open(newname);
            window.editor.edit();
            var $derivlist = jQuery('#itemlist ul#derivlist');
            $derivlist.find('li a').removeClass('current');
            $derivlist.append('<li class="derivitem" id="derivitem-'+newname+'"><a href="javascript:;" class="current" derivname="'+newname+'">Päättelyketju '+($derivlist.find('li').length+1)+'</a></li>');
            $derivlist.find('li.derivitem a').last().click(function(){
                jQuery('li.derivitem a').removeClass('current');
                jQuery(this).addClass('current');
                var openname = jQuery(this).attr('derivname');
                var oldname = jQuery('.ablock').parent('div').attr('id');
                jQuery('#'+oldname).attr('id',openname);
                //window.editor.open(openname);
                $place = jQuery('.box').empty();
                window.editor = new QedEditor(openname, $place, 'moodlesa', {});
                window.editor.edit();
                jQuery('.box .mathquill-editable textarea').bind('blur.editorshow', function(){
                    editor.save();
                    jQuery('.ablock input').trigger('change');
                    saveData();
                })
            });
            jQuery('.box .mathquill-editable textarea').bind('focusout.editorshow', function(){
                editor.save();
                jQuery('.ablock input').trigger('change');
            })
        })
        
        var $derivlist = jQuery('#itemlist ul#derivlist');
        var num = 1;
        for (var deriv in allderivations.derivations) {
            $derivlist.append('<li class="derivitem" id="derivitem-'+deriv+'"><a href="javascript:;"'+(num === 1? 'class="current"':'')+' derivname="'+deriv+'">Päättelyketju '+num+'</a></li>');
            num++;
            $derivlist.find('li.derivitem a').last().click(function(){
                jQuery('li.derivitem a').removeClass('current');
                jQuery(this).addClass('current');
                var openname = jQuery(this).attr('derivname');
                var oldname = jQuery('.ablock').parent('div').attr('id');
                jQuery('#'+oldname).attr('id',openname);
                //window.editor.open(openname);
                $place = jQuery('.box').empty();
                window.editor = new QedEditor(openname, $place, 'moodlesa', {});
                window.editor.edit();
                jQuery('.box .mathquill-editable textarea').bind('blur.editorshow', function(){
                    editor.save();
                    jQuery('.ablock input').trigger('change');
                    saveData();
                })
            });
        }
        
    }

    var $place = jQuery('.box').eq(0);
    window.editor = new QedEditor('derivation1', $place, 'moodlesa', {});
    editor.edit();
    $place.find('.mathquill-editable').bind('focusout.editorshow', function(){
        jQuery('.ablock input').trigger('change');
    })
    jQuery('#mathpanel').mqpanel();

});