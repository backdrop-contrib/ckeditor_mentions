 /**
 * @file
 * Written by Albert Skibinski <albert@merge.nl>
 * http://www.merge.nl
 */

(function($){

		CKEDITOR.plugins.add('mentions', {

	    icons: '',

			init: function(editor) {

				var start_observe_count = 3;
				var observe = 0;
				var typed = [];
				var timeout_id;
				var timout_delay = 500;

			  function mentions_stop_observing(typed) {
					observe = 0;
					typed.length = 0;
					$('.mention-suggestions').remove();
				}

				// just a wrapper for timout function to prevent unnecessary aajx callbacks
				// when a user is fast typing
				function mentions_timeout(typed, editor) {
					if (timeout_id) {
            //console.log('timer cancelled (id='+timeout_id+')');
            clearTimeout(timeout_id);
          }
					timeout_id = setTimeout(function() { mentions_getpeople(typed, editor); }, timout_delay);	
				}

				function mentions_getpeople(typed, editor) {
					// make a copy of the array instead of a reference
					var clone = typed.slice(0);
					str = clone.join('');

			    var element_settings = {};

			    element_settings.progress = { 'type': 'none' }; 
			    element_settings.url = '/ckeditor/mentions';

			    var element = 'mentions_getpeople';
			    var base = 'mentions_getpeople';
			    element_settings.submit = {
			      'typed': str,
			      'element': editor.element.getId()
			    };
			    ajax = new Drupal.ajax(base, element, element_settings);
			    ajax.eventResponse($(ajax.element));

			    timeout_id = 0;
			    //console.log('timer reset');
			  }

				function mentions_break_on(charcode) {
					// 13 = enter
					// 37 = left key
					// 38 = up key
					// 39 = right key
					// 40 = down key
					// 36 = delete
					// 91 = home/end (?)
					var special = [13, 37, 38, 39, 40, 46, 91];
					for (var i = 0; i < special.length; i++) {
						if (special[i] == charcode) {
							return true;
						}
					}
					return false;
				}


				// The only way (it seems) to get a reliable, cross-browser and platform return for which key was pressed,
				// is using the jquery which function onkeypress. On keydown or up returns different values!
				// see also: http://jsfiddle.net/SpYk3/NePCm/
				editor.on('contentDom', function(e) {
					var editable = editor.editable();

					editable.attachListener( editable, 'click', function( evt ) {
						mentions_stop_observing(typed);
					});	

					// we need the keyup listener to detect things like backspace, 
					// which does not register on keypress... javascript is weird...
					editable.attachListener( editable, 'keyup', function( evt ) {
						//console.log("e.which = " + evt.data.$.which);
						if (evt.data.$.which == 8) { // 8 == backspace
							typed.pop();
							// check if we still have enough characters...
							if (typed.length >= start_observe_count) {	
								mentions_timeout(typed, editor);
							}
							if (typed.length < start_observe_count) {
								$('.mention-suggestions').remove();
							}
							if (typed.length == 0) {			
								mentions_stop_observing(typed);
							}
							//console.log(typed);
						}
						// things which should trigger a stop observing, like Enter, home, etc.
						if (mentions_break_on(evt.data.$.which)) {
							mentions_stop_observing(typed);
						}

					});

			    editable.attachListener( editable, 'keypress', function( evt ) {

			    	// btw: keyIdentifier is webkit only. 
			    	//console.log("keyIdentifier = " + evt.data.$.keyIdentifier);
						//console.log("keyCode = " + evt.data.$.keyCode);
						//console.log("e.which = " + evt.data.$.which);
						//console.log("String.fromCharCode = " +String.fromCharCode(evt.data.$.which));

						var typed_char = String.fromCharCode(evt.data.$.which);
						
						//console.log(typed);

						if (typed_char == '@' || observe == 1) {

							observe = 1;

							// Things which should trigger "stop observing":
							// if at this point no result and still a unicode, return false
							// OR detect another @ while we are already observing
							// OR the length is longer than 11
							if ((typed.length > 0 && typed_char == '@')	|| typed.length > 11)	{
								mentions_stop_observing(typed);
								return false;
							} 

							typed.push(typed_char);

							if (typed.length >= start_observe_count) {							
								mentions_timeout(typed, editor);
							} 
							
							//console.log(typed);

						}

					});
				}); // end editor.on

			} // end init functie

		});

})(jQuery);

