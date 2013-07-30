var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var AnnotationPlugIn = (function (_super) {
    __extends(AnnotationPlugIn, _super);
    function AnnotationPlugIn() {
        _super.apply(this, arguments);
    }
    AnnotationPlugIn.prototype.IsEnabled = function (caseViewer, caseModel) {
        return true;
    };

    AnnotationPlugIn.prototype.Delegate = function (caseViewer, caseModel, element) {
        if (caseModel.Annotations.length == 0)
            return;

        var text = "";
        var p = element.position();

        for (var i = 0; i < caseModel.Annotations.length; i++) {
            text += "@" + caseModel.Annotations[i].Name + "<br>";
        }

        $('<div class="anno">' + '<p>' + text + '</p>' + '</div>').css({ position: 'absolute', 'font-size': 25, color: 'gray', top: p.top - 20, left: p.left + 80 }).appendTo(element);

        return true;
    };
    return AnnotationPlugIn;
})(HTMLRenderPlugIn);
