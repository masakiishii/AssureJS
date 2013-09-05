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
		element.children("#note").remove()

		for (var i: number = 0; i < nodeModel.Notes.length; i++) {
			var note: AssureIt.CaseNote = nodeModel.Notes[i];
			var $note = $('<div id="note"></div>');

			$('<p style="color: DarkOliveGreen">' + note.Name + ": " + note.Body["Description"] + '</p>').appendTo($note);

			$note.appendTo(element);
		}

		return true;
	}
}
