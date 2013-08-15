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
        $(this.editor.getWrapperElement()).css({
            height: "100%",
            width: "100%",
            background: "rgba(255, 255, 255, 0.85)"
        });
        $('#fullscreen-editor-wrapper').css({
            position: "absolute",
            top: "5%",
            left: "5%",
            height: "90%",
            width: "90%",
            display: 'none'
        });
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

            var encoder = new AssureIt.CaseEncoder();
            var encoded = encoder.ConvertToASN(case0.ElementTop, false);

            var node = $(this);

            $('#fullscreen-editor-wrapper').css({ display: 'block' }).addClass("animated fadeInDown").focus().one("blur", { node: node }, function (e, node) {
                e.stopPropagation();
                var decoder = new AssureIt.CaseDecoder();
                var new_model = decoder.ParseASN(case0, editor.getValue(), null);
                if (new_model != null) {
                    var label = case0.ElementTop.Label;
                    var orig_model = case0.ElementMap[label];
                    var orig_view = caseViewer.ViewMap[label];
                    case0.DeleteNodesRecursive(orig_model);
                    orig_view.DeleteHTMLElementRecursive($("#layer0"), $("#layer1"));
                    caseViewer.DeleteViewsRecursive(orig_view);
                    case0.ResetIdConters();
                    var new_view = new AssureIt.NodeView(caseViewer, new_model);

                    caseViewer.ElementTop = new_model;
                    case0.ElementTop = new_model;
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

                    caseViewer.Resize();
                    var backgroundlayer = document.getElementById("background");
                    var shapelayer = document.getElementById("layer0");
                    var contentlayer = document.getElementById("layer1");
                    var controllayer = document.getElementById("layer2");
                    var offset = $("#layer1").offset();
                    var Screen = new AssureIt.ScreenManager(shapelayer, contentlayer, controllayer, backgroundlayer);
                    caseViewer.Draw(Screen);
                    Screen.SetOffset(offset.left, offset.top);
                }

                var $this = $(this);
                $this.addClass("animated fadeOutUp");
                window.setTimeout(function () {
                    $this.removeClass();
                    $this.css({ display: 'none' });
                }, 1300);
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
            window.setTimeout(function () {
                $('#fullscreen-editor-wrapper').removeClass();
            }, 1300);
        });
        return true;
    };

    FullScreenEditorActionPlugIn.prototype.DeleteFromDOM = function () {
        $('#fullscreen-editor-wrapper').blur();
    };
    return FullScreenEditorActionPlugIn;
})(AssureIt.ActionPlugIn);
