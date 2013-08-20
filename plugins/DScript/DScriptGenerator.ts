/// <reference path="../../src/CaseModel.ts" />
/// <reference path="../../src/PlugInManager.ts" />

class DScriptGenerator {
	indentToken: string;
	constructor(public model: AssureIt.NodeModel) {
		this.indentToken = "\t";
	}

	getMethodName(model: AssureIt.NodeModel): string {
		return model.Label;
	}

	codegen_(model: AssureIt.NodeModel): string {
		var res: string = "";
		var notes: AssureIt.CaseNote[] = model.Notes;
		for (var i in notes) {
			var note = notes[i];
			if (note.Name == 'Monitor' || note.Name == 'Recovery' || note.Name == 'Condition') {
				if (note.Body.Description) {
					res += '// ' + note.Name + '\n';
					res += "void " + this.getMethodName(model) + '_' + note.Name + '() {\n';
					res += '    ' + note.Body.Description.replace(/\n/g, '\n    ');
					res += '\n}\n\n';
				}
			}
		}

		//res = "int " + this.getMethodName(model) + "() {\n";
		//res += this.indentToken + "return 1;\n";
		//res += "}\n\n";
		return res;
	}
	
	codegen(): string {
		console.log("codegen");
		return this.codegen_(this.model);
	}
}
