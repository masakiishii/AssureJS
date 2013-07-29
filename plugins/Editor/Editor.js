var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var EditorPlugIn = (function (_super) {
    __extends(EditorPlugIn, _super);
    function EditorPlugIn() {
        _super.call(this);
        wideArea();
        $('#editor').css({ display: 'none' });
    }
    EditorPlugIn.prototype.IsEnabled = function (caseViewer, caseModel) {
        return true;
    };

    EditorPlugIn.prototype.Delegate = function (caseViewer, caseModel) {
        $('.node').click(function (ev) {
            ev.stopPropagation();
            var p0 = $(this).position();
            var h4 = $(this).find("h4");
            var p = h4.position();
            p.left += p0.left;
            p.top += p0.top;
            $('#editor').css({ position: 'absolute', top: p.top, left: p.left, display: 'block' }).appendTo($('#layer2')).focus().blur(function (e) {
                e.stopPropagation();
                $(this).css({ display: 'none' });
                $('#editor').text("");
            }).on("keydown", function (e) {
                if (e.keyCode == 27) {
                    e.stopPropagation();
                    $(this).css({ display: 'none' });
                }
            }).width(h4.outerWidth());
        });
        $('#layer1').click(function () {
            $('#editor').blur();
        });
        return true;
    };
    return EditorPlugIn;
})(ActionPlugIn);
