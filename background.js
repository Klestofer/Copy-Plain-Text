'use strict';
const l = console.log;
const n = console.log.bind(console, '\n');
const i = console.info;
const w = console.warn;
const e = console.error;


// menu IDs
const MENU_ID__SELECTION = '0';

const MENU_ID__SET_METHOD__DEFAULT = '1';
const MENU_ID__SET_METHOD__NEWLINES = '2';
const MENU_ID__SET_METHOD__NEWLINES_AND_SPACES = '3';

const MENU_ID__APPLY_METHOD = '10';
const MENU_ID__APPLY_METHOD__SIMILAR_TO_DEFAULT = '11';
const MENU_ID__APPLY_METHOD__NEWLINES = '12';
const MENU_ID__APPLY_METHOD__NEWLINES_AND_SPACES = '13';

const MENU_ID__FORCE_PLAIN_TEXT_COPY_ON_PAGE = '4';




let settings = {};
let textarea;




readSettings(createContextMenus);




function readSettings(callback) {
  l('readSettings()');

  chrome.storage.sync.get(function (items) {
    l('storage.sync.get()', items);

    if (items.methodId === undefined) {
      w('set default settings');
      items.methodId = MENU_ID__SET_METHOD__DEFAULT;
    }
    settings.methodId = items.methodId;

    callback();
  });
}




function writeSettings(){
  l('writeSettings()', settings);

  chrome.storage.sync.set(settings, () => l('on chrome.storage.sync.set()'));
}




document.addEventListener('DOMContentLoaded', function() {
  l('DOMContentLoaded');

  textarea = document.querySelector('textarea');
});




function createContextMenus() {
  l('createContextMenus()');

  chrome.contextMenus.create({
    title: 'Copy plain text',
    contexts: ['selection'],
    id: MENU_ID__SELECTION
  }, () => l('context menu created'));

  createSetMethodContextMenu(MENU_ID__SET_METHOD__DEFAULT, 'Default method');
  createSetMethodContextMenu(MENU_ID__SET_METHOD__NEWLINES, 'Method with newlines');
  createSetMethodContextMenu(MENU_ID__SET_METHOD__NEWLINES_AND_SPACES, 'Method with newlines and spaces');

  chrome.contextMenus.create({
    title: 'Apply method',
    contexts: ['browser_action'],
    id: MENU_ID__APPLY_METHOD
  }, () => l('context menu created'));

  createApplyMethodContextMenu(MENU_ID__APPLY_METHOD__SIMILAR_TO_DEFAULT, 'Similar to default');
  createApplyMethodContextMenu(MENU_ID__APPLY_METHOD__NEWLINES, 'With newlines');
  createApplyMethodContextMenu(MENU_ID__APPLY_METHOD__NEWLINES_AND_SPACES, 'With newlines and spaces');

  chrome.contextMenus.create({
    title: 'Force plain text copy on page until reload(experimental)',
    contexts: ['browser_action'],
    id: MENU_ID__FORCE_PLAIN_TEXT_COPY_ON_PAGE
  }, () => l('context menu created'));
}




function createSetMethodContextMenu(id, title) {
  l('createSetMethodContextMenu()', id, '"' + title + '"');

  chrome.contextMenus.create({
    type: 'radio',
    id,
    title,
    checked: id === settings.methodId,
    contexts: ['browser_action'],
  }, () => l('context menu created'));
}




function createApplyMethodContextMenu(id, title) {
  l('createApplyMethodContextMenu()', id, '"' + title + '"');

  chrome.contextMenus.create({
    id,
    title,
    contexts: ['browser_action'],
    parentId: MENU_ID__APPLY_METHOD
  }, () => l('context menu created'));
}




chrome.browserAction.onClicked.addListener(function (tab) {
  n(); l('browserAction.onClicked()');

  alert('Nothing here yet');
});




chrome.contextMenus.onClicked.addListener(function (info, tab) {
  n(); l('contextMenus.onClicked()', info, tab);

  switch(info.menuItemId) {
    case MENU_ID__SELECTION:
      handleContextMenu(info.selectionText);
      break;


    case MENU_ID__SET_METHOD__DEFAULT:
    case MENU_ID__SET_METHOD__NEWLINES:
    case MENU_ID__SET_METHOD__NEWLINES_AND_SPACES:
      settings.methodId = info.menuItemId;
      writeSettings();
      break;


    case MENU_ID__APPLY_METHOD__SIMILAR_TO_DEFAULT:
      applyMethodSimilarToDefault();
      break;

    
    case MENU_ID__APPLY_METHOD__NEWLINES:
      applyMethodWithNewlines();
      break;

    
    case MENU_ID__APPLY_METHOD__NEWLINES_AND_SPACES:
      applyMethodWithNewlinesAndSpaces();
      break;

    case MENU_ID__FORCE_PLAIN_TEXT_COPY_ON_PAGE:
      chrome.tabs.executeScript({ file: 'content scripts/force plain text copy.js' }, results => l('tabs.executeScript()', results));
      break;
  }
});




function handleContextMenu(selectionText) {
  l('handleContextMenu()', settings.methodId);

  switch(settings.methodId) {
    case MENU_ID__SET_METHOD__DEFAULT:
      copyToClipboard(selectionText || 'strange, but selection text was undefined');
      break;


    case MENU_ID__SET_METHOD__NEWLINES:
      applyMethodWithNewlines();
      break;


    case MENU_ID__SET_METHOD__NEWLINES_AND_SPACES:
      applyMethodWithNewlinesAndSpaces();
      break;
  }
}




function applyMethodSimilarToDefault() {
  chrome.tabs.executeScript({ file: 'content scripts/newlines.js' }, function([result]) {
    l(`selected text >>>${result}<<<`);
    if (result === '') {
      w('nothing is selected');
      return;
    }
        
    // try to be similar to default
    result = result.replace(/\n|\t/g, ' ');

    copyToClipboard(result);
  });
}




function applyMethodWithNewlines() {
  chrome.tabs.executeScript({ file: 'content scripts/newlines.js' }, function([result]) {
    l(`selected text >>>${result}<<<`);
    if (result === '') {
      w('nothing is selected');
      return;
    }
    copyToClipboard(result);
  });
}




function applyMethodWithNewlinesAndSpaces() {
  chrome.tabs.executeScript({ file: 'content scripts/newlines and spaces.js' }, function([result]) {
    l(`selected text >>>${result}<<<`);
    if (result === '' || result === null) {
      w('nothing is selected');
      return;
    }
    copyToClipboard(result);
  });
}




function copyToClipboard(text) {
  l('copyToClipboard()');

  textarea.value = text;
  textarea.select();
  let result = document.execCommand('copy');
  l('document.execCommand()', result);
}
