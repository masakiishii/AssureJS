/// <reference path="../../src/CaseModel.ts" />
/// <reference path="../../src/CaseViewer.ts" />
/// <reference path="../../src/PlugInManager.ts" />
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
		return true;
	}

	Delegate(caseViewer: AssureIt.CaseViewer, caseModel: AssureIt.NodeModel, element: JQuery, serverApi: AssureIt.ServerAPI): boolean {
		//console.log("Hello DScript");
		element.append('<a href="#" ><img id="dscript"  src="'+serverApi.basepath+'images/icon.png" title="DScript" alt="dscript" /></a>');

		/*TODO add event handler */
		$('#dscript').click((ev) => {

		});
		return true;
	}
}

class DScriptEditorPlugIn extends AssureIt.ActionPlugIn {
	editor: any;
	constructor(plugInManager: AssureIt.PlugInManager) {
		super(plugInManager);
		/* TODO init textarea */
		this.editor = null;
		//this.editor = CodeMirror.fromTextArea(document.getElementById('dscript-editor'), {
		//	lineNumbers: true,
		//	mode: "text/x-csrc",
		//	readOnly: true,
		//	lineWrapping: true,
		//});
	}
}
