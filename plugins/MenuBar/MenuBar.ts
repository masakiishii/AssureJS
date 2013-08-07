/// <reference path="../../src/CaseModel.ts" />
/// <reference path="../../src/PlugInManager.ts" />

class MenuBarAPI {

	caseViewer: AssureIt.CaseViewer;
	case0: AssureIt.Case;
	node: JQuery;
	serverApi: AssureIt.ServerAPI;

	constructor(caseViewer: AssureIt.CaseViewer, case0: AssureIt.Case, node: JQuery, serverApi: AssureIt.ServerAPI) {
		this.caseViewer = caseViewer;
		this.case0 = case0;
		this.node = node;
		this.serverApi = serverApi;
	}

	ReDraw(): void {
		var backgroundlayer = <HTMLDivElement>document.getElementById("background");
		var shapelayer = <SVGGElement><any>document.getElementById("layer0");
		var contentlayer = <HTMLDivElement>document.getElementById("layer1");
		var controllayer = <HTMLDivElement>document.getElementById("layer2");
		var offset = $("#layer1").offset();

		var Screen = new AssureIt.ScreenManager(shapelayer, contentlayer, controllayer, backgroundlayer);
		this.caseViewer.Draw(Screen);
		Screen.SetOffset(offset.left, offset.top);
	}

	AddNode(nodeType: AssureIt.NodeType): void {
		var thisNodeView: AssureIt.NodeView = this.caseViewer.ViewMap[this.node.children("h4").text()];
		var newNodeModel: AssureIt.NodeModel = new AssureIt.NodeModel(this.case0, thisNodeView.Source, nodeType, null, null);
		this.case0.SaveIdCounterMax(this.case0.ElementTop);
		this.caseViewer.ViewMap[newNodeModel.Label] = new AssureIt.NodeView(this.caseViewer, newNodeModel);
		this.caseViewer.ViewMap[newNodeModel.Label].ParentShape = this.caseViewer.ViewMap[newNodeModel.Parent.Label];
		this.caseViewer.Resize();
		this.ReDraw();
	}

	//ShowSubMenu(): void {
	//	var self = this;
	//	$('#submenu').remove();

	//	var submenu = $('<div id="submenu">' +
	//		'<a href="#" ><img id="goal" src="images/icon.png" title="Goal" alt="goal" /></a>' +
	//		'<a href="#" ><img id="context" src="images/icon.png" title="Context" alt="context" /></a>' +
	//		'<a href="#" ><img id="strategy" src="images/icon.png" title="Strategy" alt="strategy" /></a>' +
	//		'<a href="#" ><img id="evidence" src="images/icon.png" title="Evidence" alt="evidence" /></a></div>');
	//	submenu.css({ position: 'absolute', top: this.node.position().top, left: this.node.position().left, display: 'block', opacity: 0 });
	//	submenu.hover(function() {}, function() { $(this).remove(); });
	//	(<any>submenu).jqDock({
	//		align: 'right',
	//		fadeIn: 200,
	//		idle: 1500,
	//		size: 48,
	//		distance: 60,
	//		labels: 'tc',
	//		duration: 500,
	//		source: function () { return this.src.replace(/(jpg|gif)$/, 'png'); },
	//	});
	//	submenu.appendTo($('#layer2'));

	//	$('#goal').click(function() {
	//		self.AddNode(AssureIt.NodeType.Goal);
	//	});

	//	$('#context').click(function() {
	//		self.AddNode(AssureIt.NodeType.Context);
	//	});

	//	$('#strategy').click(function() {
	//		self.AddNode(AssureIt.NodeType.Strategy);
	//	});

	//	$('#evidence').click(function() {
	//		self.AddNode(AssureIt.NodeType.Evidence);
	//	});
	//}

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
		this.ReDraw();
	}

	Commit(): void {
		(<any>$('#commit_window')).dialog('open');
	}

}

class MenuBarPlugIn extends AssureIt.ActionPlugIn {
	IsEnabled(caseViewer: AssureIt.CaseViewer, case0: AssureIt.Case): boolean {
		return true;
	}

	Delegate(caseViewer: AssureIt.CaseViewer, case0: AssureIt.Case, serverApi: AssureIt.ServerAPI): boolean {
		$('.node').unbind('hover');
		$('.node').hover(function () {
			var node = $(this);

			$('#menu').remove();
			var menu = $('<div id="menu">' +
				'<a href="#" ><img id="goal"     src="'+ serverApi.basepath +'/images/icon.png" title="Goal" alt="goal" /></a>' +
				'<a href="#" ><img id="context"  src="'+ serverApi.basepath +'/images/icon.png" title="Context" alt="context" /></a>' +
				'<a href="#" ><img id="strategy" src="'+ serverApi.basepath +'/images/icon.png" title="Strategy" alt="strategy" /></a>' +
				'<a href="#" ><img id="evidence" src="'+ serverApi.basepath +'/images/icon.png" title="Evidence" alt="evidence" /></a>' +
				'<a href="#" ><img id="remove"   src="'+ serverApi.basepath +'/images/icon.png" title="Remove" alt="remove" /></a>' +
				'<a href="#" ><img id="commit"   src="'+ serverApi.basepath +'/images/icon.png" title="Commit" alt="commit" /></a>' +
				'</div>');
			menu.css({ position: 'absolute', top: node.position().top + 75, display: 'block', opacity: 0 });
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
				onReady: function () { menu.css({ left: node.position().left + (node.outerWidth() - menu.width()) / 2 }); },
			});
			menu.appendTo($('#layer2'));

			var menuBarApi: MenuBarAPI = new MenuBarAPI(caseViewer, case0, node, serverApi);

			$('#goal').click(function() {
				menuBarApi.AddNode(AssureIt.NodeType.Goal);
			});

			$('#context').click(function() {
				menuBarApi.AddNode(AssureIt.NodeType.Context);
			});

			$('#strategy').click(function() {
				menuBarApi.AddNode(AssureIt.NodeType.Strategy);
			});

			$('#evidence').click(function() {
				menuBarApi.AddNode(AssureIt.NodeType.Evidence);
			});

			$('#remove').click(function() {
				menuBarApi.RemoveNode();
			});

			$('#commit').click(function() {
				menuBarApi.Commit();
			});

			$('#commit_window').remove();
			var commitWindow = $('<div id="commit_window" title="Commit Message" />');
			(<any>commitWindow).dialog({
				autoOpen: false,
				modal: true,
				resizable: false,
				draggable: false,
				show: "clip",
				hide: "fade"
			});

			var defaultMessage: string = "Type your commit message...";
			var commitMessage = $('<p align="center"><input id="commit_message" type="text" size="30" value="' + defaultMessage + '" /></p>');
			commitMessage.css('color', 'gray');

			var commitButton  = $('<p align="right"><input id="commit_button" type="button" value="commit"/></p>');
			commitWindow.append(commitMessage);
			commitWindow.append(commitButton);
			commitWindow.appendTo($('layer2'));

			$('#commit_message').focus(function() {
				if($(this).val() == defaultMessage) {
					$(this).val("");
					$(this).css('color', 'black');
				}
			});

			$('#commit_message').blur(function() {
				if($(this).val() == "") {
					$(this).val(defaultMessage);
					$(this).css('color', 'gray');
				}
			});

			$('#commit_button').click(function() {
				serverApi.Commit(case0.ElementTop, $(this).val, case0.CommitId);
			});

		}, function() { /* TODO */ });
		return true;
	}
}
