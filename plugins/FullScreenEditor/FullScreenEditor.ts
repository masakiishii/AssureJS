/// <reference path="../../src/CaseModel.ts" />
/// <reference path="../../src/ServerApi.ts" />
/// <reference path="../../src/PlugInManager.ts" />
/// <reference path="../Editor/Editor.ts" />

//--- CodeMirror

class FullScreenEditorPlugIn extends AssureIt.PlugIn {

	constructor(plugInManager: AssureIt.PlugInManager) {
		super(plugInManager);
		var plugin: FullScreenEditorActionPlugIn = new FullScreenEditorActionPlugIn(plugInManager);
		this.ActionPlugIn = plugin;
		this.MenuBarContentsPlugIn = new FullScreenMenuPlugIn(plugInManager, plugin);
		this.HTMLRenderPlugIn = new FullScreenEditorLayoutPlugIn(plugInManager);
	}

}

class FullScreenMenuPlugIn extends AssureIt.MenuBarContentsPlugIn {
	editorPlugIn: FullScreenEditorActionPlugIn;
	constructor(plugInManager: AssureIt.PlugInManager, editorPlugIn: FullScreenEditorActionPlugIn) {
		super(plugInManager);
		this.editorPlugIn = editorPlugIn;
	}

	IsEnabled(caseViewer: AssureIt.CaseViewer, caseModel: AssureIt.NodeModel): boolean {
		return true;
	}

	Delegate(caseViewer: AssureIt.CaseViewer, caseModel: AssureIt.NodeModel, element: JQuery, serverApi: AssureIt.ServerAPI): boolean {
		element.append('<a href="#" ><img id="fullscreen-menu" src="' + serverApi.basepath + 'images/icon.png" title="FullScreen" alt="fullscreen" /></a>');
		$('#fullscreen-menu').unbind('click');
		$('#fullscreen-menu').click(this.editorPlugIn.ShowFullScreenEditor);
		return true;
	}
}

class FullScreenEditorLayoutPlugIn extends AssureIt.HTMLRenderPlugIn {
	constructor(plugInManager: AssureIt.PlugInManager) {
		super(plugInManager);
	}

	IsEnabled (caseViewer: AssureIt.CaseViewer, caseModel: AssureIt.NodeModel) : boolean {
		return true;
	}

	Delegate(caseViewer: AssureIt.CaseViewer, caseModel: AssureIt.NodeModel, element: JQuery) : boolean {
		//if (caseModel.IsEditing) {
		//	element.height(ExpandedNodeHeight);
		//}
		return true;
	}
}

class FullScreenEditorActionPlugIn extends AssureIt.ActionPlugIn {
	editor;
	selector: string;
	ShowFullScreenEditor: (ev: Event) => void;
	isDisplayed: boolean;
	constructor(plugInManager: AssureIt.PlugInManager) {
		super(plugInManager);
		this.editor = CodeMirror.fromTextArea(document.getElementById('fullscreen-editor'), {
			lineNumbers: true,
			mode: "text/x-asn",
			lineWrapping: true,
		});
		$(this.editor.getWrapperElement()).css({
			height : "100%",
			width : "100%",
			background : "rgba(255, 255, 255, 0.85)"
		})
		$('#fullscreen-editor-wrapper').css({
			position : "absolute",
			top : "5%",
			left : "5%",
			height : "90%",
			width : "90%",
			display : 'none',
			//			background : "rgba(255, 255, 255, 0)"
		});
		this.ShowFullScreenEditor = null;
	}

	IsEnabled (caseViewer: AssureIt.CaseViewer, case0: AssureIt.Case) : boolean {
		return true;
	}

	Delegate(caseViewer: AssureIt.CaseViewer, case0: AssureIt.Case, serverApi: AssureIt.ServerAPI)  : boolean {
		var editor = this.editor;
		var self = this; //FIXME

		if(!this.ShowFullScreenEditor) {
			this.ShowFullScreenEditor = function (ev: Event) {
				ev.stopPropagation();
				self.plugInManager.UseUILayer(self);
				self.isDisplayed = true;

				var encoder : AssureIt.CaseEncoder = new AssureIt.CaseEncoder();
				var encoded = encoder.ConvertToASN(case0.ElementTop, false/* whole node */);

				var node = $(this);

				$('#fullscreen-editor-wrapper')
					.css({display: 'block'})
					.addClass("animated fadeInDown")
					.focus()
					.one("blur", {node : node}, function(e: JQueryEventObject, node: JQuery) {
						e.stopPropagation();

						var label : string = case0.ElementTop.Label;
						var orig_model : AssureIt.NodeModel = case0.ElementMap[label];
						var orig_view : AssureIt.NodeView = caseViewer.ViewMap[label];
						var orig_idCounters: number[] = case0.IdCounters;
						var orig_ElementMap = case0.ElementMap;
						case0.IdCounters = [0, 0, 0, 0, 0]; /* not a reset, replace it */
						case0.ElementMap = {};
						var decoder    : AssureIt.CaseDecoder = new AssureIt.CaseDecoder();
						var new_model  : AssureIt.NodeModel = decoder.ParseASN(case0, editor.getValue(), null);

						if (new_model != null) {
							orig_view.DeleteHTMLElementRecursive($("#layer0"), $("#layer1"));
							caseViewer.DeleteViewsRecursive(orig_view);
							var new_view  : AssureIt.NodeView = new AssureIt.NodeView(caseViewer, new_model);
							caseViewer.ElementTop = new_model;
							case0.ElementTop = new_model;
							(function(model : AssureIt.NodeModel, view : AssureIt.NodeView) : void {
								caseViewer.ViewMap[model.Label] = view;
								for (var i = 0; i < model.Children.length; i++) {
									var child_model = model.Children[i];
									var child_view : AssureIt.NodeView = new AssureIt.NodeView(caseViewer, child_model);
									arguments.callee(child_model, child_view);
								}
								if (model.Parent != null) view.ParentShape = caseViewer.ViewMap[model.Parent.Label];
							})(new_model, new_view);
							new_view.AppendHTMLElementRecursive($("#layer0"), $("#layer1"), caseViewer);
							caseViewer.Resize();
							caseViewer.LayoutElement();
							for (var viewkey in caseViewer.ViewMap) {
								caseViewer.ViewMap[viewkey].Update();
							}

							caseViewer.ReDraw();
						} else {
							case0.ElementMap = orig_ElementMap;
							case0.IdCounters = orig_idCounters;
						}

						var $this = $(this);
						self.isDisplayed = false;
						$this.addClass("animated fadeOutUp");
						window.setTimeout(function() {
							$this.removeClass();
							$this.css({display: 'none'});
						}, 1300);
					})
					.on("keydown", function(e: JQueryEventObject) {
						if(e.keyCode == 27 /* ESC */){
							e.stopPropagation();
							$('#fullscreen-editor-wrapper').blur();
						}
					});
				editor.setValue(encoded);
				editor.refresh();
				editor.focus();
				$('#CodeMirror').focus();
				$('#background').click(function(){
					$('#fullscreen-editor-wrapper').blur(); 
				});
				window.setTimeout(function() {
					if (!self.isDisplayed) {
						$('#fullscreen-editor-wrapper').css({display: 'none'});
					}
					$('#fullscreen-editor-wrapper').removeClass();
				}, 1300);
			}
		}

		$('#background').unbind('dblclick', this.ShowFullScreenEditor);
		$('#background').dblclick(this.ShowFullScreenEditor);
		return true;
	}

	DeleteFromDOM(): void {
		$('#fullscreen-editor-wrapper').blur();
	}
}
