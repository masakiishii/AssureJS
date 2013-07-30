var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var NotePlugIn = (function (_super) {
    __extends(NotePlugIn, _super);
    function NotePlugIn() {
        _super.apply(this, arguments);
    }
    NotePlugIn.prototype.IsEnabled = function (caseViewer, caseModel) {
        return true;
    };

    NotePlugIn.prototype.Delegate = function (caseViewer, caseModel) {
    };
    return NotePlugIn;
})(HTMLRenderPlugIn);
