<?php

/**
 * @file
 * Callback which request the view 'ckeditor_mentions' and inject the typed value as a realname filter.
 */

/**
 * @todo Please document this function.
 * @see http://drupal.org/node/1354
 */
function ckeditor_mentions_getpeople() {
  $typed = $_REQUEST['typed'];

  if (strlen($typed) <= 12 && $typed[0] == '@') {
    $typed = substr($typed, 1);

    $view = views_get_view('ckeditor_mentions');
    $view->set_display('block');
    $filter = $view->get_item('block', 'filter', 'name');
    $filter['value'] = $typed;
    $view->set_item('block', 'filter', 'name', $filter);
    $view->execute();
    $count = count($view->result);
    if ($count > 0) {
      $html = $view->render();
      backdrop_json_output(array('html' => $html));
      backdrop_exit();
    }
  }
}
