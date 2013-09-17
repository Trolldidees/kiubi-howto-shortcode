/**
 * jQuery Shortcode parser
 * 
 * @author Michael Hurni <michael.hurni@troll-idees.com>
 * @copyright Copyright (c) Troll d'id�es 2013. Tous droits r�serv�s.
 * @licence Beerware
 *
 * @example
 *  $.shortcode.register('h1', function( attributes ){
 *  	return $('<h1>').text(attributes.title.toUpperCase());
 *  });
 *  
 *  $(document.body).shortcode();
 *
 * remplace le shortcode h1 par un <h1> contenant la valeur de l'attribut title
 * <p>lorem ipsum [h1 title="test"] amet</p>
 * devient
 * lorem ipsum <h1>TEST</h1> amet</p>
 */

(function($){

	'use strict';
	
	var shortcodes = {};
	var validCodeRegExp = new RegExp('^[a-z0-9_:.-]+$', 'i');
	
	/**
	 * Helper permettant d'executer directement le plugin  
	 * shortcode sur l'ensemble de la page
	 * 
	 * @see $.fn.shortcode
	 * @params undefined || string || Array<string>
	 * @return jQuery $(document.body)
	 */
	$.shortcode = function(){
		return $.fn.shortcode.apply($(document.body), arguments);
	}
	
	/**
	 * M�thode permettant d'enregistrer un nouveau shortcode
	 * @param code string
	 * @param cb function
	 */
	$.shortcode.register = function(code, cb){
		
		validCodeRegExp.test(code) || $.error('Invalid shortcode name');
		$.isFunction(cb) || $.error('Invalid shortcode callback');
		
		shortcodes[code] = cb;
	}
	
	/**
	 * Proc�de au remplacement des shortcodes enregistr�s dans le  
	 * registre sur le contexte.
	 *
	 * @params undefined || string || Array<string>
	 * @return jQuery contexte
	 */
	$.fn.shortcode = function()
	{
		var context = this;
		var codes = [];
		
		if(!context.length) return context;
		
		$.each(shortcodes || {}, function(code){
			// On ajoute le code � la liste des codes � rechercher
			// si ils correspondent au param�tres d'appelle de la
			// m�thode shortcode
			if(typeof name == "string" && code != arguments[0]) return;
			if($.isArray(arguments[0]) && !$.inArray(code, arguments[0])) return;
			codes.push(code);
		});

		// si aucun type de code n'est � rechercher, on arr�te l�.
		if(!codes.length) return this;
		
		// On initialise la pile de noeuds � parser avec le contexte.
		var unparsed_nodes = context.toArray();
		var parsed_nodes = [];
		
		var pattern = new RegExp('\\[(' + codes.join('|') + ')( [^\\]]+)?\\/?\\](?:(.*)\\[\\/\\1\\])?','i');
		var match = false;
		var current_node;

		while((current_node = unparsed_nodes.shift()))
		{
			// V�rifie que le noeud en cours n'a pas d�j� �t� pars�
			if($.inArray(current_node, parsed_nodes) >= 0) continue;

			if(current_node.nodeType == 1) {
				// Le noeud courant est un Node.ELEMENT_NODE, on ajoute ses enfants � la pile
				for(var i=0,il=current_node.childNodes.length;i<il;i++)
					unparsed_nodes.push(current_node.childNodes[i]);
			}
			if(current_node.nodeType != 3) {
				// Le noeud n'est pas un Node.TEXT_NODE, on l'ajoute � la liste
				// des noeuds trait�s, on passe au noeud suivant dans la pile
				parsed_nodes.push(current_node);
				continue;
			}

			// on ignore les noeuds script et style
			if( current_node.nodeName == "SCRIPT" || 
				current_node.nodeName == "STYLE") continue;
			
			// replace non breakable space added sometimes by wysiwyg
			match = pattern.exec(current_node.nodeValue.replace(/\xA0/,' '));
			if(!match) continue;
			
			var attributes = {};
			var shortcode_node;

			if(match[2]) {
				// le shortcode poss�de des attributs, on cr�� un �l�ment fictif
				// � l'aide de jQuery afin de simplifier le parsing des attributs
				var _attrs = $('<div ' + match[2] + '>')[0].attributes;
				for( var a=0, al=_attrs.length ; a<al ; a++ ) {
					attributes[_attrs[a].name.toLowerCase()] = _attrs[a].value;
				}
			}

			if(match[0].length == current_node.nodeValue.length) {
				// le noeud ne contient QUE le shortcode
				shortcode_node = current_node;
			}
			else {
				shortcode_node = current_node.splitText(match.index);
				var end_node = shortcode_node.splitText(match[0].length);
				// on remet le noeud restant dans la pile afin de chercher 
				// �ventuellement les autres shortcodes
				unparsed_nodes.push(end_node);
			}

			// On remplace le shortcode par l'�l�ment ou le code HTML 
			// retourn� par le callback. Le callback est appel� avec comme 
			// contexte le noeud correspondant au shortcode.
			$(shortcode_node).replaceWith(
				shortcodes[match[1]].call($(shortcode_node), attributes, match[3])
			);
		}
		// On purge la pile de noeuds pars�s
		parsed_nodes = [];

		return this;
	}

})(jQuery);
