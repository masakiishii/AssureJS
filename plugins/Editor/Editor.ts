/// <reference path="../../src/CaseModel.ts" />
/// <reference path="../../src/ServerApi.ts" />
/// <reference path="../../src/PlugInManager.ts" />

//--- Interface for widearea.js
declare function wideArea(selector?: string): void;
//---

class EditorPlugIn extends AssureIt.ActionPlugIn {
	constructor() {
		super();
		wideArea();
		$('#editor').css({display: 'none'});
	}

	IsEnabled (caseViewer: AssureIt.CaseViewer, case0: AssureIt.Case) : boolean {
		return true;
	}

	Delegate(caseViewer: AssureIt.CaseViewer, case0: AssureIt.Case, serverApi: AssureIt.ServerAPI)  : boolean {
		$('.node').click(function(ev) { //FIXME
			ev.stopPropagation();
			var node = $(this);
			var p = node.position();
			var label : string = node.text();
			var encoder : AssureIt.CaseEncoder = new AssureIt.CaseEncoder();
			var encoded = encoder.ConvertToASN(case0.ElementMap[label]);
			$('#editor')
				.css({position: 'absolute', top: p.top, left: p.left, display: 'block'})
				.appendTo($('#layer2'))
				.focus()
				.val(encoded)
				.one("blur", {node : node}, function(e: JQueryEventObject, node: JQuery) {
					e.stopPropagation();
					var label : string = e.data.node.text();
					var orig_model : AssureIt.NodeModel = case0.ElementMap[label];
					var orig_shape : AssureIt.NodeView = caseViewer.ViewMap[label];
					var decoder    : AssureIt.CaseDecoder = new AssureIt.CaseDecoder();
					var new_model  : AssureIt.NodeModel = decoder.ParseASN(case0, $(this).val(), orig_model);
					var new_shape  : AssureIt.NodeView = new AssureIt.NodeView(caseViewer, new_model);
					(function(model : AssureIt.NodeModel, shape : AssureIt.NodeView) : void {
						for (var i = 0; i < model.Children.length; i++) {
							var child_model = model.Children[i];
							var child_shape : AssureIt.NodeView = new AssureIt.NodeView(caseViewer, child_model);
							arguments.callee(child_model, child_shape);
						}
						caseViewer.ViewMap[model.Label] = shape;
						if (model.Parent != null) shape.ParentShape = caseViewer.ViewMap[model.Parent.Label];
					})(new_model, new_shape);
					caseViewer.Resize();
					orig_shape.DeleteHTMLElementRecursive($("#layer0"), $("#layer1"));
					new_shape.AppendHTMLElementRecursive($("#layer0"), $("#layer1"), caseViewer);
					caseViewer.LayoutElement();
					for (var viewkey in caseViewer.ViewMap) {
						caseViewer.ViewMap[viewkey].Update();
					}
					$(this).css({display: 'none'});
				})
				.on("keydown", function(e: JQueryEventObject) {
					if(e.keyCode == 27 /* ESC */){
						e.stopPropagation();
						$(this).css({display: 'none'});
					}
				});
		});
		$('#layer1').click(function(){
			$('#editor').blur();
		});
		return true;
	}
}
