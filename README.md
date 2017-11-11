CKEDitor Mentions
=================

This plugin for CKEDitor will provide 'Facebook-like' mentioning of people in
any CKEditor field, including a suggestion box while you type. This is
triggered by typing an '@' character and at least 2 other characters. Names are
queried using a view and matched on the username of the user. When a name is
clicked, it can be inserted as a link to the user's profile page (user/#uid).

Features
--------

You can override the included view to your needs.

Requirements
------------

CKEditor module
This module was tested with CKEditor 4.1.

This plugin works with below browsers
iPad 1+
Webkit browsers (Safari, Chrome)
Firefox
Internet Exporer 9+

Install
-------

Enable the module and check the plugin in your ckeditor profile at
admin/config/content/ckeditor.

Support
-------

Please use the issue queue for any requests or bug reports.

Related projects
----------------

The mentions module provides an text format input filter that translates
@username or @uid strings to URL's. 

This Backdrop port has been modified to work better with Mentions API:
- A configuration page has been added to disable this module from replacing
  `@whatever` strings with hyperlinks to user pages. This is necessary because
  Mentions uses a filter which   parses body text for text strings beginning 
  in `[@whatever]` or `@whatever`.
- If Mentions is enabled, the configuration link for this module will be nested
  under mentions' link.

License
-------

This project is GPL v2 software. See the LICENSE.txt file in this directory for
complete text.

Current Maintainers
-------------------
 - docwilmot (https://github.com/docwilmot

Credit
-------

This module is written and maintained on Drupal.org by Albert Skibinski (Merge)
and sponsored by SIOB for the biebtobieb.nl project.
