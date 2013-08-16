/// <reference path="../../src/CaseModel.ts" />
/// <reference path="../../src/CaseViewer.ts" />
/// <reference path="../../src/PlugInManager.ts" />

class DScriptPlugIn extends AssureIt.PlugIn {

	constructor(public plugInManager: AssureIt.PlugInManager) {
		super(plugInManager);
		this.ActionPlugIn = new DScriptEditorPlugIn(plugInManager);
		this.MenuBarContentsPlugIn = new DScriptMenuPlugIn(plugInManager, this.ActionPlugIn);
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
		console.log("Hello DScript");
		element.append('<a href="#" ><img id="dscript"  src="'+serverApi.basepath+'images/icon.png" title="DScript" alt="dscript" /></a>');

		/*TODO add event handler */
		return true;
	}
}

class DScriptEditorPlugIn extends AssureIt.ActionPlugIn {
	constructor(plugInManager: AssureIt.PlugInManager) {
		super(plugInManager);
		/* TODO init textarea */
	}
}
