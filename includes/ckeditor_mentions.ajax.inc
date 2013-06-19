<?php
/*
 * Callback which request the view 'ckeditor_mentions' and inject the typed value as a realname filter.
**/
function ckeditor_mentions_getpeople() {

  $typed = check_plain($_POST['typed']);
  $element = check_plain($_POST['element']);

  if (strlen($typed) <= 11 && $typed[0] == '@') {

    $typed = substr($typed,1);

    //watchdog('ckeditor_mentions', 'typed = %typed', array('%typed' => $typed), WATCHDOG_DEBUG);
    
    $view = views_get_view('ckeditor_mentions');
    $view->set_display('block');
    $filter = $view->get_item('block', 'filter', 'realname');
    $filter['value'] = $typed;
    $view->set_item('block', 'filter', 'realname', $filter);
    $view->execute();
    
    $output = array(
      '#type' => 'ajax',
      '#commands' => array(
        array('command' => 'ckeditor_mentions', 'data' => array('view' => $view->render(), 'element' => $element, 'typed' => '@'.$typed)),
      ),
    );

    return $output; 

  }
}
