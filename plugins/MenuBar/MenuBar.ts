/// <reference path="../../src/CaseModel.ts" />
/// <reference path="../../src/PlugInManager.ts" />

function AddNode(caseViewer: AssureIt.CaseViewer, case0: AssureIt.Case, element: JQuery, nodeType: AssureIt.NodeType): void {
	var thisNodeView: AssureIt.NodeView = caseViewer.ViewMap[element.children("h4").text()];
	var newNodeModel: AssureIt.NodeModel = new AssureIt.NodeModel(case0, thisNodeView.Source, nodeType, null, null);
	case0.SaveIdCounterMax(case0.ElementTop);
	caseViewer.ViewMap[newNodeModel.Label] = new AssureIt.NodeView(caseViewer, newNodeModel);
	caseViewer.ViewMap[newNodeModel.Label].ParentShape = caseViewer.ViewMap[newNodeModel.Parent.Label];
	caseViewer.Resize();

	var backgroundlayer = <HTMLDivElement>document.getElementById("background");
	var shapelayer = <SVGGElement><any>document.getElementById("layer0");
	var contentlayer = <HTMLDivElement>document.getElementById("layer1");
	var controllayer = <HTMLDivElement>document.getElementById("layer2");

	var Screen = new AssureIt.ScreenManager(shapelayer, contentlayer, controllayer, backgroundlayer);
	caseViewer.Draw(Screen);
}

class MenuBarPlugIn extends AssureIt.ActionPlugIn {
	IsEnabled(caseViewer: AssureIt.CaseViewer, case0: AssureIt.Case): boolean {
		return true;
	}

	static DelegateInvoked: boolean = false;

	Delegate(caseViewer: AssureIt.CaseViewer, case0: AssureIt.Case, serverApi: AssureIt.ServerAPI): boolean {
		if (MenuBarPlugIn.DelegateInvoked) return;
		$('.node').hover(function () {
			var node = $(this);
			$('#menu').remove();
			var p = node.position();
			var j = $('<div id="menu">' +
				'<a href="#" ><img id="goal" src="images/icon.png" title="Goal" alt="goal" /></a>' +
				'<a href="#" ><img id="context" src="images/icon.png" title="Context" alt="context" /></a>' +
				'<a href="#" ><img id="strategy" src="images/icon.png" title="Strategy" alt="strategy" /></a>' +
				'<a href="#" ><img id="evidence" src="images/icon.png" title="Evidence" alt="evidence" /></a></div>');

			j.appendTo($('#layer2'));
			j.css({ position: 'absolute', top: p.top + 75, display: 'none', opacity: 0 });

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

			(<any>$('#menu')).jqDock({
				align: 'bottom',
				fadeIn: 200,
				idle: 1500,
				size: 48,
				distance: 60,
				labels: 'tc',
				duration: 500,
				source: function () { return this.src.replace(/(jpg|gif)$/, 'png'); },
				onReady: function () { $('#menu').css({ left: node.position().left + (node.outerWidth() - $('#menu').width()) / 2 }); },
			});
			$('#menu').css({ display: 'block' }).hover(function () { }, function () { $(this).remove(); });
		}, () => {
				//			if(menuFlag) {
				//				$('#menu').remove();
				//			}
			});
		MenuBarPlugIn.DelegateInvoked = true;
		return true;
	}
}
