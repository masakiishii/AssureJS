/// <reference path="CaseModel.ts" />
/// <reference path="CaseViewer.ts" />
/// <reference path="ServerApi.ts" />

class PlugIn {
	Name : string;
}

class ActionPlugIn extends PlugIn {
	EventName   : string;
	EventTarget : string;

	IsEnabled(caseViewer: CaseViewer, case0: Case) : boolean {
		return true;
	}

	Delegate(caseViewer: CaseViewer, case0: Case, serverApi: ServerAPI)  : boolean {
		return true;
	}
}

class CheckerPlugIn extends PlugIn {
	IsEnabled(caseModel: CaseModel, EventType: string) : boolean {
		return true;
	}

	Delegate(caseModel: CaseModel, y: string, z: string) : boolean {
		return true;
	}
}

class HTMLRenderPlugIn extends PlugIn {
	IsEnabled(caseViewer: CaseViewer, caseModel: CaseModel) : boolean {
		return true;
	}

	Delegate(caseViewer: CaseViewer, caseModel: CaseModel, element: JQuery) : boolean {
		return true;
	}
}

class PlugInManager {

	ActionPlugIns : ActionPlugIn[];
	DefaultCheckerPlugIns : CheckerPlugIn[];
	CheckerPlugInMap : { [index: string]: CheckerPlugIn};
	DefaultHTMLRenderPlugIns : HTMLRenderPlugIn[];
	HTMLRenderPlugInMap : { [index: string]: HTMLRenderPlugIn};

	constructor() {
		this.ActionPlugIns = [];
		this.DefaultCheckerPlugIns = [];
		this.CheckerPlugInMap = {};
		this.DefaultHTMLRenderPlugIns = [];
		this.HTMLRenderPlugInMap = {};
	}


	AddActionPlugIn(key: string, actionPlugIn: ActionPlugIn) {
		this.ActionPlugIns.push(actionPlugIn);
	}

	RegisterActionEventListeners(CaseViewer: CaseViewer, case0: Case, serverApi: ServerAPI): void {
		for(var i: number = 0; i < this.ActionPlugIns.length; i++) {
			if(this.ActionPlugIns[i].IsEnabled(CaseViewer, case0)) {
				this.ActionPlugIns[i].Delegate(CaseViewer, case0, serverApi);
			}
		}
	}
	/**
	AddCheckerPlugIn(key: string, f : (x : CaseModel, y: string, z : any) => boolean) {
		if(key == null) {
			this.DefaultCheckerPlugIns.push(f);
		}
		else {
			this.CheckerPlugInMap[key] = f;
		}
	}


	AddDefaultActionPlugIn(f : (x : CaseModel, y: string, z : any) => boolean) {
		if(key == null) {
			this.DefaultCheckerPlugIns.push(f);
		}
		else {
			this.CheckerPlugInMap[key] = f;
		}
	}
	**/

	AddHTMLRenderPlugIn(key: string, HTMLRenderPlugIn: HTMLRenderPlugIn) {
		this.HTMLRenderPlugInMap[key] = HTMLRenderPlugIn;
	}
}
/** this is sample of ActionPlugIn */
/*
function OnClickApproval(CaseModel: CaseModel) : boolean {
	CaseModel.SetAnnotation('@approval', CaseModel.Case.UserName);
	return true; // resize, redraw
}

*/
