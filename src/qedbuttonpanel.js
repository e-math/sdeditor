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

