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

	IsFirstCalled: boolean;
	Timer: number;
	LatestDataMap: { [index: string]: any };
	ConditionMap: { [index: string]: string };
	EvidenceNodeMap: { [index: string]: AssureIt.NodeModel };

	constructor(plugInManager: AssureIt.PlugInManager) {
		super(plugInManager);
		this.IsFirstCalled = true;
		this.LatestDataMap = {};
		this.ConditionMap = {};
		this.EvidenceNodeMap = {};
	}

	IsEnabled(caseViewer: AssureIt.CaseViewer, nodeModel: AssureIt.NodeModel) : boolean {
		return true;
	}

	Delegate(caseViewer: AssureIt.CaseViewer, nodeModel: AssureIt.NodeModel, element: JQuery) : boolean {
		var notes : AssureIt.CaseNote[] = nodeModel.Notes;
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

		function isEmptyNode(node: AssureIt.NodeModel): boolean {
			if(node.Statement == "" &&
					node.Annotations.length == 0 &&
					node.Notes.length == 0 &&
					node.Children.length == 0) {
				return true;
			}

			return false;
		}

		for(var i: number = 0; i < locations.length; i++) {
			var location: string = locations[i];

			for(var j: number = 0; j < conditions.length; j++) {
				var condition: string = conditions[j];
				var variable: string = extractVariableFromCondition(condition);
				var key: string = variable+"@"+location;
				this.LatestDataMap[key] = null;
				this.ConditionMap[key] = condition;

				var brothers: AssureIt.NodeModel[] = nodeModel.Parent.Children;
				for(var i: number = 0; i < brothers.length; i++) {
					if(isEmptyNode(brothers[i])) {
						this.EvidenceNodeMap[key] = brothers[i];
						break;
					}
				}
			}
		}

		var self = this;
		var api = new AssureIt.RECAPI("http://54.250.206.119/rec");

		function collectLatestData() {
			for(var key in self.LatestDataMap) {
				var variable: string = key.split("@")[0];
				var location: string = key.split("@")[1];
				var latestData = api.getLatestData(location, variable);
				if(latestData == null) {
					// TODO: alert
					console.log("latest data is null");
				}
				self.LatestDataMap[key] = latestData;
			}
		}

		function showResult(key: string, result: boolean) {
			var node: AssureIt.NodeModel = self.EvidenceNodeMap[key];

			if(result) { /* success */
				node.Notes = [{ "Name": "Notes",
								"Body": { "status": "Success",
										  /* variable: response.data, */
										  /* "timestamp": response.timestamp */ }
							 }];
			}
			else { /* fail */
				node.Notes = [{ "Name": "Notes",
								"Body": { "status": "Fail",
										  /* variable: response.data, */
										  /* "timestamp": response.timestamp */ }
							 }];
			}

			var HTMLRenderPlugIn: Function = caseViewer.GetPlugInHTMLRender("note");
			var element: JQuery = caseViewer.ViewMap[node.Label].HTMLDoc.DocBase;
			HTMLRenderPlugIn(caseViewer, node, element);
		}

		function evaluateCondition() {
			for(var key in self.ConditionMap) {
				var variable: string = key.split("@")[0];
				var script: string = "var "+variable+"="+self.LatestDataMap[key].data+";";
				script += self.ConditionMap[key]+";";
				var result: boolean = eval(script);   // FIXME: don't use eval()

				showResult(key, result);
			}
		}

		if(this.IsFirstCalled) {
			this.Timer = setInterval(function() {
				collectLatestData();
				evaluateCondition();
			}, 3000);
			this.IsFirstCalled = false;
		}

		return true;
	}
}
