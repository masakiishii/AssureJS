/// <reference path="../../src/CaseModel.ts" />
/// <reference path="../../src/PlugInManager.ts" />

class MenuBar {

	reDraw: () => void;
	caseViewer: AssureIt.CaseViewer;
	case0: AssureIt.Case;
	node: JQuery;
	serverApi: AssureIt.ServerAPI;
	model: AssureIt.NodeModel;
	menu: JQuery;

	constructor(caseViewer: AssureIt.CaseViewer, model: AssureIt.NodeModel, case0: AssureIt.Case, node: JQuery, serverApi: AssureIt.ServerAPI, public plugIn: MenuBarActionPlugIn, reDraw: () => void) {
		this.caseViewer = caseViewer;
		this.model = model;
		this.case0 = case0;
		this.node = node;
		this.serverApi = serverApi;
		this.reDraw = reDraw;
		this.Init();
	}

	Init(): void {
		var self = this;

		var thisNodeType: AssureIt.NodeType = self.model.Type;

		$('#menu').remove();
		self.menu = $('<div id="menu">' +
			'<a href="#" ><img id="commit" src="'+this.serverApi.basepath+'images/commit.png" title="Commit" alt="commit" /></a>' +
			'<a href="#" ><img id="remove" src="'+this.serverApi.basepath+'images/remove.png" title="Remove" alt="remove" /></a>' +
			'<a href="#" ><img id="scale"  src="'+this.serverApi.basepath+'images/scale.png" title="Scale" alt="scale" /></a>' +
			'</div>');

		var hasContext: boolean = false;

		for(var i: number = 0; i < self.model.Children.length; i++) {
			if(self.model.Children[i].Type == AssureIt.NodeType.Context) {
				hasContext = true;
			}
		}
		switch(thisNodeType) {
			case AssureIt.NodeType.Goal:
				if(!hasContext) {
					self.menu.append('<a href="#" ><img id="context"  src="'+this.serverApi.basepath+'images/context.png" title="Context" alt="context" /></a>');
				}
				self.menu.append('<a href="#" ><img id="strategy" src="'+this.serverApi.basepath+'images/strategy.png" title="Strategy" alt="strategy" /></a>');
				self.menu.append('<a href="#" ><img id="evidence" src="'+this.serverApi.basepath+'images/evidence.png" title="Evidence" alt="evidence" /></a>');
				break;
			case AssureIt.NodeType.Strategy:
				self.menu.append('<a href="#" ><img id="goal"     src="'+this.serverApi.basepath+'images/goal.png" title="Goal" alt="goal" /></a>');
				if (!hasContext) {
					self.menu.append('<a href="#" ><img id="context"  src="'+this.serverApi.basepath+'images/context.png" title="Context" alt="context" /></a>');
				}
				break;
			case AssureIt.NodeType.Evidence:
				if (!hasContext) {
					self.menu.append('<a href="#" ><img id="context"  src="'+this.serverApi.basepath+'images/context.png" title="Context" alt="context" /></a>');
				}
				break;
			default:
				break;
		}
	}

	AddNode(nodeType: AssureIt.NodeType): void {
		var thisNodeView: AssureIt.NodeView = this.caseViewer.ViewMap[this.node.children("h4").text()];
		var newNodeModel: AssureIt.NodeModel = new AssureIt.NodeModel(this.case0, thisNodeView.Source, nodeType, null, null);
		this.case0.SaveIdCounterMax(this.case0.ElementTop);
		this.caseViewer.ViewMap[newNodeModel.Label] = new AssureIt.NodeView(this.caseViewer, newNodeModel);
		this.caseViewer.ViewMap[newNodeModel.Label].ParentShape = this.caseViewer.ViewMap[newNodeModel.Parent.Label];
		this.caseViewer.Resize();
		this.reDraw();
	}

	GetDescendantLabels(labels: string[], children: AssureIt.NodeModel[]): string[] {
		for(var i: number = 0; i < children.length; i++) {
			labels.push(children[i].Label);
			this.GetDescendantLabels(labels, children[i].Children);
		}
		return labels;
	}

	RemoveNode(): void {
		var thisLabel: string = this.node.children("h4").text();
		var thisNodeView: AssureIt.NodeView = this.caseViewer.ViewMap[thisLabel];
		var thisNodeModel: AssureIt.NodeModel = thisNodeView.Source;
		var brotherNodeModels: AssureIt.NodeModel[] = thisNodeModel.Parent.Children;

		for(var i: number = 0; i < brotherNodeModels.length; i++) {
			if(brotherNodeModels[i].Label == thisLabel) {
				brotherNodeModels.splice(i, 1);
			}
		}

		var labels: string[] = [thisLabel];
		labels = this.GetDescendantLabels(labels, thisNodeModel.Children);

		for(var i: number = 0; i < labels.length; i++) {
			delete this.case0.ElementMap[labels[i]];
			var nodeView: AssureIt.NodeView = this.caseViewer.ViewMap[labels[i]];
			nodeView.DeleteHTMLElementRecursive(null, null);
			delete this.caseViewer.ViewMap[labels[i]];
		}

		this.caseViewer.Resize();
		this.reDraw();
	}

	Commit(): void {
		(<any>$('#modal')).dialog('open');
	}

	Scale(): void {
		this.plugIn.isLargeScale = !this.plugIn.isLargeScale;
		this.caseViewer.Screen.SetScale(this.plugIn.isLargeScale ? 1 : 0.1);
		this.reDraw();
	}

	SetEventHandlers(): void {

		$('#goal').click(() => {
			this.AddNode(AssureIt.NodeType.Goal);
		});

		$('#context').click(() => {
			this.AddNode(AssureIt.NodeType.Context);
		});

		$('#strategy').click(() => {
			this.AddNode(AssureIt.NodeType.Strategy);
		});

		$('#evidence').click(() => {
			this.AddNode(AssureIt.NodeType.Evidence);
		});

		$('#remove').click(() => {
			this.RemoveNode();
		});

		$('#commit').click(() => {
			this.Commit();
		});

		$('#scale').click(() => {
			this.Scale();
		});
	}

}

class CommitWindow {

	defaultMessage: string = "Type your commit message...";

	constructor() {
		this.Init();
	}

	Init(): void {
		$('#modal').remove();
		var modal = $('<div id="modal" title="Commit Message" />');
		(<any>modal).dialog({
			autoOpen: false,
			modal: true,
			resizable: false,
			draggable: false,
			show: "clip",
			hide: "fade"
		});

		var messageBox = $('<p align="center"><input id="message_box" type="text" size="30" value="' + this.defaultMessage + '" /></p>');
		messageBox.css('color', 'gray');

		var commitButton  = $('<p align="right"><input id="commit_button" type="button" value="commit"/></p>');
		modal.append(messageBox);
		modal.append(commitButton);
		modal.appendTo($('layer2'));
	}

	SetEventHandlers(caseViewer: AssureIt.CaseViewer, case0: AssureIt.Case, serverApi: AssureIt.ServerAPI): void {
		var self = this;

		$('#message_box').focus(function() {
			if($(this).val() == self.defaultMessage) {
				$(this).val("");
				$(this).css('color', 'black');
			}
		});

		$('#message_box').blur(function() {
			if($(this).val() == "") {
				$(this).val(self.defaultMessage);
				$(this).css('color', 'gray');
			}
		});

		$('#commit_button').click(function() {
			var encoder   = new AssureIt.CaseEncoderDeprecated();
			var converter = new AssureIt.Converter();
			var contents = converter.GenOldJson(encoder.ConvertToOldJson(case0));
			serverApi.Commit(contents, $(this).val, case0.CommitId);
			window.location.reload(); //FIXME
		});
	}

}

class MenuBarPlugIn extends AssureIt.PlugIn {

	constructor(plugInManager: AssureIt.PlugInManager) {
		super(plugInManager);
		this.ActionPlugIn = new MenuBarActionPlugIn(plugInManager);
	}

}

class MenuBarActionPlugIn extends AssureIt.ActionPlugIn {
	isLargeScale: boolean = false;
	timeoutId: number;

	constructor(plugInManager: AssureIt.PlugInManager) {
		super(plugInManager);
	}

	IsEnabled(caseViewer: AssureIt.CaseViewer, case0: AssureIt.Case): boolean {
		return true;
	}

	Delegate(caseViewer: AssureIt.CaseViewer, case0: AssureIt.Case, serverApi: AssureIt.ServerAPI): boolean {
		var self = this;

		$('.node').unbind('mouseenter').unbind('mouseleave'); // FIXME: this line may cause other plugin's event handler.
		$('.node').hover(function () {
			var node = $(this);

			var label: string = node.children('h4').text();
			var model: AssureIt.NodeModel = case0.ElementMap[label];
			var menuBar: MenuBar = new MenuBar(caseViewer, model, case0, node, serverApi, self, function() {
				caseViewer.ReDraw();
			});
			menuBar.menu.appendTo($('#layer2'));
			menuBar.menu.css({ position: 'absolute', top: node.position().top + node.height() + 5 , display: 'block', opacity: 0 });
			menuBar.menu.hover(function () {}, function () { $(menuBar.menu).remove(); });
			self.plugInManager.UseUILayer(self);
			menuBar.SetEventHandlers();

			var commitWindow: CommitWindow = new CommitWindow();
			commitWindow.SetEventHandlers(caseViewer, case0, serverApi);
			self.plugInManager.InvokePlugInMenuBarContents(caseViewer, model, menuBar.menu, serverApi);

			(<any>menuBar.menu).jqDock({
				align: 'bottom',
				fadeIn: 200,
				idle: 1500,
				size: 45,
				distance: 60,
				labels: 'tc',
				duration: 500,
				fadeIn: 1000,
				source: function () { return this.src.replace(/(jpg|gif)$/, 'png'); },
				onReady: function () {
						menuBar.menu.css({ left: node.position().left+(node.outerWidth()-menuBar.menu.width()) / 2 });
					},
			});
		}, function () { /*clearTimeout(self.timeoutId);*/ /* TODO: add more action */ });
		return true;
	}

	DeleteFromDOM(): void {
		//console.log(this.timeoutId);
		//clearTimeout(this.timeoutId);
		$('#menu').remove();
	}
}
