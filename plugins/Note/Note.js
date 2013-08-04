var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var NoteHTMLRenderPlugIn = (function (_super) {
    __extends(NoteHTMLRenderPlugIn, _super);
    function NoteHTMLRenderPlugIn() {
        _super.apply(this, arguments);
    }
    NoteHTMLRenderPlugIn.prototype.IsEnabled = function (caseViewer, nodeModel) {
        return true;
    };

    NoteHTMLRenderPlugIn.prototype.Delegate = function (caseViewer, nodeModel) {
        return true;
    };
    return NoteHTMLRenderPlugIn;
})(AssureIt.HTMLRenderPlugIn);
