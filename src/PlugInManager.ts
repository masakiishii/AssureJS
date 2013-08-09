/// <reference path="CaseModel.ts" />
/// <reference path="CaseViewer.ts" />
/// <reference path="ServerApi.ts" />

module AssureIt {

	export class PlugIn {

		ActionPlugIn: ActionPlugIn;
		CheckerPlugIn: CheckerPlugIn;
		HTMLRenderPlugIn: HTMLRenderPlugIn;
		SVGRenderPlugIn: SVGRenderPlugIn;

		constructor() {
			this.ActionPlugIn = null;
			this.CheckerPlugIn = null;
			this.HTMLRenderPlugIn = null;
			this.SVGRenderPlugIn = null;
		}
	}

	export class ActionPlugIn {
		EventName   : string;
		EventTarget : string;

		IsEnabled(caseViewer: CaseViewer, case0: Case) : boolean {
			return true;
		}

		Delegate(caseViewer: CaseViewer, case0: Case, serverApi: ServerAPI)  : boolean {
			return true;
		}

		ReDraw(caseViewer: AssureIt.CaseViewer): void {
			var backgroundlayer = <HTMLDivElement>document.getElementById("background");
			var shapelayer = <SVGGElement><any>document.getElementById("layer0");
			var contentlayer = <HTMLDivElement>document.getElementById("layer1");
			var controllayer = <HTMLDivElement>document.getElementById("layer2");
			var offset = $("#layer1").offset();

			var Screen = new AssureIt.ScreenManager(shapelayer, contentlayer, controllayer, backgroundlayer);
			caseViewer.Draw(Screen);
			caseViewer.Resize();
			caseViewer.Draw(Screen);
			Screen.SetOffset(offset.left, offset.top);
		}
	}

	export class CheckerPlugIn {
		IsEnabled(caseModel: NodeModel, EventType: string) : boolean {
			return true;
		}

		Delegate(caseModel: NodeModel, y: string, z: string) : boolean {
			return true;
		}
	}

	export class HTMLRenderPlugIn {
		IsEnabled(caseViewer: CaseViewer, caseModel: NodeModel) : boolean {
			return true;
		}

		Delegate(caseViewer: CaseViewer, caseModel: NodeModel, element: JQuery) : boolean {
			return true;
		}
	}

	export class SVGRenderPlugIn {
		IsEnabled(caseViewer: CaseViewer, elementShape: NodeView /* add args as necessary */) : boolean {
			return true;
		}

		Delegate(caseViewer: CaseViewer, elementShape: NodeView /* add args as necessary */) : boolean {
			return true;
		}

	}

	export class PlugInManager {

		ActionPlugInMap : { [index: string]: ActionPlugIn };
		CheckerPlugInMap : { [index: string]: CheckerPlugIn };
		HTMLRenderPlugInMap : { [index: string]: HTMLRenderPlugIn };
		SVGRenderPlugInMap  : { [index: string]: SVGRenderPlugIn };

		constructor() {
			this.ActionPlugInMap = {};
			this.CheckerPlugInMap = {};
			this.HTMLRenderPlugInMap = {};
			this.SVGRenderPlugInMap = {};
		}

		SetPlugIn(key: string, plugIn: PlugIn) {
			if(plugIn.ActionPlugIn) {
				this.SetActionPlugIn(key, plugIn.ActionPlugIn);
			}
			if(plugIn.HTMLRenderPlugIn) {
				this.SetHTMLRenderPlugIn(key, plugIn.HTMLRenderPlugIn);
			}
			if(plugIn.SVGRenderPlugIn) {
				this.SetSVGRenderPlugIn(key, plugIn.SVGRenderPlugIn);
			}
		}

		SetActionPlugIn(key: string, actionPlugIn: ActionPlugIn) {
			this.ActionPlugInMap[key] = actionPlugIn;
		}

		RegisterActionEventListeners(CaseViewer: CaseViewer, case0: Case, serverApi: ServerAPI): void {
			for(var key in this.ActionPlugInMap) {
				if(this.ActionPlugInMap[key].IsEnabled(CaseViewer, case0)) {
					this.ActionPlugInMap[key].Delegate(CaseViewer, case0, serverApi);
				}
			}
		}
		/**
		AddCheckerPlugIn(key: string, f : (x : NodeModel, y: string, z : any) => boolean) {
			if(key == null) {
				this.DefaultCheckerPlugIns.push(f);
			}
			else {
				this.CheckerPlugInMap[key] = f;
			}
		}


		AddDefaultActionPlugIn(f : (x : NodeModel, y: string, z : any) => boolean) {
			if(key == null) {
				this.DefaultCheckerPlugIns.push(f);
			}
			else {
				this.CheckerPlugInMap[key] = f;
			}
		}
		**/

		SetHTMLRenderPlugIn(key: string, HTMLRenderPlugIn: HTMLRenderPlugIn) {
			this.HTMLRenderPlugInMap[key] = HTMLRenderPlugIn;
		}

		SetSVGRenderPlugIn(key: string, SVGRenderPlugIn: SVGRenderPlugIn) {
			this.SVGRenderPlugInMap[key] = SVGRenderPlugIn;
		}
	}
}
