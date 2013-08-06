/// <reference path="../../src/CaseModel.ts" />
/// <reference path="../../src/PlugInManager.ts" />

function ReDraw(caseViewer: AssureIt.CaseViewer): void {
	var backgroundlayer = <HTMLDivElement>document.getElementById("background");
	var shapelayer = <SVGGElement><any>document.getElementById("layer0");
	var contentlayer = <HTMLDivElement>document.getElementById("layer1");
	var controllayer = <HTMLDivElement>document.getElementById("layer2");
	var offset = $("#layer1").offset();

	var Screen = new AssureIt.ScreenManager(shapelayer, contentlayer, controllayer, backgroundlayer);
	caseViewer.Draw(Screen);
	Screen.SetOffset(offset.left, offset.top);
}

function AddNode(caseViewer: AssureIt.CaseViewer, case0: AssureIt.Case, element: JQuery, nodeType: AssureIt.NodeType): void {
	var thisNodeView: AssureIt.NodeView = caseViewer.ViewMap[element.children("h4").text()];
	var newNodeModel: AssureIt.NodeModel = new AssureIt.NodeModel(case0, thisNodeView.Source, nodeType, null, null);
	case0.SaveIdCounterMax(case0.ElementTop);
	caseViewer.ViewMap[newNodeModel.Label] = new AssureIt.NodeView(caseViewer, newNodeModel);
	caseViewer.ViewMap[newNodeModel.Label].ParentShape = caseViewer.ViewMap[newNodeModel.Parent.Label];
	caseViewer.Resize();
	ReDraw(caseViewer);
}

function GetDescendantLabels(labels: string[], children: AssureIt.NodeModel[]): string[] {
	for(var i: number = 0; i < children.length; i++) {
		labels.push(children[i].Label);
		GetDescendantLabels(labels, children[i].Children);
	}
	return labels;
}

function RemoveNode(caseViewer: AssureIt.CaseViewer, case0: AssureIt.Case, element: JQuery): void {
	var thisLabel: string = element.children("h4").text();
	var thisNodeView: AssureIt.NodeView = caseViewer.ViewMap[thisLabel];
	var thisNodeModel: AssureIt.NodeModel = thisNodeView.Source;
	var brotherNodeModels: AssureIt.NodeModel[] = thisNodeModel.Parent.Children;

	for(var i: number = 0; i < brotherNodeModels.length; i++) {
		if(brotherNodeModels[i].Label == thisLabel) {
			brotherNodeModels.splice(i, 1);
		}
	}

	var labels: string[] = [thisLabel];
	labels = GetDescendantLabels(labels, thisNodeModel.Children);

	for(var i: number = 0; i < labels.length; i++) {
		delete case0.ElementMap[labels[i]];
		var nodeView: AssureIt.NodeView = caseViewer.ViewMap[labels[i]];
		nodeView.DeleteHTMLElementRecursive(null, null);
		delete caseViewer.ViewMap[labels[i]];
	}

	caseViewer.Resize();
	ReDraw(caseViewer);
}

function ShowSubMenu(caseViewer: AssureIt.CaseViewer, case0: AssureIt.Case, node: JQuery): void {
	$('#submenu').remove();

	var submenu = $('<div id="submenu">' +
		'<a href="#" ><img id="goal" src="images/icon.png" title="Goal" alt="goal" /></a>' +
		'<a href="#" ><img id="context" src="images/icon.png" title="Context" alt="context" /></a>' +
		'<a href="#" ><img id="strategy" src="images/icon.png" title="Strategy" alt="strategy" /></a>' +
		'<a href="#" ><img id="evidence" src="images/icon.png" title="Evidence" alt="evidence" /></a></div>');
	submenu.css({ position: 'absolute', top: node.position().top, left: node.position().left, display: 'block', opacity: 0 });
	submenu.hover(function() {}, function() { $(this).remove(); });
	(<any>submenu).jqDock({
		align: 'right',
		fadeIn: 200,
		idle: 1500,
		size: 48,
		distance: 60,
		labels: 'tc',
		duration: 500,
		source: function () { return this.src.replace(/(jpg|gif)$/, 'png'); },
	});
	submenu.appendTo($('#layer2'));

	$('#goal').click(function() {
		AddNode(caseViewer, case0, node, AssureIt.NodeType.Goal);
	});

	$('#context').click(function() {
		AddNode(caseViewer, case0, node, AssureIt.NodeType.Context);
	});

	$('#strategy').click(function() {
		AddNode(caseViewer, case0, node, AssureIt.NodeType.Strategy);
	});

	$('#evidence').click(function() {
		AddNode(caseViewer, case0, node, AssureIt.NodeType.Evidence);
	});
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
				'<a href="#" ><img id="add" src="images/icon.png" title="Add" alt="add" /></a>' +
				'<a href="#" ><img id="remove" src="images/icon.png" title="Remove" alt="remove" /></a>' +
				'<a href="#" ><img id="commit" src="images/icon.png" title="Commit" alt="remove" /></a>' +
				'</div>');
			menu.css({ position: 'absolute', top: node.position().top + 75, display: 'block', opacity: 0 });
			menu.hover(function () { }, function () { $(this).remove(); });
			(<any>menu).jqDock({
				align: 'bottom',
				fadeIn: 200,
				idle: 1500,
				size: 48,
				distance: 60,
				labels: 'tc',
				duration: 500,
				source: function () { return this.src.replace(/(jpg|gif)$/, 'png'); },
				onReady: function () { menu.css({ left: node.position().left + (node.outerWidth() - menu.width()) / 2 }); },
			});
			menu.appendTo($('#layer2'));

			$('#add').click(function() {
					ShowSubMenu(caseViewer, case0, node);
			});

			$('#remove').click(function() {
				RemoveNode(caseViewer, case0, node);
			});

		}, function() { /* TODO */ });
		return true;
	}
}
