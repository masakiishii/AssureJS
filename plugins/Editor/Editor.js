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

        this.editor = CodeMirror.fromTextArea(document.getElementById('editor'), {
            lineNumbers: true,
            mode: "text/x-asn"
        });
        this.editor.setSize("200px", "200px");
        $('#editor-wrapper').css({ display: 'none' });
    }
    EditorPlugIn.prototype.IsEnabled = function (caseViewer, case0) {
        return true;
    };

    EditorPlugIn.prototype.Delegate = function (caseViewer, case0, serverApi) {
        var editor = this.editor;
        $('.node').click(function (ev) {
            ev.stopPropagation();
            var node = $(this);
            var p = node.position();
            var label = node.attr('id');
            var encoder = new AssureIt.CaseEncoder();
            var encoded = encoder.ConvertToASN(case0.ElementMap[label]);
            editor.setValue(encoded);
            $('#editor-wrapper').css({ position: 'absolute', top: p.top, left: p.left, display: 'block' }).appendTo($('#layer2')).focus().one("blur", { node: node }, function (e, node) {
                e.stopPropagation();
                var label = e.data.node.attr('id');
                var orig_model = case0.ElementMap[label];
                var orig_shape = caseViewer.ViewMap[label];
                var decoder = new AssureIt.CaseDecoder();
                var new_model = decoder.ParseASN(case0, editor.getValue(), orig_model);
                var new_shape = new AssureIt.NodeView(caseViewer, new_model);
                (function (model, shape) {
                    for (var i = 0; i < model.Children.length; i++) {
                        var child_model = model.Children[i];
                        child_model.Parent = model;
                        child_model.Case = case0;
                        child_model.Label = case0.NewLabel(child_model.Type);
                        case0.ElementMap[child_model.Label] = child_model;
                        var child_shape = new AssureIt.NodeView(caseViewer, child_model);
                        arguments.callee(child_model, child_shape);
                    }
                    caseViewer.ViewMap[model.Label] = shape;
                    if (model.Parent != null)
                        shape.ParentShape = caseViewer.ViewMap[model.Parent.Label];
                })(new_model, new_shape);
                caseViewer.Resize();
                orig_shape.DeleteHTMLElementRecursive($("#layer0"), $("#layer1"));
                new_shape.AppendHTMLElementRecursive($("#layer0"), $("#layer1"), caseViewer);
                caseViewer.LayoutElement();
                for (var viewkey in caseViewer.ViewMap) {
                    caseViewer.ViewMap[viewkey].Update();
                }
                $(this).css({ display: 'none' });
            }).on("keydown", function (e) {
                if (e.keyCode == 27) {
                    e.stopPropagation();
                    $('#editor-wrapper').blur();
                }
            });
        });
        $('#layer1').click(function () {
            $('#editor-wrapper').blur();
            $('#editor-wrapper').css({ display: 'none' });
        });
        return true;
    };
    return EditorPlugIn;
})(AssureIt.ActionPlugIn);
