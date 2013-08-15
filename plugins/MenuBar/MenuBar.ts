/// <reference path="../../src/CaseModel.ts" />
/// <reference path="../../src/PlugInManager.ts" />

class MenuBar {

	reDraw: () => void;
	caseViewer: AssureIt.CaseViewer;
	case0: AssureIt.Case;
	node: JQuery;
	serverApi: AssureIt.ServerAPI;

	constructor(caseViewer: AssureIt.CaseViewer, case0: AssureIt.Case, node: JQuery, serverApi: AssureIt.ServerAPI, public plugIn: MenuBarActionPlugIn, reDraw: () => void) {
		this.caseViewer = caseViewer;
		this.case0 = case0;
		this.node = node;
		this.serverApi = serverApi;
		this.reDraw = reDraw;
		this.Init();
	}

	Init(): void {
		var self = this;

		var thisNodeLabel: string = self.node.children('h4').text();
		var thisNodeModel: AssureIt.NodeModel = self.case0.ElementMap[thisNodeLabel];
		var thisNodeType: AssureIt.NodeType = thisNodeModel.Type;

		$('#menu').remove();
		var menu = $('<div id="menu">' +
			'<a href="#" ><img id="commit" src="'+this.serverApi.basepath+'images/commit.png" title="Commit" alt="commit" /></a>' +
			'<a href="#" ><img id="remove" src="'+this.serverApi.basepath+'images/icon.png" title="Remove" alt="remove" /></a>' +
			'<a href="#" ><img id="scale"  src="'+this.serverApi.basepath+'images/scale.png" title="Scale" alt="scale" /></a>' +
			'</div>');

		var hasContext: boolean = false;

		for(var i: number = 0; i < thisNodeModel.Children.length; i++) {
			if(thisNodeModel.Children[i].Type == AssureIt.NodeType.Context) {
				hasContext = true;
			}
		}
		switch(thisNodeType) {
			case AssureIt.NodeType.Goal:
				if(!hasContext) {
					menu.append('<a href="#" ><img id="context"  src="'+this.serverApi.basepath+'images/context.png" title="Context" alt="context" /></a>');
				}
				menu.append('<a href="#" ><img id="strategy" src="'+this.serverApi.basepath+'images/strategy.png" title="Strategy" alt="strategy" /></a>');
				menu.append('<a href="#" ><img id="evidence" src="'+this.serverApi.basepath+'images/evidence.png" title="Evidence" alt="evidence" /></a>');
				break;
			case AssureIt.NodeType.Strategy:
				menu.append('<a href="#" ><img id="goal"     src="'+this.serverApi.basepath+'images/goal.png" title="Goal" alt="goal" /></a>');
				if (!hasContext) {
					menu.append('<a href="#" ><img id="context"  src="'+this.serverApi.basepath+'images/context.png" title="Context" alt="context" /></a>');
				}
				break;
			case AssureIt.NodeType.Evidence:
				if (!hasContext) {
					menu.append('<a href="#" ><img id="context"  src="'+this.serverApi.basepath+'images/context.png" title="Context" alt="context" /></a>');
				}
				break;
			default:
				break;
		}

		menu.css({ position: 'absolute', top: self.node.position().top + self.node.height() + 5 , display: 'block', opacity: 0 });
		menu.hover(function () {}, function () { $(this).remove(); });
		(<any>menu).jqDock({
			align: 'bottom',
			fadeIn: 200,
			idle: 1500,
			size: 45,
			distance: 60,
			labels: 'tc',
			duration: 500,
			source: function () { return this.src.replace(/(jpg|gif)$/, 'png'); },
			onReady: function () { menu.css({ left: self.node.position().left + (self.node.outerWidth() - menu.width()) / 2 }); },
		});
		menu.appendTo($('#layer2'));
		this.plugIn.plugInManager.UseUILayer(this.plugIn);
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
		var $svg = $('#layer0');
		var $layer1 = $('#layer1');
		var scale = 1.0;
		var top = Number($layer1.css('top').replace("px",""));
		var left = Number($layer1.css('left').replace("px",""));
		var offset = 10;
		if(this.plugIn.isLargeScale) {
			this.plugIn.isLargeScale = false;
			top = top - offset * (0.1 / 1.0);
			left = left - offset *(0.1 / 1.0);
		} else {
			scale = 0.1;
			top = top - offset * (1.0 / 0.1);
			left = left - offset * (1.0 / 0.1);
			this.plugIn.isLargeScale = true;
		}
		console.log(top+":"+left);
		$svg.attr("transform", "scale(" + scale + ")");
		$layer1.css("transform", "scale(" + scale + ")");
		$layer1.css("-moz-transform", "scale(" + scale + ")");
		$layer1.css("-webkit-transform", "scale(" + scale + ")");
		$layer1.css({top: 0+"px", left: 0+"px"});
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

	constructor(plugInManager: AssureIt.PlugInManager) {
		super(plugInManager);
	}

	IsEnabled(caseViewer: AssureIt.CaseViewer, case0: AssureIt.Case): boolean {
		return true;
	}

	Delegate(caseViewer: AssureIt.CaseViewer, case0: AssureIt.Case, serverApi: AssureIt.ServerAPI): boolean {
		var self = this;
		var timeoutId: number;

		$('.node').unbind('mouseenter').unbind('mouseleave'); // FIXME: this line may cause other plugin's event handler.
		$('.node').hover(function () {
			var node = $(this);

			timeoutId = setTimeout(function () {
				var menuBar: MenuBar = new MenuBar(caseViewer, case0, node, serverApi, self, function() {
					self.ReDraw(caseViewer);
				});
				menuBar.SetEventHandlers();

				var commitWindow: CommitWindow = new CommitWindow();
				commitWindow.SetEventHandlers(caseViewer, case0, serverApi);
			}, 1000);
		}, function () { clearTimeout(timeoutId); /* TODO: add more action */ });
		return true;
	}

	DeleteFromDOM(): void {
		$('#menu').remove();
	}
}
