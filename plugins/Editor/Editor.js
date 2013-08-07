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
            $('#editor-wrapper').css({ position: 'absolute', top: p.top, left: p.left, display: 'block' }).appendTo($('#layer2')).focus().one("blur", { node: node }, function (e, node) {
                e.stopPropagation();
                var label = e.data.node.attr('id');
                var orig_model = case0.ElementMap[label];
                var orig_view = caseViewer.ViewMap[label];
                var decoder = new AssureIt.CaseDecoder();
                var new_model = decoder.ParseASN(case0, editor.getValue(), orig_model);
                var new_view = new AssureIt.NodeView(caseViewer, new_model);
                orig_model.Parent.AppendChild(new_model);
                orig_model.Parent.RemoveChild(orig_model);
                case0.DeleteNodesRecursive(orig_model);
                orig_view.DeleteHTMLElementRecursive($("#layer0"), $("#layer1"));
                caseViewer.DeleteViewsRecursive(orig_view);
                (function (model, view) {
                    caseViewer.ViewMap[model.Label] = view;
                    for (var i = 0; i < model.Children.length; i++) {
                        var child_model = model.Children[i];
                        var child_view = new AssureIt.NodeView(caseViewer, child_model);
                        arguments.callee(child_model, child_view);
                    }
                    if (model.Parent != null)
                        view.ParentShape = caseViewer.ViewMap[model.Parent.Label];
                })(new_model, new_view);
                new_view.AppendHTMLElementRecursive($("#layer0"), $("#layer1"), caseViewer);
                caseViewer.Resize();
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
            editor.setValue(encoded);
            editor.refresh();
        });
        $('#layer1').click(function () {
            $('#editor-wrapper').blur();
        });
        return true;
    };
    return EditorPlugIn;
})(AssureIt.ActionPlugIn);
