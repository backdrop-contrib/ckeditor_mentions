/**
 * @file
 * Ajax return function, uses some jQuery to insert the view right after the editor.
 */

(function ($) {

  Drupal.ckeditor_mentions = {}
  
  Drupal.behaviors.ckeditor_mentions = {
    attach: function(context, settings) {

      $(function() {
        Drupal.ajax.prototype.commands.ckeditor_mentions = function (ajax, response, status) {
          $('.mention-suggestions').remove();
          var ckel = $('#'+response.data.element);
          var par = ckel.parent();
          var typed = response.data.typed;
          $('<div class="mention-suggestions">' + response.data.view + '</div>').insertAfter(par);
          $('.mention-users').unbind();
          $('.mention-users').click(function() {
            var editor = CKEDITOR.instances[response.data.element];
            var linkhtml = '<a href="/user/'+$(this).data('uid')+'">@'+$(this).data('realname')+'</a>';
            var body = editor.getData();
            var regEx = new RegExp(typed, "ig"); // case insensitive replacement
            var replaced_text = body.replace(regEx, linkhtml);
            editor.setData(replaced_text);
            $('.mention-suggestions').remove();
          });
        };
      });

    }
  }
}(jQuery));

