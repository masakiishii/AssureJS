var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var ExpandedNodeHeight = 200;
var InplaceEditorHeight = ExpandedNodeHeight - 50;

;

var EditorPlugIn = (function (_super) {
    __extends(EditorPlugIn, _super);
    function EditorPlugIn(plugInManager) {
        _super.call(this, plugInManager);
        this.ActionPlugIn = new EditorActionPlugIn(plugInManager);
        this.HTMLRenderPlugIn = new EditorLayoutPlugIn(plugInManager);
    }
    return EditorPlugIn;
})(AssureIt.PlugIn);

var EditorLayoutPlugIn = (function (_super) {
    __extends(EditorLayoutPlugIn, _super);
    function EditorLayoutPlugIn(plugInManager) {
        _super.call(this, plugInManager);
    }
    EditorLayoutPlugIn.prototype.IsEnabled = function (caseViewer, caseModel) {
        return true;
    };

    EditorLayoutPlugIn.prototype.Delegate = function (caseViewer, caseModel, element) {
        return true;
    };
    return EditorLayoutPlugIn;
})(AssureIt.HTMLRenderPlugIn);

var EditorActionPlugIn = (function (_super) {
    __extends(EditorActionPlugIn, _super);
    function EditorActionPlugIn(plugInManager) {
        _super.call(this, plugInManager);
        this.editor = CodeMirror.fromTextArea(document.getElementById('editor'), {
            lineNumbers: false,
            mode: "text/x-asn",
            lineWrapping: true
        });
        this.editor.setSize("300px", "200px");
        $('#editor-wrapper').css({ display: 'none', opacity: '1.0' });
    }
    EditorActionPlugIn.prototype.IsEnabled = function (caseViewer, case0) {
        return true;
    };

    EditorActionPlugIn.prototype.Delegate = function (caseViewer, case0, serverApi) {
        var editor = this.editor;
        var self = this;
        $('.node').unbind('dblclick');
        $('.node').dblclick(function (ev) {
            ev.stopPropagation();
            self.plugInManager.UseUILayer(self);
            var node = $(this);
            var p = node.position();
            var p_contents = node.children("p").position();
            var label = node.attr('id');
            var selector = "#" + label;
            console.log(selector);
            console.log($(selector).height() + ", " + p_contents.top);
            editor.setSize(node.children("p").width(), InplaceEditorHeight);

            var encoder = new AssureIt.CaseEncoder();
            var encoded = encoder.ConvertToASN(case0.ElementMap[label], true);

            var orig_model = case0.ElementMap[label];
            var orig_shape = caseViewer.ViewMap[label];

            orig_model.IsEditing = true;
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
            var node = $(this);

            $('#editor-wrapper').css({ position: 'absolute', top: p.top + p_contents.top, left: p.left + p_contents.left, display: 'block' }).appendTo($('#layer2')).focus().one("blur", { node: node }, function (e, node) {
                e.stopPropagation();
                var label = e.data.node.attr('id');
                var orig_model = case0.ElementMap[label];
                var orig_view = caseViewer.ViewMap[label];
                var decoder = new AssureIt.CaseDecoder();
                var new_model = decoder.ParseASN(case0, editor.getValue(), orig_model);
                var new_view = new AssureIt.NodeView(caseViewer, new_model);

                orig_model.Parent.UpdateChild(orig_model, new_model);
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
                    $(selector).blur();
                }
            });
            editor.setValue(encoded);
            editor.refresh();
            editor.focus();
            $('#CodeMirror').focus();
            $('#layer1').click(function () {
                $(selector).blur();
            });
        });
        return true;
    };

    EditorActionPlugIn.prototype.DeleteFromDOM = function () {
        $(this.selector).blur();
    };
    return EditorActionPlugIn;
})(AssureIt.ActionPlugIn);
