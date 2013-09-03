/// <reference path="../../src/CaseModel.ts" />
/// <reference path="../../src/CaseViewer.ts" />
/// <reference path="../../src/PlugInManager.ts" />

class MonitorPlugIn extends AssureIt.PlugInSet {

	constructor(public plugInManager: AssureIt.PlugInManager) {
		super(plugInManager);
		this.HTMLRenderPlugIn = new MonitorHTMLRenderPlugIn(plugInManager);
	}

}

class MonitorHTMLRenderPlugIn extends AssureIt.HTMLRenderPlugIn {
	IsEnabled(caseViewer: AssureIt.CaseViewer, caseModel: AssureIt.NodeModel) : boolean {
		return true;
	}

	Delegate(caseViewer: AssureIt.CaseViewer, caseModel: AssureIt.NodeModel, element: JQuery) : boolean {
		var notes : AssureIt.CaseNote[] = caseModel.Notes;
		var locations: string[] = [];
		var conditions: string[] = [];

		for(var i: number = 0; i < notes.length; i++) {
			var body = notes[i].Body;

			if("Location" in body && "Monitor" in body) {
				locations.push(notes[i].Body.Location);
				conditions.push(notes[i].Body.Monitor);
			}

		}

		function extractVariableFromCondition(condtion: string): string {
			var text: string = condition;
			text.replace(/<=/g, " ");
			text.replace(/>=/g, " ");
			text.replace(/</g, " ");
			text.replace(/>/g, " ");

			var words: string[] = text.split(" ");
			var variables: string[] = [];

			for(var i: number = 0; i < words.length; i++) {
				if(!$.isNumeric(words[i])) {
					variables.push(words[i]);
				}
			}

			if(variables.length != 1) {
				// TODO: alert
			}

			return variables[0];
		}

		var api = new AssureIt.RECAPI("http://54.250.206.119/rec");

		for(var i: number = 0; i < locations.length; i++) {
			var location: string = locations[i];

			for(var j: number = 0; i < conditions.length; i++) {
				var condition: string = conditions[j];
				var variable: string = extractVariableFromCondition(condition);

				var response = api.getLatestData(location, variable);
				var script: string = "var "+variable+"="+response.data+";";
				script += condition+";";
				var result: boolean = eval(script);
				console.log(result);
				console.log(caseModel);
			}
		}

		return true;
	}
}
