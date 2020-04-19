// Clipboard paste helper
const onPasteProxy = (callbackFn) => {
  return (e) => {
    const items = e.clipboardData.items;

    if (!items || items.length <= 0) return;
    loadImage(items[0].getAsFile(), callbackFn);
  };
}


function loadImage(file, callbackFn) {
  const reader = new FileReader();
  reader.onload = function(e) {
    const data = e.target.result;
    callbackFn(data);
  }
  reader.readAsDataURL(file);
}
