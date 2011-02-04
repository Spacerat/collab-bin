
/********
Editor utilising only a visible textarea
********/
Editor = function(id) {
    this.init(id)
}
Editor.prototype.init = function(id) {
    this.textarea = document.getElementById(id);
}
Editor.prototype.getValue = function() {
    return this.textarea.value;
}
Editor.prototype.setValue = function(value) {
    this.textarea.value = value;
}
