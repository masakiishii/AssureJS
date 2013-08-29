/// <reference path="../../src/CaseModel.ts" />
/// <reference path="../../src/CaseViewer.ts" />
/// <reference path="../../src/PlugInManager.ts" />
/// <reference path="./DScriptGenerator.ts" />
/* For codemirror */
/// <reference path="../Editor/Editor.ts" />

class DScriptPlugIn extends AssureIt.PlugInSet {

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
		return true;
	}

	Delegate(caseViewer: AssureIt.CaseViewer, caseModel: AssureIt.NodeModel, element: JQuery, serverApi: AssureIt.ServerAPI): boolean {
		element.append('<a href="#" ><img id="dscript"  src="'+serverApi.basepath+'images/dse.png" title="DScript" alt="dscript" /></a>');

		$('#dscript').unbind('dblclick');
		$('#dscript').click((ev) => {
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
				var encoder : AssureIt.CaseEncoder = new AssureIt.CaseEncoder();
				var encoded = encoder.ConvertToASN(caseModel, false);
				this.editorPlugIn.rootCaseModel = caseModel;
				this.editorPlugIn.editor_left.setValue(encoded);
				//this.editorPlugIn.GenerateCode();
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
	rootCaseModel: AssureIt.NodeModel;
	constructor(plugInManager: AssureIt.PlugInManager) {
		super(plugInManager);
		this.editor_left = CodeMirror.fromTextArea(document.getElementById('dscript-editor-left'), {
			lineNumbers: true,
			mode: "text/x-csrc",
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
		var self = this;
		this.editor_left.on("change", function(e: JQueryEventObject) {
			self.GenerateCode();
			console.log(self.editor_left.getValue());
		});
	}
	GenerateCode() : void {
		var decoder : AssureIt.CaseDecoder = new AssureIt.CaseDecoder();
		var ASNData : string = this.editor_left.getValue();
		var Case: AssureIt.Case = this.rootCaseModel.Case;
		var orig_IdCounters = Case.ReserveIdCounters(this.rootCaseModel);
		var orig_ElementMap = Case.ReserveElementMap(this.rootCaseModel);
		var caseModel = decoder.ParseASN(Case, ASNData, this.rootCaseModel);
		Case.IdCounters = orig_IdCounters;
		Case.ElementMap = orig_ElementMap;

		var Generator: DScriptGenerator = new DScriptGenerator();
		var script: string = Generator.codegen(caseModel);
		this.editor_right.setValue(script);
		this.editor_left.refresh();
		this.editor_right.refresh();
	}
}
