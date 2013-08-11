/// <reference path="../../src/CaseModel.ts" />
/// <reference path="../../src/ServerApi.ts" />
/// <reference path="../../src/PlugInManager.ts" />

//--- CodeMirror
declare class CodeMirror {
	static fromTextArea(selector: any, option: any): any;
};

class EditorPlugIn extends AssureIt.PlugIn {

	constructor(plugInManager: AssureIt.PlugInManager) {
		super(plugInManager);
		this.ActionPlugIn = new EditorActionPlugIn(plugInManager);
	}

}

class EditorActionPlugIn extends AssureIt.ActionPlugIn {
	editor;
	constructor(plugInManager: AssureIt.PlugInManager) {
		super(plugInManager);
		this.editor = CodeMirror.fromTextArea(document.getElementById('editor'), {
			lineNumbers: false,
			mode: "text/x-asn",
		});
		this.editor.setSize("300px","200px"); //FIXME
		$('#editor-wrapper').css({display: 'none'});
	}

	IsEnabled (caseViewer: AssureIt.CaseViewer, case0: AssureIt.Case) : boolean {
		return true;
	}

	Delegate(caseViewer: AssureIt.CaseViewer, case0: AssureIt.Case, serverApi: AssureIt.ServerAPI)  : boolean {
		var editor = this.editor;
		var self = this; //FIXME
		$('.node').dblclick(function(ev) { //FIXME
			ev.stopPropagation();
			self.plugInManager.UseUILayer(self);
			var node = $(this);
			var p = node.position();
			var label : string = node.attr('id');
			var encoder : AssureIt.CaseEncoder = new AssureIt.CaseEncoder();
			var encoded = encoder.ConvertToASN(case0.ElementMap[label], true/*single node*/);
			$('#editor-wrapper')
				.css({position: 'absolute', top: p.top, left: p.left, display: 'block'})
				.appendTo($('#layer2'))
				.focus()
				.one("blur", {node : node}, function(e: JQueryEventObject, node: JQuery) {
					console.log("blur");
					e.stopPropagation();
					var label : string = e.data.node.attr('id');
					var orig_model : AssureIt.NodeModel = case0.ElementMap[label];
					var orig_shape : AssureIt.NodeView = caseViewer.ViewMap[label];
					var decoder    : AssureIt.CaseDecoder = new AssureIt.CaseDecoder();
					var new_model  : AssureIt.NodeModel = decoder.ParseASN(case0, editor.getValue().trim(), orig_model);
					/*update orig_model and redraw html*/
					orig_model.Statement = new_model.Statement == null ? "" : new_model.Statement;
					orig_model.Annotations = new_model.Annotations;
					orig_model.Notes = new_model.Notes;
					console.log("parsed notes");
					console.log(new_model.Notes);
					orig_shape.HTMLDoc.Render(caseViewer, orig_model);

					caseViewer.Resize();
					var backgroundlayer = <HTMLDivElement>document.getElementById("background");
					var shapelayer = <SVGGElement><any>document.getElementById("layer0");
					var contentlayer = <HTMLDivElement>document.getElementById("layer1");
					var controllayer = <HTMLDivElement>document.getElementById("layer2");
					var offset = $("#layer1").offset();

					var Screen = new AssureIt.ScreenManager(shapelayer, contentlayer, controllayer, backgroundlayer);
					caseViewer.Draw(Screen);
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
					$(this).css({display: 'none'});
				})
				.on("keydown", function(e: JQueryEventObject) {
					if(e.keyCode == 27 /* ESC */){
						e.stopPropagation();
						$('#editor-wrapper').blur();
					}
				});
			editor.setValue(encoded);
			editor.refresh();
		});
		$('#layer1').click(function(){
			$('#editor-wrapper').blur(); 
		});
		return true;
	}

	DeleteFromDOM(): void {
		console.log('Editor');
		$('#editor-wrapper').blur();
	}
}
