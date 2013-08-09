var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
;

var EditorPlugIn = (function (_super) {
    __extends(EditorPlugIn, _super);
    function EditorPlugIn() {
        _super.call(this);
        this.ActionPlugIn = new EditorActionPlugIn();
    }
    return EditorPlugIn;
})(AssureIt.PlugIn);

var EditorActionPlugIn = (function (_super) {
    __extends(EditorActionPlugIn, _super);
    function EditorActionPlugIn() {
        _super.call(this);

        this.editor = CodeMirror.fromTextArea(document.getElementById('editor'), {
            lineNumbers: false,
            mode: "text/x-asn"
        });
        this.editor.setSize("300px", "200px");
        $('#editor-wrapper').css({ display: 'none' });
    }
    EditorActionPlugIn.prototype.IsEnabled = function (caseViewer, case0) {
        return true;
    };

    EditorActionPlugIn.prototype.Delegate = function (caseViewer, case0, serverApi) {
        var editor = this.editor;
        $('.node').dblclick(function (ev) {
            ev.stopPropagation();
            var node = $(this);
            var p = node.position();
            var label = node.attr('id');
            var encoder = new AssureIt.CaseEncoder();
            var encoded = encoder.ConvertToASN(case0.ElementMap[label], true);
            $('#editor-wrapper').css({ position: 'absolute', top: p.top, left: p.left, display: 'block' }).appendTo($('#layer2')).focus().one("blur", { node: node }, function (e, node) {
                console.log("blur");
                e.stopPropagation();
                var label = e.data.node.attr('id');
                var orig_model = case0.ElementMap[label];
                var orig_shape = caseViewer.ViewMap[label];
                var decoder = new AssureIt.CaseDecoder();
                var new_model = decoder.ParseASN(case0, editor.getValue().trim(), orig_model);

                orig_model.Statement = new_model.Statement == null ? "" : new_model.Statement;
                orig_model.Annotations = new_model.Annotations;
                orig_model.Notes = new_model.Notes;
                console.log("parsed notes");
                console.log(new_model.Notes);
                orig_shape.HTMLDoc.Render(caseViewer, orig_model);

                caseViewer.Resize();
                var backgroundlayer = document.getElementById("background");
                var shapelayer = document.getElementById("layer0");
                var contentlayer = document.getElementById("layer1");
                var controllayer = document.getElementById("layer2");
                var offset = $("#layer1").offset();

                var Screen = new AssureIt.ScreenManager(shapelayer, contentlayer, controllayer, backgroundlayer);
                caseViewer.Draw(Screen);
                Screen.SetOffset(offset.left, offset.top);

                $(this).css({ display: 'none' });
            }).on("keydown", function (e) {
                if (e.keyCode == 27) {
                    e.stopPropagation();
                    $('#editor-wrapper').blur();
                }
            });
            editor.setValue(encoded);
            editor.refresh();
        });
        $('#layer1').click(function () {
            $('#editor-wrapper').blur();
        });
        return true;
    };
    return EditorActionPlugIn;
})(AssureIt.ActionPlugIn);
