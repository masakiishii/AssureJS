/// <reference path="../../src/CaseModel.ts" />
/// <reference path="../../src/ServerApi.ts" />
/// <reference path="../../src/PlugInManager.ts" />

//--- CodeMirror

/* const */

var ExpandedNodeHeight = 200;
var InplaceEditorHeight = ExpandedNodeHeight - 50;

declare class CodeMirror {
	static fromTextArea(selector: any, option: any): any;
};

class EditorPlugIn extends AssureIt.PlugIn {

	constructor(plugInManager: AssureIt.PlugInManager) {
		super(plugInManager);
		this.ActionPlugIn = new EditorActionPlugIn(plugInManager);
		this.HTMLRenderPlugIn = new EditorLayoutPlugIn(plugInManager);
	}

}

class EditorLayoutPlugIn extends AssureIt.HTMLRenderPlugIn {
	constructor(plugInManager: AssureIt.PlugInManager) {
		super(plugInManager);
	}

	IsEnabled (caseViewer: AssureIt.CaseViewer, caseModel: AssureIt.NodeModel) : boolean {
		return true;
	}

	Delegate(caseViewer: AssureIt.CaseViewer, caseModel: AssureIt.NodeModel, element: JQuery) : boolean {
		if (caseModel.IsEditing) {
			element.height(ExpandedNodeHeight);
		}
		return true;
	}
}

class EditorActionPlugIn extends AssureIt.ActionPlugIn {
	editor;
	constructor(plugInManager: AssureIt.PlugInManager) {
		super(plugInManager);
		this.editor = CodeMirror.fromTextArea(document.getElementById('editor'), {
			lineNumbers: false,
			mode: "text/x-asn",
			lineWrapping: true,
		});
		this.editor.setSize("300px","200px"); //FIXME
		$('#editor-wrapper').css({display: 'none', opacity: '1.0'});
	}

	IsEnabled (caseViewer: AssureIt.CaseViewer, case0: AssureIt.Case) : boolean {
		return true;
	}

	Delegate(caseViewer: AssureIt.CaseViewer, case0: AssureIt.Case, serverApi: AssureIt.ServerAPI)  : boolean {
		var editor = this.editor;
		var self = this; //FIXME
		$('.node').unbind('dblclick');
		$('.node').dblclick(function(ev) { //FIXME
			ev.stopPropagation();
			self.plugInManager.UseUILayer(self);
			var node = $(this);
			var p = node.position();
			var p_contents = node.children("p").position();
			var label : string = node.attr('id');
			var selector = "#" + label;
			console.log(selector);
			console.log($(selector).height() + ", " + p_contents.top);
			editor.setSize(node.children("p").width(), InplaceEditorHeight);

			var encoder : AssureIt.CaseEncoder = new AssureIt.CaseEncoder();
			var encoded = encoder.ConvertToASN(case0.ElementMap[label], true/*single node*/);

			var orig_model : AssureIt.NodeModel = case0.ElementMap[label];
			var orig_shape : AssureIt.NodeView = caseViewer.ViewMap[label];

			orig_model.IsEditing = true;
			orig_shape.HTMLDoc.Render(caseViewer, orig_model);

			/* TODO use ReDraw() */
			caseViewer.Resize();
			var backgroundlayer = <HTMLDivElement>document.getElementById("background");
			var shapelayer = <SVGGElement><any>document.getElementById("layer0");
			var contentlayer = <HTMLDivElement>document.getElementById("layer1");
			var controllayer = <HTMLDivElement>document.getElementById("layer2");
			var offset = $("#layer1").offset();
			var Screen = new AssureIt.ScreenManager(shapelayer, contentlayer, controllayer, backgroundlayer);
			caseViewer.Draw(Screen);
			Screen.SetOffset(offset.left, offset.top);
			var node = $(this);

			$('#editor-wrapper')
				.css({position: 'absolute', top: p.top + p_contents.top, left: p.left + p_contents.left, display: 'block'})
				.appendTo($('#layer2'))
				.focus()
				.on("keydown", function(e: JQueryEventObject) {
					if(e.keyCode == 27 /* ESC */){
						e.stopPropagation();
						$(selector).blur();
					}
				})
			$(selector)
				.unbind('hover')
				.on("blur", {node : node}, function(e: JQueryEventObject, node: JQuery) {
					console.log("blur");
					e.stopPropagation();
					var label : string = e.data.node.attr('id');
					var decoder    : AssureIt.CaseDecoder = new AssureIt.CaseDecoder();
					var new_model  : AssureIt.NodeModel = decoder.ParseASN(case0, editor.getValue().trim(), orig_model);
					/*update orig_model and redraw html*/
					orig_model.IsEditing = false;
					orig_model.Statement = new_model.Statement == null ? "" : new_model.Statement;
					orig_model.Annotations = new_model.Annotations;
					orig_model.Notes = new_model.Notes;
					orig_shape.HTMLDoc.Render(caseViewer, orig_model);

					/* TODO use ReDraw() */
					caseViewer.Resize();
					var backgroundlayer = <HTMLDivElement>document.getElementById("background");
					var shapelayer = <SVGGElement><any>document.getElementById("layer0");
					var contentlayer = <HTMLDivElement>document.getElementById("layer1");
					var controllayer = <HTMLDivElement>document.getElementById("layer2");
					var offset = $("#layer1").offset();
					var Screen = new AssureIt.ScreenManager(shapelayer, contentlayer, controllayer, backgroundlayer);
					caseViewer.Draw(Screen);
					Screen.SetOffset(offset.left, offset.top);

					//var new_shape  : AssureIt.NodeView = new AssureIt.NodeView(caseViewer, new_model);
					//(function(model : AssureIt.NodeModel, shape : AssureIt.NodeView) : void {
					//	for (var i = 0; i < model.Children.length; i++) {
					//		var child_model = model.Children[i];
					//		child_model.Parent = model;
					//		child_model.Case = case0;
					//		child_model.Label = case0.NewLabel(child_model.Type);
					//		case0.ElementMap[child_model.Label] = child_model;
					//		var child_shape : AssureIt.NodeView = new AssureIt.NodeView(caseViewer, child_model);
					//		arguments.callee(child_model, child_shape);
					//	}
					//	caseViewer.ViewMap[model.Label] = shape;
					//	if (model.Parent != null) shape.ParentShape = caseViewer.ViewMap[model.Parent.Label];
					//})(new_model, new_shape);
					//caseViewer.Resize();
					//orig_shape.DeleteHTMLElementRecursive($("#layer0"), $("#layer1"));
					//new_shape.AppendHTMLElementRecursive($("#layer0"), $("#layer1"), caseViewer);
					//caseViewer.LayoutElement();
					//for (var viewkey in caseViewer.ViewMap) {
					//	caseViewer.ViewMap[viewkey].Update();
					//}
					$('#editor-wrapper').css({display: 'none'});
				});
			editor.setValue(encoded);
			editor.refresh();
			editor.focus();
			$('#CodeMirror').focus();
			$('#layer1').click(function(){
					$(selector).blur(); 
				});
		});
		return true;
	}

	DeleteFromDOM(): void {
		$('#editor-wrapper').blur();
	}
}
