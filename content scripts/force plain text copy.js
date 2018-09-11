'use strict';
document.oncopy = function(event) {
  //console.log(event);
  event.clipboardData.setData('Text', getSelection().toString());
  event.preventDefault();
};
