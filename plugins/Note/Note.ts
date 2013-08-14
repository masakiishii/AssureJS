/// <reference path="../../src/CaseModel.ts" />
/// <reference path="../../src/CaseViewer.ts" />
/// <reference path="../../src/PlugInManager.ts" />

class NotePlugIn extends AssureIt.PlugIn {

	constructor(public plugInManager: AssureIt.PlugInManager) {
		super(plugInManager);
		this.HTMLRenderPlugIn = new NoteHTMLRenderPlugIn(plugInManager);
	}

}

class NoteHTMLRenderPlugIn extends AssureIt.HTMLRenderPlugIn {
	IsEnabled(caseViewer: AssureIt.CaseViewer, nodeModel: AssureIt.NodeModel) : boolean {
		return true;
	}

	Delegate(caseViewer: AssureIt.CaseViewer, nodeModel: AssureIt.NodeModel) : boolean {
		// TODO
		return true;
	}
}
