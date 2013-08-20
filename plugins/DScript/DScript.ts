/// <reference path="../../src/CaseModel.ts" />
/// <reference path="../../src/CaseViewer.ts" />
/// <reference path="../../src/PlugInManager.ts" />
/// <reference path="./DScriptGenerator.ts" />
/* For codemirror */
/// <reference path="../Editor/Editor.ts" />

class DScriptPlugIn extends AssureIt.PlugIn {

	constructor(public plugInManager: AssureIt.PlugInManager) {
		super(plugInManager);
		var plugin: DScriptEditorPlugIn = new DScriptEditorPlugIn(plugInManager);
		this.ActionPlugIn = plugin;
		this.MenuBarContentsPlugIn = new DScriptMenuPlugIn(plugInManager, plugin);
	}

}

class DScriptMenuPlugIn extends AssureIt.MenuBarContentsPlugIn {
	editorPlugIn: DScriptEditorPlugIn;
	constructor(plugInManager: AssureIt.PlugInManager, editorPlugIn: DScriptEditorPlugIn) {
		super(plugInManager);
		this.editorPlugIn = editorPlugIn;
	}

	IsEnabled(caseViewer: AssureIt.CaseViewer, caseModel: AssureIt.NodeModel) : boolean {
		for (var i in caseModel.Notes) {
			var note = caseModel.Notes[i];
			if (note.Name == 'Monitor' || note.Name == 'Recovery' || note.Name == 'Condition') {
				return true;
			}
		}
		return false;
	}

	Delegate(caseViewer: AssureIt.CaseViewer, caseModel: AssureIt.NodeModel, element: JQuery, serverApi: AssureIt.ServerAPI): boolean {
		//console.log("Hello DScript");
		element.append('<a href="#" ><img id="dscript"  src="'+serverApi.basepath+'images/dse.png" title="DScript" alt="dscript" /></a>');

		$('#dscript').unbind('dblclick');
		$('#dscript').click((ev) => {
				var Generator: DScriptGenerator = new DScriptGenerator(caseModel);
				var script: string = Generator.codegen();
				console.log(script);

				$('#dscript-editor-wrapper')
					.css({display: 'block'})
					.addClass("animated fadeInDown")
					.focus()
					.one("blur", {node : caseModel}, function(e: JQueryEventObject, node: JQuery) {
						e.stopPropagation();

						var $this = $(this);
						$this.addClass("animated fadeOutUp");
						window.setTimeout(function() {
							$this.removeClass();
							$this.css({display: 'none'});
						}, 1300);
					})
					.on("keydown", function(e: JQueryEventObject) {
						if(e.keyCode == 27 /* ESC */){
							e.stopPropagation();
							$('#fullscreen-editor-wrapper').blur();
						}
					});
				this.editorPlugIn.editor_left.setValue(script);
				this.editorPlugIn.editor_left.refresh();
				this.editorPlugIn.editor_right.refresh();
				$('#CodeMirror').focus();
				$('#background').click(function(){
					$('#dscript-editor-wrapper').blur(); 
				});
				window.setTimeout(function() {
					$('#dscript-editor-wrapper').removeClass();
				}, 1300);
		});
		return true;
	}
}

class DScriptEditorPlugIn extends AssureIt.ActionPlugIn {
	editor_left:  any;
	editor_right: any;
	constructor(plugInManager: AssureIt.PlugInManager) {
		super(plugInManager);
		this.editor_left = CodeMirror.fromTextArea(document.getElementById('dscript-editor-left'), {
			lineNumbers: true,
			mode: "text/x-csrc",
			readOnly: true,
			lineWrapping: true,
		});
		this.editor_right = CodeMirror.fromTextArea(document.getElementById('dscript-editor-right'), {
			lineNumbers: true,
			mode: "text/x-csrc",
			readOnly: true,
			placeholder: "Generated code goes here.",
			lineWrapping: true,
		});
		$('#dscript-editor-wrapper').css({
			position: 'absolute',
			top: '5%',
			left: '5%',
			height: '90%',
			width: '90%',
			display: 'none',
			background: 'rgba(255, 255, 255, 0.85)',
		});

		/* FIXME Replace it with sophisticated style. */
		$(this.editor_left.getWrapperElement()).css({
			width: '100%',
			height: '100%',
		});
		$(this.editor_right.getWrapperElement()).css({
			width: '100%',
			height: '100%',
		});
		$('#dscript-editor-left').parent()
			.css({
				width: '50%',
				height: '100%',
				float: 'left',
				display: 'block',
			});
		$('#dscript-editor-right').parent()
			.css({
				width: '50%',
				height: '100%',
				float: 'right',
				display: 'block',
			});
	}
}
