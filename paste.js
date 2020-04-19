// Clipboard paste helper
const onPasteProxy = (callbackFn) => {
  return (e) => {
    const items = e.clipboardData.items;

    if (!items || items.length <= 0) return;
    loadImage(items[0].getAsFile(), callbackFn);
  };
};


// File input helper
const onFileProxy = (callbackfn) => {
  return (evt) => {
    const file = evt.target.files[0];
    loadImage(file, callbackfn);
  };
};


function loadImage(file, callbackFn) {
  const reader = new FileReader();
  reader.onload = function(e) {
    const data = e.target.result;
    callbackFn(data);
  }
  reader.readAsDataURL(file);
}
