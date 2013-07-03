 /**
 * @file
 * Written by Albert Skibinski <albert@merge.nl>
 * http://www.merge.nl
 */

///////////////////////////////////////////////////////////////
//      CKEDITOR_mentions helper class
///////////////////////////////////////////////////////////////

/*
 * Helper class needed to handle mentions.
 * This class is a singleton for each instance of CKEDITOR.
 *
 * @param {Object} editor An instance of a CKEDITOR
 * @returns {null}
 */
function CKEDITOR_mentions (editor) {
  this.editor = editor;
  this.observe = 0;
  this.char_input = [];

  if ( CKEDITOR_mentions.caller != CKEDITOR_mentions.get_instance ) {
      throw new Error("This object cannot be instanciated");
  }
}

/*
 * Collection of pairs editor id / instance of CKEDITOR_mentions
 *
 * @type Array
 */
CKEDITOR_mentions.instances = [];

/*
 * Method used to get an instance of CKEDITOR_mentions linked to an instance of CKEDITOR.
 * Its design is based on the singleton design pattern.
 *
 * @param {Object} editor An instance of a CKEDITOR
 * @returns An instance of CKEDITOR_mentions
 */
CKEDITOR_mentions.get_instance = function (editor) {
  // we browse our collection of instances
  for (var i in this.instances) {
    // if we find an CKEDITOR instance in our collection
    if (this.instances[i].id == editor.id) {
      // we return the instance of CKEDITOR_mentions that match
      return this.instances[i].instance;
    }
  }

  // if no match was found, we add a row in our collection with the current CKEDITOR id and we instanciate CKEDITOR_mentions
  this.instances.push({
    id: editor.id,
    instance: new CKEDITOR_mentions(editor)
  });
  // we return the instance of CKEDITOR_mentions that was just created
  return this.instances[this.instances.length - 1].instance;
};

/*
 * This method delete the div containing the suggestions
 *
 * @returns {null}
 */
CKEDITOR_mentions.prototype.delete_tooltip = function () {
  jQuery('.mention-suggestions').remove();
};

/*
 * This method start the observation of the typed characters
 *
 * @returns {null}
 */
CKEDITOR_mentions.prototype.start_observing = function () {
  this.observe = 1;
};

/*
 * This method halts the observation of the typed characters and flush the properties used by CKEDITOR_mentions
 *
 * @returns {null}
 */
CKEDITOR_mentions.prototype.stop_observing = function () {
  this.observe = 0;
  this.char_input = [];
  this.delete_tooltip();
};

/*
 * This methods send an ajax query to durpal ckeditor_mentions module and retrieve matching user.
 *
 * @returns {null}
 */
CKEDITOR_mentions.prototype.get_people = function (selection) {
  //if less than 3 char are input (including @) we don't try to get people

  var str = this.char_input.join('');

  if (str.length < 3) {
    this.delete_tooltip();
    return;
  }

  var $ = jQuery;

  var editor = this.editor,
    element_id = editor.element.getId();

  var range = selection.getRanges()[0],
    startOffset = range.startOffset - str.length + 1,
    element = range.startContainer.$;

  $.get(Drupal.settings.basePath + 'ckeditor/mentions', {typed: str}, function(rsp) {

    var ckel = $('#' + element_id);
    var par = ckel.parent();

    $('.mention-suggestions').remove();

    if (rsp) {
    	$('<div class="mention-suggestions">' + rsp.html + '</div>').insertAfter(par);
  	}

    $('.mention-users').click(function(e) {
      e.preventDefault();

      var mentions = CKEDITOR_mentions.get_instance(editor);
      mentions.stop_observing();

      // Shorten text node
      element.textContent = element.textContent.substr(0, startOffset);

      // Create link
      var link = document.createElement('a');
      link.href = Drupal.settings.basePath + 'user/' + $(this).data('uid');
      link.textContent = '@' + $(this).data('realname');

      // Insert link after text node
      if ( element.nextSibling ) {
        element.parentNode.insertBefore(link, element.nextSibling);
      }
      else {
        element.parentNode.appendChild(link);
      }

      editor.focus();

      var range = editor.createRange(),
        el = new CKEDITOR.dom.element(link.parentNode);
      range.moveToElementEditablePosition(el, link.parentNode.textContent.length);
      range.select();
    });

  });
};

/*
 * This method returns if a char should stop the observation.
 *
 * @param {int} charcode A character key code
 * @returns {Boolean} Whether or not the char should stop the observation
 */
CKEDITOR_mentions.prototype.break_on = function (charcode) {
  // 13 = enter
  // 37 = left key
  // 38 = up key
  // 39 = right key
  // 40 = down key
  // 46 = delete
  // 91 = home/end (?)
  var special = [13, 37, 38, 39, 40, 46, 91];
  for (var i = 0; i < special.length; i++) {
    if (special[i] == charcode) {
      return true;
    }
  }
  return false;
};


///////////////////////////////////////////////////////////////
//      Plugin implementation
///////////////////////////////////////////////////////////////
(function($){
  CKEDITOR.plugins.add('mentions', {
    icons: '',
    init: function(editor) {
      var mentions = CKEDITOR_mentions.get_instance(editor);

      /* The only way (it seems) to get a reliable, cross-browser and platform return for which key was pressed,
       * is using the jquery which function onkeypress. On keydown or up returns different values!
       * see also: http://jsfiddle.net/SpYk3/NePCm/
       */
      editor.on('contentDom', function(e) {
        var editable = editor.editable();

        /* we need the keyup listener to detect things like backspace,
         * which does not register on keypress... javascript is weird...
         */
        editable.attachListener(editable, 'keyup', function(evt) {
          //console.log("e.which = " + evt.data.$.which);
          if (evt.data.$.which === 8) { // 8 == backspace
            mentions.char_input.pop();
            var selection = this.editor.getSelection();
            mentions.get_people(selection);
          }

          // things which should trigger a stop observing, like Enter, home, etc.
          if (mentions.break_on(evt.data.$.which)) {
            mentions.stop_observing();
          }

        });

        editable.attachListener(editable, 'keypress', function(evt) {
          /* btw: keyIdentifier is webkit only.
           * console.log("keyIdentifier = " + evt.data.$.keyIdentifier);
           * console.log("keyCode = " + evt.data.$.keyCode);
           * console.log("e.which = " + evt.data.$.which);
           * console.log("String.fromCharCode = " +String.fromCharCode(evt.data.$.which));
           */

          var typed_char = String.fromCharCode(evt.data.$.which);

          if (typed_char === '@' || mentions.observe === 1) {
            mentions.start_observing();
            /* Things which should trigger "stop observing":
             * if at this point no result and still a unicode, return false
             * OR detect another @ while we are already observing
             * OR the length is longer than 11
             */
            if ((mentions.char_input.length > 0 && typed_char === '@') || mentions.char_input.length > 11)  {
              mentions.stop_observing();
            } else {
           		mentions.char_input.push(typed_char);
            	var selection = this.editor.getSelection();
            	mentions.get_people(selection);
          	}
          }
        });
      }); // end editor.on
    } // end init function
  });
})(jQuery);

