/// <reference path="../../src/CaseModel.ts" />
/// <reference path="../../src/ServerApi.ts" />
/// <reference path="../../src/PlugInManager.ts" />
/// <reference path="../Editor/Editor.ts" />

//--- CodeMirror

class FullScreenEditorPlugIn extends AssureIt.PlugIn {

	constructor(plugInManager: AssureIt.PlugInManager) {
		super(plugInManager);
		this.ActionPlugIn = new FullScreenEditorActionPlugIn(plugInManager);
		this.HTMLRenderPlugIn = new FullScreenEditorLayoutPlugIn(plugInManager);
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
	constructor(plugInManager: AssureIt.PlugInManager) {
		super(plugInManager);
		this.editor = CodeMirror.fromTextArea(document.getElementById('fullscreen-editor'), {
			lineNumbers: true,
			mode: "text/x-asn",
			lineWrapping: true,
		});
		this.editor.setSize("300px","200px"); /* TODO resize */
		$('#fullscreen-editor-wrapper').css({display: 'none', opacity: '1.0'});
	}

	IsEnabled (caseViewer: AssureIt.CaseViewer, case0: AssureIt.Case) : boolean {
		return true;
	}

	Delegate(caseViewer: AssureIt.CaseViewer, case0: AssureIt.Case, serverApi: AssureIt.ServerAPI)  : boolean {
		var editor = this.editor;
		var self = this; //FIXME
		$('#layer1').unbind('dblclick');
		$('#layer1').dblclick(function(ev) {
			ev.stopPropagation();
			self.plugInManager.UseUILayer(self);
			editor.setSize(640, 480); /* TODO resize */

			var encoder : AssureIt.CaseEncoder = new AssureIt.CaseEncoder();
			var encoded = encoder.ConvertToASN(case0.ElementTop, false/* whole node */);

			var node = $(this);

			$('#fullscreen-editor-wrapper')
				.css({position: 'absolute', top: 100/*p.top + p_contents.top*/, left: 100/*p.left + p_contents.left*/, display: 'block'})
				.appendTo($('#layer2'))
				.focus()
				.one("blur", {node : node}, function(e: JQueryEventObject, node: JQuery) {
					e.stopPropagation();
					var label : string = case0.ElementTop.Label;
					var orig_model : AssureIt.NodeModel = case0.ElementMap[label];
					var orig_view : AssureIt.NodeView = caseViewer.ViewMap[label];
					var decoder    : AssureIt.CaseDecoder = new AssureIt.CaseDecoder();
					var new_model  : AssureIt.NodeModel = decoder.ParseASN(case0, editor.getValue(), orig_model);
					var new_view  : AssureIt.NodeView = new AssureIt.NodeView(caseViewer, new_model);
  					//orig_model.Parent.AppendChild(new_model);
  					//orig_model.Parent.RemoveChild(orig_model);
  					//orig_model.Parent.UpdateChild(orig_model, new_model);
  					//orig_model.UpdateChild(orig_model, new_model);
					caseViewer.ElementTop = new_model;
					case0.ElementTop = new_model;
					case0.DeleteNodesRecursive(orig_model);
					orig_view.DeleteHTMLElementRecursive($("#layer0"), $("#layer1"));
					caseViewer.DeleteViewsRecursive(orig_view);
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
					$(this).css({display: 'none'});
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
			$('#layer1').click(function(){
					$('#fullscreen-editor-wrapper').blur(); 
				});
		});
		return true;
	}

	DeleteFromDOM(): void {
		$('fullscreen-editor-wrapper').blur();
	}
}
