var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var FullScreenEditorPlugIn = (function (_super) {
    __extends(FullScreenEditorPlugIn, _super);
    function FullScreenEditorPlugIn(plugInManager) {
        _super.call(this, plugInManager);
        this.ActionPlugIn = new FullScreenEditorActionPlugIn(plugInManager);
        this.HTMLRenderPlugIn = new FullScreenEditorLayoutPlugIn(plugInManager);
    }
    return FullScreenEditorPlugIn;
})(AssureIt.PlugIn);

var FullScreenEditorLayoutPlugIn = (function (_super) {
    __extends(FullScreenEditorLayoutPlugIn, _super);
    function FullScreenEditorLayoutPlugIn(plugInManager) {
        _super.call(this, plugInManager);
    }
    FullScreenEditorLayoutPlugIn.prototype.IsEnabled = function (caseViewer, caseModel) {
        return true;
    };

    FullScreenEditorLayoutPlugIn.prototype.Delegate = function (caseViewer, caseModel, element) {
        return true;
    };
    return FullScreenEditorLayoutPlugIn;
})(AssureIt.HTMLRenderPlugIn);

var FullScreenEditorActionPlugIn = (function (_super) {
    __extends(FullScreenEditorActionPlugIn, _super);
    function FullScreenEditorActionPlugIn(plugInManager) {
        _super.call(this, plugInManager);
        this.editor = CodeMirror.fromTextArea(document.getElementById('fullscreen-editor'), {
            lineNumbers: true,
            mode: "text/x-asn",
            lineWrapping: true
        });
        this.editor.setSize("300px", "200px");
        $('#fullscreen-editor-wrapper').css({ display: 'none', opacity: '1.0' });
    }
    FullScreenEditorActionPlugIn.prototype.IsEnabled = function (caseViewer, case0) {
        return true;
    };

    FullScreenEditorActionPlugIn.prototype.Delegate = function (caseViewer, case0, serverApi) {
        var editor = this.editor;
        var self = this;
        $('#layer1').unbind('dblclick');
        $('#layer1').dblclick(function (ev) {
            ev.stopPropagation();
            self.plugInManager.UseUILayer(self);
            var label = case0.ElementTop.Label;
            editor.setSize(640, 480);

            var encoder = new AssureIt.CaseEncoder();
            var encoded = encoder.ConvertToASN(case0.ElementTop, false);

            var orig_model = case0.ElementMap[label];
            var orig_shape = caseViewer.ViewMap[label];
            var node = $(this);

            $('#fullscreen-editor-wrapper').css({ position: 'absolute', top: 100, left: 100, display: 'block' }).appendTo($('#layer2')).focus().one("blur", { node: node }, function (e, node) {
                e.stopPropagation();
                var orig_model = case0.ElementMap[label];
                var orig_view = caseViewer.ViewMap[label];
                var decoder = new AssureIt.CaseDecoder();
                var new_model = decoder.ParseASN(case0, editor.getValue(), orig_model);
                var new_view = new AssureIt.NodeView(caseViewer, new_model);

                caseViewer.ElementTop = new_model;
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
                    $('#fullscreen-editor-wrapper').blur();
                }
            });
            editor.setValue(encoded);
            editor.refresh();
            editor.focus();
            $('#CodeMirror').focus();
            $('#layer1').click(function () {
                $('#fullscreen-editor-wrapper').blur();
            });
        });
        return true;
    };

    FullScreenEditorActionPlugIn.prototype.DeleteFromDOM = function () {
        $('fullscreen-editor-wrapper').blur();
    };
    return FullScreenEditorActionPlugIn;
})(AssureIt.ActionPlugIn);
