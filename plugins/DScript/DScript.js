/// <reference path="../../src/CaseModel.ts" />
/// <reference path="../../src/CaseViewer.ts" />
/// <reference path="../../src/PlugInManager.ts" />
/// <reference path="../../src/EditorUtil.ts" />
/// <reference path="./DScriptGenerator.ts" />
/// <reference path="./DScriptActionMap.ts" />
var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var DScriptPlugIn = (function (_super) {
    __extends(DScriptPlugIn, _super);
    function DScriptPlugIn(plugInManager) {
        _super.call(this, plugInManager);
        this.plugInManager = plugInManager;
        var plugin = new DScriptEditorPlugIn(plugInManager);
        this.ActionPlugIn = plugin;
        this.MenuBarContentsPlugIn = new DScriptMenuPlugIn(plugInManager, plugin);
    }
    DScriptPlugIn.Use3Pane = true;
    return DScriptPlugIn;
})(AssureIt.PlugInSet);

var DScriptMenuPlugIn = (function (_super) {
    __extends(DScriptMenuPlugIn, _super);
    function DScriptMenuPlugIn(plugInManager, editorPlugIn) {
        _super.call(this, plugInManager);
        this.editorPlugIn = editorPlugIn;
    }
    DScriptMenuPlugIn.prototype.IsEnabled = function (caseViewer, caseModel) {
        return true;
    };

    DScriptMenuPlugIn.prototype.Delegate = function (caseViewer, caseModel, element, serverApi) {
        var _this = this;
        var self = this;
        element.append('<a href="#" ><img id="dscript"  src="' + serverApi.basepath + 'images/dse.png" title="DScript" alt="dscript" /></a>');

        $('#dscript').unbind('dblclick');
        $('#dscript').click(function (ev) {
            var encoder = new AssureIt.CaseEncoder();
            var encoded = encoder.ConvertToASN(caseModel, false);
            _this.editorPlugIn.rootCaseModel = caseModel;
            _this.editorPlugIn.editor_left.setValue(encoded);
            if (caseModel.Case.IsEditable()) {
                _this.editorPlugIn.editor_left.setOption("readOnly", false);
            } else {
                _this.editorPlugIn.editor_left.setOption("readOnly", true);
            }
            $('#dscript-editor-wrapper').css({ display: 'block' }).addClass("animated fadeInDown").focus().one("blur", { node: caseModel }, function (e, node) {
                e.stopPropagation();
                var TopNodeModel = self.editorPlugIn.caseViewer.ElementTop;
                var TopNodeView = self.editorPlugIn.caseViewer.ViewMap[caseModel.Label];
                self.editorPlugIn.caseViewer.DeleteViewsRecursive(TopNodeView);
                if (caseModel.Parent == null) {
                    var caseView = new AssureIt.NodeView(self.editorPlugIn.caseViewer, TopNodeModel);
                    self.editorPlugIn.caseViewer.ViewMap[TopNodeModel.Label] = caseView;
                }
                self.editorPlugIn.caseViewer.Draw();
                var centeringNodeView = self.editorPlugIn.caseViewer.ViewMap[self.editorPlugIn.rootCaseModel.Label];
                caseViewer.Screen.SetCaseCenter(centeringNodeView.AbsX, centeringNodeView.AbsY, centeringNodeView.HTMLDoc);

                var $this = $(this);
                $this.addClass("animated fadeOutUp");
                window.setTimeout(function () {
                    $this.removeClass();
                    $this.css({ display: 'none' });
                }, 1300);
                TopNodeModel.EnableEditFlag();
            }).on("keydown", function (e) {
                if (e.keyCode == 27) {
                    e.stopPropagation();
                    $('#dscript-editor-wrapper').blur();
                    $('#dscript-editor-wrapper').unbind('keydown');
                }
            });
            $('#CodeMirror').focus();
            $('#background').click(function () {
                $('#dscript-editor-wrapper').blur();
            });
            window.setTimeout(function () {
                $('#dscript-editor-wrapper').removeClass();
            }, 1300);
            _this.editorPlugIn.editor_left.refresh();
            _this.editorPlugIn.editor_right.refresh();
            _this.editorPlugIn.GenerateCode();
        });
        return true;
    };
    return DScriptMenuPlugIn;
})(AssureIt.MenuBarContentsPlugIn);

var DScriptEditorPlugIn = (function (_super) {
    __extends(DScriptEditorPlugIn, _super);
    function DScriptEditorPlugIn(plugInManager) {
        this.widgets = [];
        _super.call(this, plugInManager);

        this.editor_left = CodeMirror.fromTextArea(document.getElementById('dscript-editor-left'), {
            lineNumbers: true,
            mode: "text/x-csrc",
            lineWrapping: true
        });
        this.editor_right = CodeMirror.fromTextArea(document.getElementById('dscript-editor-right'), {
            lineNumbers: true,
            mode: "text/x-csrc",
            readOnly: true,
            placeholder: "Generated DScript code goes here.",
            lineWrapping: true
        });
        this.action_table = $('<table id="dscript-action-table"></table>');
        $("#dscript-editor-wrapper").append($("<div>").append(this.action_table));

        $('#dscript-editor-wrapper').css({
            position: 'absolute',
            top: '5%',
            left: '5%',
            height: '90%',
            width: '90%',
            display: 'none',
            background: 'rgba(255, 255, 255, 0.85)'
        });

        if (DScriptPlugIn.Use3Pane) {
            $(this.editor_left.getWrapperElement()).css({
                width: '100%',
                height: '100%'
            });
            $(this.editor_right.getWrapperElement()).css({
                width: '100%',
                height: '100%'
            });
            this.action_table.css({
                width: '100%'
            });
            $('#dscript-editor-left').parent().css({
                width: '50%',
                height: '50%',
                float: 'left',
                display: 'block'
            });
            $('#dscript-editor-right').parent().css({
                width: '50%',
                height: '50%',
                float: 'right',
                display: 'block'
            });
            $('#dscript-action-table').parent().css({
                width: '100%',
                height: '50%',
                display: 'block',
                clear: 'both',
                borderTop: 'solid 1px'
            });
        } else {
            $(this.editor_right.getWrapperElement()).css({
                width: '100%',
                height: '100%'
            });
            this.action_table.css({
                width: '100%'
            });
            $('#dscript-editor-left').parent().css({
                display: 'none'
            });
            $('#dscript-editor-right').parent().css({
                width: '50%',
                height: '100%',
                float: 'right',
                display: 'block'
            });
            $('#dscript-action-table').parent().css({
                width: '50%',
                display: 'block',
                float: 'left'
            });
        }

        this.highlighter = new ErrorHighlight(this.editor_left);
        var self = this;
        this.editor_left.on("change", function (e) {
            self.GenerateCode();
        });
    }
    DScriptEditorPlugIn.prototype.Delegate = function (caseViewer, case0, serverApi) {
        this.caseViewer = caseViewer;
        return true;
    };

    DScriptEditorPlugIn.prototype.updateLineComment = function (editor, widgets, Generator) {
        editor.operation(function () {
            for (var i = 0; i < widgets.length; ++i)
                editor.removeLineWidget(widgets[i]);
            widgets.length = 0;
            for (var i = 0; i < Generator.errorMessage.length; ++i) {
                var error = Generator.errorMessage[i];
                console.log(error);

                //this.highlighter.Highlight(error.LineNumber, error.Message);
                var msg = document.createElement("div");
                var icon = msg.appendChild(document.createElement("span"));
                msg.appendChild(document.createTextNode(error.Message));
                $(msg).css("background", "none repeat scroll 0 0 #FFAAAA");
                widgets.push(editor.addLineWidget(error.LineNumber, msg, { coverGutter: false, noHScroll: true }));
            }
        });
    };

    DScriptEditorPlugIn.prototype.updateActionTable = function (ActionMap) {
        var table = $('#dscript-action-table');
        var table_width = table.parent().width();
        var header = $("<tr><th>state</th><th>fault</th><th>action</th></tr>");
        var tpl = "<tr><td>${state}</td><td>${fault}</td><td>${action}</td></tr>";
        var style = {
            maxWidth: table_width / 3,
            minWidth: table_width / 3,
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            textAlign: 'center',
            whiteSpace: 'nowrap'
        };
        table.children().remove();
        header.children().css(style);
        table.append(header);
        for (var key in ActionMap) {
            var row_src = tpl.replace("${state}", key).replace("${fault}", "*").replace("${action}", ActionMap[key]);
            var row = $(row_src);
            row.children().css(style);
            table.append(row);
        }
    };

    DScriptEditorPlugIn.prototype.GenerateCode = function () {
        var decoder = new AssureIt.CaseDecoder();
        var ASNData = this.editor_left.getValue();
        var Case = this.rootCaseModel.Case;
        var orig_IdCounters = Case.ReserveIdCounters(this.rootCaseModel);
        var orig_ElementMap = Case.ReserveElementMap(this.rootCaseModel);
        var caseModel = decoder.ParseASN(Case, ASNData, this.rootCaseModel);
        if (caseModel == null) {
            this.highlighter.Highlight(decoder.GetASNError().line, decoder.GetASNError().toString());
            Case.IdCounters = orig_IdCounters;
            Case.ElementMap = orig_ElementMap;
        } else {
            var ParentModel = this.rootCaseModel.Parent;
            if (ParentModel != null) {
                caseModel.Parent = ParentModel;
                for (var i in ParentModel.Children) {
                    if (ParentModel.Children[i].Label == this.rootCaseModel.Label) {
                        ParentModel.Children[i] = caseModel;
                    }
                }
            } else {
                this.caseViewer.ElementTop = caseModel;
                Case.ElementTop = caseModel;
            }
            this.rootCaseModel = caseModel;
            this.highlighter.ClearHighlight();
            var Generator = new DScriptGenerator();
            var script = Generator.codegen(caseModel, ASNData);

            //--------------------------------------------------------------------
            var DScriptMap = new DScriptActionMap();
            var ActionMapScript = DScriptMap.GetActionMap(orig_ElementMap, caseModel, ASNData);
            this.updateActionTable(DScriptMap.ActionMap);

            //--------------------------------------------------------------------
            this.updateLineComment(this.editor_left, this.widgets, Generator);
            this.editor_right.setValue(script);
        }
        this.editor_left.refresh();
        this.editor_right.refresh();
    };
    return DScriptEditorPlugIn;
})(AssureIt.ActionPlugIn);
