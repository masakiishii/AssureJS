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
    return DScriptPlugIn;
})(AssureIt.PlugIn);

var DScriptMenuPlugIn = (function (_super) {
    __extends(DScriptMenuPlugIn, _super);
    function DScriptMenuPlugIn(plugInManager, editorPlugIn) {
        _super.call(this, plugInManager);
        this.editorPlugIn = editorPlugIn;
    }
    DScriptMenuPlugIn.prototype.IsEnabled = function (caseViewer, caseModel) {
        for (var i in caseModel.Notes) {
            var note = caseModel.Notes[i];
            if (note.Name == 'Monitor' || note.Name == 'Recovery' || note.Name == 'Condition') {
                return true;
            }
        }
        return false;
    };

    DScriptMenuPlugIn.prototype.Delegate = function (caseViewer, caseModel, element, serverApi) {
        var _this = this;
        element.append('<a href="#" ><img id="dscript"  src="' + serverApi.basepath + 'images/dse.png" title="DScript" alt="dscript" /></a>');

        $('#dscript').unbind('dblclick');
        $('#dscript').click(function (ev) {
            var Generator = new DScriptGenerator(caseModel);
            var script = Generator.codegen();
            console.log(script);

            $('#dscript-editor-wrapper').css({ display: 'block' }).addClass("animated fadeInDown").focus().one("blur", { node: caseModel }, function (e, node) {
                e.stopPropagation();

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
            _this.editorPlugIn.editor_left.setValue(script);
            _this.editorPlugIn.editor_left.refresh();
            _this.editorPlugIn.editor_right.refresh();
            $('#CodeMirror').focus();
            $('#background').click(function () {
                $('#dscript-editor-wrapper').blur();
            });
            window.setTimeout(function () {
                $('#dscript-editor-wrapper').removeClass();
            }, 1300);
        });
        return true;
    };
    return DScriptMenuPlugIn;
})(AssureIt.MenuBarContentsPlugIn);

var DScriptEditorPlugIn = (function (_super) {
    __extends(DScriptEditorPlugIn, _super);
    function DScriptEditorPlugIn(plugInManager) {
        _super.call(this, plugInManager);
        this.editor_left = CodeMirror.fromTextArea(document.getElementById('dscript-editor-left'), {
            lineNumbers: true,
            mode: "text/x-csrc",
            readOnly: true,
            lineWrapping: true
        });
        this.editor_right = CodeMirror.fromTextArea(document.getElementById('dscript-editor-right'), {
            lineNumbers: true,
            mode: "text/x-csrc",
            readOnly: true,
            lineWrapping: true
        });
        $('#dscript-editor-wrapper').css({
            position: 'absolute',
            top: '5%',
            left: '5%',
            height: '90%',
            width: '90%',
            display: 'none',
            background: 'rgba(255, 255, 255, 0.85)'
        });

        $(this.editor_left.getWrapperElement()).css({
            width: '100%',
            height: '100%'
        });
        $(this.editor_right.getWrapperElement()).css({
            width: '100%',
            height: '100%'
        });
        $('#dscript-editor-left').parent().css({
            width: '50%',
            height: '100%',
            float: 'left',
            display: 'block'
        });
        $('#dscript-editor-right').parent().css({
            width: '50%',
            height: '100%',
            float: 'right',
            display: 'block'
        });
    }
    return DScriptEditorPlugIn;
})(AssureIt.ActionPlugIn);
