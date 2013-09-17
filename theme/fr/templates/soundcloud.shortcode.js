/**
 * Shortcode Soundcloud
 * Permet l'int�gration d'un player soundcloud
 * 
 * Le shortcode impl�mente tous les param�tres du configurateur de player
 * disponible sur soundcloud.com
 * 
 * attributs du shortcode
 *  - url URL spotify de l'album, playliste ou piste
 *  - params (optionel) Param�tres du player (voir configurateur)
 *  - width (optionel) Largeur du player
 *  - height (optionel) Hauteur du player
 *  - iframe (optionel) bool�en indiquant une int�gration par iframe (non utilis�)
 * 
 * exemple
 *	 [soundcloud url="http://api.soundcloud.com/tracks/107559662" params="color=925c65&auto_play=false&show_artwork=true" width=" 100%" height="166" iframe="true" /]
 *
 */
(function($){
	
	'use strict';
	
	$.shortcode || $.error("Le plugin shortcode.js est requis");

	// On enregistre un nouveau shortcode sur la page
	$.shortcode.register('soundcloud', function(attr){
		
		if(!attr.url) return false;
		
		return $('<iframe>').attr({
			width : attr.width || "100%",
			height : attr.height || 166,
			src : 'https://w.soundcloud.com/player/?url=' + encodeURIComponent(attr.url)+'&'+encodeURI(attr.params),
			frameborder : 0,
			scrolling : "no"
		});

	});
	
})(window.jQuery);