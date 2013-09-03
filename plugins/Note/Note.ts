/// <reference path="../../src/CaseModel.ts" />
/// <reference path="../../src/CaseViewer.ts" />
/// <reference path="../../src/PlugInManager.ts" />

class NotePlugIn extends AssureIt.PlugInSet {

	constructor(public plugInManager: AssureIt.PlugInManager) {
		super(plugInManager);
		this.HTMLRenderPlugIn = new NoteHTMLRenderPlugIn(plugInManager);
	}

}

class NoteHTMLRenderPlugIn extends AssureIt.HTMLRenderPlugIn {
	IsEnabled(caseViewer: AssureIt.CaseViewer, nodeModel: AssureIt.NodeModel) : boolean {
		return true;
	}

	Delegate(caseViewer: AssureIt.CaseViewer, nodeModel: AssureIt.NodeModel, element: JQuery) : boolean {
		element.children("p").remove()

		for (var i: number = 0; i < nodeModel.Notes.length; i++) {
			var note: AssureIt.CaseNote = nodeModel.Notes[i];

			for(var key in note.Body) {
				$('<p style="color: DarkOliveGreen">' + key + ": " + note.Body[key] + '</p>').appendTo(element);
			}
		}
		return true;
	}
}
