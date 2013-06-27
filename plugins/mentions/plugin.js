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

			  function mentions_stop_observing(typed) {
					observe = 0;
					typed.length = 0;
					$('.mention-suggestions').remove();
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
								mentions_getpeople(typed, editor);
							} else {
								// here, we stop observing alltogether, idealle we would want to:
								// @TODO hide the suggestions but keep the typed array, unless the @ is also backspaced.
								// so, when the count is above "start_observe_count" we would display suggestions again.
								mentions_stop_observing(typed);
							}
						}
						// things which shoudl trigger a stop observing, like Enter, home, etc.
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
						
						//console.log(typed_char);

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
								mentions_getpeople(typed, editor);
							} 
							
							//console.log(typed);

						}

					});
				}); // einde editor.on

			} // einde init functie

		});

})(jQuery);

