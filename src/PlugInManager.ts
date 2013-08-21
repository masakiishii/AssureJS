/// <reference path="CaseModel.ts" />
/// <reference path="CaseViewer.ts" />
/// <reference path="ServerApi.ts" />

module AssureIt {

	export class PlugInSet {

		ActionPlugIn: ActionPlugIn;
		CheckerPlugIn: CheckerPlugIn;
		HTMLRenderPlugIn: HTMLRenderPlugIn;
		SVGRenderPlugIn: SVGRenderPlugIn;
		MenuBarContentsPlugIn: MenuBarContentsPlugIn;
		LayoutEnginePlugIn: LayoutEnginePlugIn;

		constructor(public plugInManager: PlugInManager) {
			this.ActionPlugIn = null;
			this.CheckerPlugIn = null;
			this.HTMLRenderPlugIn = null;
			this.SVGRenderPlugIn = null;
			this.MenuBarContentsPlugIn = null;
			this.LayoutEnginePlugIn = null;
		}
	}

	export class AbstractPlugIn {
		constructor(public plugInManager: PlugInManager) {
		}

		DeleteFromDOM(): void { //TODO
		}

		DisableEvent(caseViewer: CaseViewer, case0: Case, serverApi: ServerAPI)  : void {
		}

	}

	export class ActionPlugIn extends AbstractPlugIn {
		EventName   : string;
		EventTarget : string;

		constructor(public plugInManager: PlugInManager) {
			super(plugInManager);
		}

		IsEnabled(caseViewer: CaseViewer, case0: Case) : boolean {
			return true;
		}

		Delegate(caseViewer: CaseViewer, case0: Case, serverApi: ServerAPI)  : boolean {
			return true;
		}

	}

	export class CheckerPlugIn extends AbstractPlugIn {

		constructor(public plugInManager: PlugInManager) {
			super(plugInManager);
		}

		IsEnabled(caseModel: NodeModel, EventType: string) : boolean {
			return true;
		}

		Delegate(caseModel: NodeModel, y: string, z: string) : boolean {
			return true;
		}
	}

	export class HTMLRenderPlugIn extends AbstractPlugIn {

		constructor(public plugInManager: PlugInManager) {
			super(plugInManager);
		}

		IsEnabled(caseViewer: CaseViewer, caseModel: NodeModel) : boolean {
			return true;
		}

		Delegate(caseViewer: CaseViewer, caseModel: NodeModel, element: JQuery) : boolean {
			return true;
		}
	}

	export class MenuBarContentsPlugIn extends AbstractPlugIn {

		constructor(public plugInManager: PlugInManager) {
			super(plugInManager);
		}

		IsEnabled(caseViewer: CaseViewer, caseModel: NodeModel) : boolean {
			return true;
		}

		Delegate(caseViewer: CaseViewer, caseModel: NodeModel, element: JQuery, serverApi: ServerAPI) : boolean {
			return true;
		}
	}

	export class SVGRenderPlugIn extends AbstractPlugIn {

		constructor(public plugInManager: PlugInManager) {
			super(plugInManager);
		}

		IsEnabled(caseViewer: CaseViewer, elementShape: NodeView /* add args as necessary */) : boolean {
			return true;
		}

		Delegate(caseViewer: CaseViewer, elementShape: NodeView /* add args as necessary */) : boolean {
			return true;
		}
	}

	export class LayoutEnginePlugIn extends AbstractPlugIn {

		constructor(public plugInManager: PlugInManager) {
			super(plugInManager);
		}

		Init(ViewMap: {[index:string]: NodeView}, Element: NodeModel, x: number, y: number, ElementWidth: number): void {
		}

		LayoutAllView(ElementTop: NodeModel, x: number, y: number): void {
		}

		GetContextIndex(Node: NodeModel): number {
			for (var i: number = 0; i < Node.Children.length; i++) {
				if (Node.Children[i].Type == NodeType.Context) {
					return i;
				}
			}
			return -1; 
		}

	}

	export class PlugInManager {

		ActionPlugInMap           : { [index: string]: ActionPlugIn };
		CheckerPlugInMap          : { [index: string]: CheckerPlugIn };
		HTMLRenderPlugInMap       : { [index: string]: HTMLRenderPlugIn };
		SVGRenderPlugInMap        : { [index: string]: SVGRenderPlugIn };
		MenuBarContentsPlugInMap  : { [index: string]: MenuBarContentsPlugIn };
		LayoutEnginePlugInMap     : { [index: string]: LayoutEnginePlugIn };

		UILayer: AbstractPlugIn[];
		UsingLayoutEngine: string;

		constructor(public basepath: string) {
			this.ActionPlugInMap = {};
			this.CheckerPlugInMap = {};
			this.HTMLRenderPlugInMap = {};
			this.SVGRenderPlugInMap = {};
			this.MenuBarContentsPlugInMap = {};
			this.LayoutEnginePlugInMap = {};
			this.UILayer = [];
		}

		SetPlugIn(key: string, plugIn: PlugInSet) {
			if(plugIn.ActionPlugIn) {
				this.SetActionPlugIn(key, plugIn.ActionPlugIn);
			}
			if(plugIn.HTMLRenderPlugIn) {
				this.SetHTMLRenderPlugIn(key, plugIn.HTMLRenderPlugIn);
			}
			if(plugIn.SVGRenderPlugIn) {
				this.SetSVGRenderPlugIn(key, plugIn.SVGRenderPlugIn);
			}
			if(plugIn.MenuBarContentsPlugIn) {
				this.SetMenuBarContentsPlugIn(key, plugIn.MenuBarContentsPlugIn);
			}
			if(plugIn.LayoutEnginePlugIn) {
				this.SetLayoutEnginePlugIn(key, plugIn.LayoutEnginePlugIn);
			}
		}

		SetActionPlugIn(key: string, actionPlugIn: ActionPlugIn) {
			this.ActionPlugInMap[key] = actionPlugIn;
		}

		RegisterActionEventListeners(CaseViewer: CaseViewer, case0: Case, serverApi: ServerAPI): void {
			for(var key in this.ActionPlugInMap) {
				if(this.ActionPlugInMap[key].IsEnabled(CaseViewer, case0)) {
					this.ActionPlugInMap[key].Delegate(CaseViewer, case0, serverApi);
				}else {
					this.ActionPlugInMap[key].DisableEvent(CaseViewer, case0, serverApi);
				}
			}
		}

		SetHTMLRenderPlugIn(key: string, HTMLRenderPlugIn: HTMLRenderPlugIn) {
			this.HTMLRenderPlugInMap[key] = HTMLRenderPlugIn;
		}

		SetSVGRenderPlugIn(key: string, SVGRenderPlugIn: SVGRenderPlugIn) {
			this.SVGRenderPlugInMap[key] = SVGRenderPlugIn;
		}

		SetMenuBarContentsPlugIn(key: string, MenuBarContentsPlugIn: MenuBarContentsPlugIn) {
			this.MenuBarContentsPlugInMap[key] = MenuBarContentsPlugIn;
		}

		SetUseLayoutEngine(key: string) {
			this.UsingLayoutEngine = key;
		}

		SetLayoutEnginePlugIn(key: string, LayoutEnginePlugIn: LayoutEnginePlugIn) {
			this.LayoutEnginePlugInMap[key] = LayoutEnginePlugIn;
		}

		GetLayoutEngine(): LayoutEnginePlugIn {
			return this.LayoutEnginePlugInMap[this.UsingLayoutEngine];
		}

		UseUILayer(plugin :AbstractPlugIn): void {
			var beforePlugin = this.UILayer.pop();
			if(beforePlugin != plugin && beforePlugin) {
				beforePlugin.DeleteFromDOM();
			}
			this.UILayer.push(plugin);
		}

		UnuseUILayer(plugin :AbstractPlugIn): void { //TODO
			var beforePlugin = this.UILayer.pop();
			if(beforePlugin) {
				beforePlugin.DeleteFromDOM();
			}
		}

		InvokePlugInMenuBarContents(caseViewer: CaseViewer, caseModel: NodeModel, DocBase: JQuery, serverApi: ServerAPI): void {
			var pluginMap: { [index: string]: MenuBarContentsPlugIn} = caseViewer.pluginManager.MenuBarContentsPlugInMap;
			for (var key in pluginMap) {
				var contents: MenuBarContentsPlugIn = this.MenuBarContentsPlugInMap[key];
				if(contents.IsEnabled(caseViewer, caseModel)) {
					contents.Delegate(caseViewer, caseModel, DocBase, serverApi);
				}
			}
		}
	}
}
