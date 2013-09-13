/// <reference path="../../src/CaseModel.ts" />
/// <reference path="../../src/CaseEncoder.ts" />
/// <reference path="../../src/PlugInManager.ts" />

class MenuBar {

	caseViewer: AssureIt.CaseViewer;
	case0: AssureIt.Case;
	node: JQuery;
	serverApi: AssureIt.ServerAPI;
	model: AssureIt.NodeModel;
	menu: JQuery;

	constructor(caseViewer: AssureIt.CaseViewer, model: AssureIt.NodeModel, case0: AssureIt.Case, node: JQuery, serverApi: AssureIt.ServerAPI, public plugIn: MenuBarActionPlugIn) {
		this.caseViewer = caseViewer;
		this.model = model;
		this.case0 = case0;
		this.node = node;
		this.serverApi = serverApi;
		this.Init();
	}

	Init(): void {

		var thisNodeType: AssureIt.NodeType = this.model.Type;

		$('#menu').remove();
		this.menu = $('<div id="menu">' +
			//'<a href="#" ><img id="scale"  src="'+this.serverApi.basepath+'images/scale.png" title="Scale" alt="scale" /></a>' +
			'</div>');

		if(this.case0.IsEditable()) { //TODO login
		//this.menu.append('<a href="#" ><img id="center" src="'+this.serverApi.basepath+'images/scale.png" title="Center" alt="center" /></a>');
		this.menu.append('<a href="#" ><img id="commit" src="'+this.serverApi.basepath+'images/commit.png" title="Commit" alt="commit" /></a>');
		if(this.node.children("h4").text() != this.case0.ElementTop.Label) {
			this.menu.append('<a href="#" ><img id="remove" src="'+this.serverApi.basepath+'images/remove.png" title="Remove" alt="remove" /></a>');
		}
		var hasContext: boolean = false;

		for(var i: number = 0; i < this.model.Children.length; i++) {
			if(this.model.Children[i].Type == AssureIt.NodeType.Context) {
				hasContext = true;
			}
		}
		switch(thisNodeType) {
			case AssureIt.NodeType.Goal:
				if(!hasContext) {
					this.menu.append('<a href="#" ><img id="context"  src="'+this.serverApi.basepath+'images/context.png" title="Context" alt="context" /></a>');
				}
				this.menu.append('<a href="#" ><img id="strategy" src="'+this.serverApi.basepath+'images/strategy.png" title="Strategy" alt="strategy" /></a>');
				this.menu.append('<a href="#" ><img id="evidence" src="'+this.serverApi.basepath+'images/evidence.png" title="Evidence" alt="evidence" /></a>');
				break;
			case AssureIt.NodeType.Strategy:
				this.menu.append('<a href="#" ><img id="goal"     src="'+this.serverApi.basepath+'images/goal.png" title="Goal" alt="goal" /></a>');
				if (!hasContext) {
					this.menu.append('<a href="#" ><img id="context"  src="'+this.serverApi.basepath+'images/context.png" title="Context" alt="context" /></a>');
				}
				break;
			case AssureIt.NodeType.Evidence:
				if (!hasContext) {
					this.menu.append('<a href="#" ><img id="context"  src="'+this.serverApi.basepath+'images/context.png" title="Context" alt="context" /></a>');
				}
				break;
			default:
				break;
		}
		}
	}

	AddNode(nodeType: AssureIt.NodeType): void {
		var thisNodeView: AssureIt.NodeView = this.caseViewer.ViewMap[this.node.children("h4").text()];
		var newNodeModel: AssureIt.NodeModel = new AssureIt.NodeModel(this.case0, thisNodeView.Source, nodeType, null, null);
		this.case0.SaveIdCounterMax(this.case0.ElementTop);
		this.caseViewer.ViewMap[newNodeModel.Label] = new AssureIt.NodeView(this.caseViewer, newNodeModel);
		this.caseViewer.ViewMap[newNodeModel.Label].ParentShape = this.caseViewer.ViewMap[newNodeModel.Parent.Label];

		var parentLabel: string = newNodeModel.Parent.Label;
		var parentOffSet = $("#"+parentLabel).offset();
		this.caseViewer.Draw();
//		this.caseViewer.Screen.SetOffset(0, 0);
		var CurrentParentView = this.caseViewer.ViewMap[parentLabel];
		this.caseViewer.Screen.SetOffset(parentOffSet.left-CurrentParentView.AbsX, parentOffSet.top-CurrentParentView.AbsY);
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
		var parentLabel: string = thisNodeModel.Parent.Label;
		var parentOffSet = $("#"+parentLabel).offset();

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

		this.caseViewer.Draw();
		var CurrentParentView = this.caseViewer.ViewMap[parentLabel];
		this.caseViewer.Screen.SetOffset(parentOffSet.left-CurrentParentView.AbsX, parentOffSet.top-CurrentParentView.AbsY);
	}

	Commit(): void {
		(<any>$('#modal-commit')).dialog('open');
	}

	Center(): void {
		var thisLabel: string = this.node.children("h4").text();
		var thisNodeView: AssureIt.NodeView = this.caseViewer.ViewMap[thisLabel];
		var screenManager = this.caseViewer.Screen;
		screenManager.SetCaseCenter(thisNodeView.AbsX, thisNodeView.AbsY, thisNodeView.HTMLDoc);
	}

	/* obsolete */
	Scale(): void {
		var timers: number[] = [];
		var screenManager = this.caseViewer.Screen;
		var caseViewer = this.caseViewer;
		var editorIsActive: boolean = false;

		var svgwidth = screenManager.GetCaseWidth();
		var svgheight = screenManager.GetCaseHeight();
		var bodywidth = screenManager.GetWidth();
		var bodyheight = screenManager.GetHeight();

		var scaleWidth = bodywidth / svgwidth;
		var scaleHeight = bodyheight / svgheight;

		var scaleRate = Math.min(scaleWidth, scaleHeight);
		if(scaleRate >= 1.0) {
			return;
		}

		var startZoom = (logicalOffsetX: number, logicalOffsetY: number, initialS: number, target: number, duration: number) => {
			var cycle = 1000/30;
			var cycles = duration / cycle;
			var initialX = screenManager.GetLogicalOffsetX();
			var initialY = screenManager.GetLogicalOffsetY();
			var deltaS = (target - initialS) / cycles;
			var deltaX = (logicalOffsetX - initialX) / cycles;
			var deltaY = (logicalOffsetY - initialY)  / cycles;

			var currentS = initialS;
			var currentX = initialX;
			var currentY = initialY;
			var count = 0;
			var zoom = ()=>{
				if(count < cycles){
					count += 1;
					currentS += deltaS;
					currentX += deltaX;
					currentY += deltaY;
					screenManager.SetLogicalOffset(currentX, currentY, currentS);
					setTimeout(zoom, cycle);
				}else{
					screenManager.SetLogicalOffset(logicalOffsetX, logicalOffsetY, target);
				}
			}
			zoom();
		}

		startZoom(screenManager.GetLogicalOffsetX(), screenManager.GetLogicalOffsetY(), 1.0, scaleRate, 500);

		$(".node").unbind();

		//var CancelClickEvent: (ev: JQueryEventObject) => void = function(ev: JQueryEventObject): void {
		//	var timer: number = timers.pop();

		//	while(timer) {
		//		clearTimeout(timer);
		//		timer = timers.pop();
		//	}

		//	if(ev.type == "dblclick") {
		//		editorIsActive = true;
		//	}
		//}

		//var EscapeFromEditor: (ev: JQueryEventObject) => void = function(ev: JQueryEventObject): void {
		//	if(ev.keyCode = 27 /* ESC */) {
		//		editorIsActive = false;
		//	}
		//}

		var ScaleDown: (e:any) => void = function(e): void {
			if(!editorIsActive) {
				timers.push(setTimeout(function() {
					var x = screenManager.CalcLogicalOffsetXFromPageX(e.pageX);
					var y = screenManager.CalcLogicalOffsetYFromPageY(e.pageY);
					startZoom(x, y, scaleRate, 1.0, 500);
					$("#background").unbind("dblclick", ScaleDown);
					//$("#background").unbind("dblclick", CancelClickEvent);
					//$("#background").unbind("mousemove", CancelClickEvent);
					//$("#fullscreen-editor-wrapper").unbind("keydown", EscapeFromEditor);
					caseViewer.Draw();
				}, 500));
			}
			else {
				editorIsActive = false;
			}
		}

		$("#background").dblclick(ScaleDown);
		//$("#background").mousemove(CancelClickEvent);
		//$("#fullscreen-editor-wrapper").keydown(EscapeFromEditor);
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
			$('#menu').remove();
		});

		$('#commit').click(() => {
			this.Commit();
		});

//		$('#scale').click(() => {
//			this.Scale();
//		});

		$('#center').click(() => {
			this.Center();
		});

	}

}

class CommitWindow {

	defaultMessage: string = "Type your commit message...";

	constructor() {
		this.Init();
	}

	Init(): void {
		$('#modal-commit').remove();
		var modal = $('<div id="modal-commit" title="Commit Message" />');
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
			var encoder : AssureIt.CaseEncoder = new AssureIt.CaseEncoder();
			var contents : string = encoder.ConvertToASN(case0.ElementTop, false);
			serverApi.Commit(contents, $("#message_box").val(), case0.CommitId);
			case0.SetModified(false);
			window.location.reload(); //FIXME
		});
	}

}

class MenuBarPlugIn extends AssureIt.PlugInSet {

	constructor(plugInManager: AssureIt.PlugInManager) {
		super(plugInManager);
		this.ActionPlugIn = new MenuBarActionPlugIn(plugInManager);
	}

}

class MenuBarActionPlugIn extends AssureIt.ActionPlugIn {
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
			//console.log(label);
			var model: AssureIt.NodeModel = case0.ElementMap[label];
			var menuBar: MenuBar = new MenuBar(caseViewer, model, case0, node, serverApi, self);
			menuBar.menu.appendTo($('#layer2'));
			menuBar.menu.hover(function () {
				clearTimeout(self.timeoutId);
			}, function () {
				$(menuBar.menu).remove();
			});
			self.plugInManager.UseUILayer(self);
			menuBar.SetEventHandlers();

			var commitWindow: CommitWindow = new CommitWindow();
			commitWindow.SetEventHandlers(caseViewer, case0, serverApi);
			self.plugInManager.InvokePlugInMenuBarContents(caseViewer, model, menuBar.menu, serverApi);

			var refresh = () => {
				var menutop = node.position().top / caseViewer.Screen.GetScale() + node.height() + 5;
				var menuleft = node.position().left / caseViewer.Screen.GetScale()+(node.outerWidth()-menuBar.menu.width())/ 2;
				menuBar.menu.css({ position: 'absolute', top: menutop , display: 'block', opacity: 0 });
				menuBar.menu.css(
					{ left: menuleft });
			};
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
				onReady: refresh,
			});
			menuBar.menu.click(refresh);
		}, function () { /* FIXME: don't use setTimeout() */
			self.timeoutId = setTimeout(function() {
				$('#menu').remove();
			}, 10);
		});
		return true;
	}

	DeleteFromDOM(): void {
		$('#menu').remove();
	}
}
