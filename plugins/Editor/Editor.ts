/// <reference path="../../src/CaseModel.ts" />
/// <reference path="../../src/ServerApi.ts" />
/// <reference path="../../src/PlugInManager.ts" />

//--- Interface for widearea.js
declare function wideArea(selector?: string): void;
//--- CodeMirror
declare class CodeMirror {
	static fromTextArea(selector: any, option: any): any;
};

class EditorPlugIn extends AssureIt.ActionPlugIn {
	editor;
	constructor() {
		super();
		//wideArea();
		this.editor = CodeMirror.fromTextArea(document.getElementById('editor'), {
			lineNumbers: true,
			mode: "text/x-asn",
		});
		this.editor.setSize("200px","200px"); //FIXME
		$('#editor-wrapper').css({display: 'none'});
	}

	IsEnabled (caseViewer: AssureIt.CaseViewer, case0: AssureIt.Case) : boolean {
		return true;
	}

	Delegate(caseViewer: AssureIt.CaseViewer, case0: AssureIt.Case, serverApi: AssureIt.ServerAPI)  : boolean {
		var editor = this.editor;
		$('.node').click(function(ev) { //FIXME
			ev.stopPropagation();
			var node = $(this);
			var p = node.position();
			var label : string = node.attr('id');
			var encoder : AssureIt.CaseEncoder = new AssureIt.CaseEncoder();
			var encoded = encoder.ConvertToASN(case0.ElementMap[label]);
			$('#editor-wrapper')
				.css({position: 'absolute', top: p.top, left: p.left, display: 'block'})
				.appendTo($('#layer2'))
				.focus()
				.one("blur", {node : node}, function(e: JQueryEventObject, node: JQuery) {
					e.stopPropagation();
					var label : string = e.data.node.attr('id');
					var orig_model : AssureIt.NodeModel = case0.ElementMap[label];
					var orig_view : AssureIt.NodeView = caseViewer.ViewMap[label];
					var decoder    : AssureIt.CaseDecoder = new AssureIt.CaseDecoder();
					var new_model  : AssureIt.NodeModel = decoder.ParseASN(case0, editor.getValue(), orig_model);
					var new_view  : AssureIt.NodeView = new AssureIt.NodeView(caseViewer, new_model);
 					orig_model.Parent.AppendChild(new_model);
 					orig_model.Parent.RemoveChild(orig_model);
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
}
