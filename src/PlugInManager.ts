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
		PatternPlugIn: PatternPlugIn;
		ShortcutKeyPlugIn: ShortcutKeyPlugIn;

		constructor(public plugInManager: PlugInManager) {
			this.ActionPlugIn = null;
			this.CheckerPlugIn = null;
			this.HTMLRenderPlugIn = null;
			this.SVGRenderPlugIn = null;
			this.MenuBarContentsPlugIn = null;
			this.LayoutEnginePlugIn = null;
			this.PatternPlugIn = null;
			this.ShortcutKeyPlugIn = null;
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

	export class PatternPlugIn extends AbstractPlugIn {

		constructor(public plugInManager: PlugInManager) {
			super(plugInManager);
		}

		IsEnabled(caseViewer: CaseViewer, caseModel: NodeModel) : boolean {
			return true;
		}

		Delegate(caseModel: NodeModel) : boolean {
			return true;
		}
	}

	export class ShortcutKeyPlugIn extends AbstractPlugIn {

		constructor(public plugInManager: PlugInManager) {
			super(plugInManager);
		}

		IsEnabled(Case0: Case, serverApi: ServerAPI) : boolean {
			return true;
		}

		RegisterKeyEvents(Case0: Case, serverApi: ServerAPI) : boolean {
			return true;
		}
	}

	export class PlugInManager {

		ActionPlugInMap           : { [index: string]: ActionPlugIn };
		CheckerPlugInMap          : { [index: string]: CheckerPlugIn };
		HTMLRenderPlugInMap       : { [index: string]: HTMLRenderPlugIn };
		SVGRenderPlugInMap        : { [index: string]: SVGRenderPlugIn };
		MenuBarContentsPlugInMap  : { [index: string]: MenuBarContentsPlugIn };
		LayoutEnginePlugInMap     : { [index: string]: LayoutEnginePlugIn };
		PatternPlugInMap          : { [index: string]: PatternPlugIn };
		ShortcutKeyPlugInMap      : { [index: string]: ShortcutKeyPlugIn };

		UILayer: AbstractPlugIn[];
		UsingLayoutEngine: string;

		constructor(public basepath: string) {
			this.ActionPlugInMap = {};
			this.CheckerPlugInMap = {};
			this.HTMLRenderPlugInMap = {};
			this.SVGRenderPlugInMap = {};
			this.MenuBarContentsPlugInMap = {};
			this.LayoutEnginePlugInMap = {};
			this.PatternPlugInMap = {};
			this.ShortcutKeyPlugInMap = {};
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
			if(plugIn.PatternPlugIn) {
				this.SetPatternPlugIn(key, plugIn.PatternPlugIn);
			}
			if(plugIn.ShortcutKeyPlugIn) {
				this.SetShortcutKeyPlugIn(key, plugIn.ShortcutKeyPlugIn);
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

		SetHTMLRenderPlugIn(key: string, HTMLRenderPlugIn: HTMLRenderPlugIn): void {
			this.HTMLRenderPlugInMap[key] = HTMLRenderPlugIn;
		}

		SetSVGRenderPlugIn(key: string, SVGRenderPlugIn: SVGRenderPlugIn): void {
			this.SVGRenderPlugInMap[key] = SVGRenderPlugIn;
		}

		SetMenuBarContentsPlugIn(key: string, MenuBarContentsPlugIn: MenuBarContentsPlugIn): void {
			this.MenuBarContentsPlugInMap[key] = MenuBarContentsPlugIn;
		}

		SetUseLayoutEngine(key: string): void {
			this.UsingLayoutEngine = key;
		}

		SetLayoutEnginePlugIn(key: string, LayoutEnginePlugIn: LayoutEnginePlugIn): void {
			this.LayoutEnginePlugInMap[key] = LayoutEnginePlugIn;
		}

		GetLayoutEngine(): LayoutEnginePlugIn {
			return this.LayoutEnginePlugInMap[this.UsingLayoutEngine];
		}

		SetPatternPlugIn(key: string, PatternPlugIn: PatternPlugIn): void {
			this.PatternPlugInMap[key] = PatternPlugIn;
		}

		SetShortcutKeyPlugIn(key: string, ShortcutKeyPlugIn: ShortcutKeyPlugIn): void {
			this.ShortcutKeyPlugInMap[key] = ShortcutKeyPlugIn;
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
			for (var key in this.MenuBarContentsPlugInMap) {
				var contents: MenuBarContentsPlugIn = this.MenuBarContentsPlugInMap[key];
				if(contents.IsEnabled(caseViewer, caseModel)) {
					contents.Delegate(caseViewer, caseModel, DocBase, serverApi);
				}
			}
		}

		RegisterKeyEvents(Case0: Case, serverApi: ServerAPI): void {
			for(var key in this.ShortcutKeyPlugInMap) {
				var plugin: ShortcutKeyPlugIn = this.ShortcutKeyPlugInMap[key];
				if(plugin.IsEnabled(Case0, serverApi)) {
					plugin.RegisterKeyEvents(Case0, serverApi);
				}
			}
		}
	}
}
