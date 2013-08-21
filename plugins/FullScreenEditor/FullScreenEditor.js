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
        var plugin = new FullScreenEditorActionPlugIn(plugInManager);
        this.ActionPlugIn = plugin;
        this.MenuBarContentsPlugIn = new FullScreenMenuPlugIn(plugInManager, plugin);
        this.HTMLRenderPlugIn = new FullScreenEditorLayoutPlugIn(plugInManager);
    }
    return FullScreenEditorPlugIn;
})(AssureIt.PlugInSet);

var FullScreenMenuPlugIn = (function (_super) {
    __extends(FullScreenMenuPlugIn, _super);
    function FullScreenMenuPlugIn(plugInManager, editorPlugIn) {
        _super.call(this, plugInManager);
        this.editorPlugIn = editorPlugIn;
    }
    FullScreenMenuPlugIn.prototype.IsEnabled = function (caseViewer, caseModel) {
        return true;
    };

    FullScreenMenuPlugIn.prototype.Delegate = function (caseViewer, caseModel, element, serverApi) {
        element.append('<a href="#" ><img id="fullscreen-menu" src="' + serverApi.basepath + 'images/max.png" title="FullScreen" alt="fullscreen" /></a>');
        $('#fullscreen-menu').unbind('click');
        $('#fullscreen-menu').click(this.editorPlugIn.ShowFullScreenEditor);
        return true;
    };
    return FullScreenMenuPlugIn;
})(AssureIt.MenuBarContentsPlugIn);

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
        this.ShowFullScreenEditor = null;
    }
    FullScreenEditorActionPlugIn.prototype.IsEnabled = function (caseViewer, case0) {
        return true;
    };

    FullScreenEditorActionPlugIn.prototype.Delegate = function (caseViewer, case0, serverApi) {
        var editor = this.editor;
        var self = this;

        if (!this.ShowFullScreenEditor) {
            this.ShowFullScreenEditor = function (ev) {
                ev.stopPropagation();
                self.plugInManager.UseUILayer(self);
                self.isDisplayed = true;

                var encoder = new AssureIt.CaseEncoder();
                var encoded = encoder.ConvertToASN(case0.ElementTop, false);

                var node = $(this);

                $('#fullscreen-editor-wrapper').css({ display: 'block' }).addClass("animated fadeInDown").focus().one("blur", { node: node }, function (e, node) {
                    e.stopPropagation();

                    var label = case0.ElementTop.Label;
                    var orig_model = case0.ElementMap[label];
                    var orig_view = caseViewer.ViewMap[label];
                    var orig_idCounters = case0.IdCounters;
                    var orig_ElementMap = case0.ElementMap;
                    case0.IdCounters = [0, 0, 0, 0, 0];
                    case0.ElementMap = {};
                    var decoder = new AssureIt.CaseDecoder();
                    var new_model = decoder.ParseASN(case0, editor.getValue(), null);

                    if (new_model != null) {
                        orig_view.DeleteHTMLElementRecursive($("#layer0"), $("#layer1"));
                        caseViewer.DeleteViewsRecursive(orig_view);
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
                        caseViewer.ReDraw();
                    } else {
                        case0.ElementMap = orig_ElementMap;
                        case0.IdCounters = orig_idCounters;
                    }

                    var $this = $(this);
                    self.isDisplayed = false;
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
                $('#background').click(function () {
                    $('#fullscreen-editor-wrapper').blur();
                });
                window.setTimeout(function () {
                    if (!self.isDisplayed) {
                        $('#fullscreen-editor-wrapper').css({ display: 'none' });
                    }
                    $('#fullscreen-editor-wrapper').removeClass();
                }, 1300);
            };
        }

        $('#background').unbind('dblclick', this.ShowFullScreenEditor);
        $('#background').dblclick(this.ShowFullScreenEditor);
        return true;
    };

    FullScreenEditorActionPlugIn.prototype.DeleteFromDOM = function () {
        $('#fullscreen-editor-wrapper').blur();
    };
    return FullScreenEditorActionPlugIn;
})(AssureIt.ActionPlugIn);
