var DScriptGenerator = (function () {
    function DScriptGenerator(model) {
        this.model = model;
        this.indentToken = "\t";
    }
    DScriptGenerator.prototype.getMethodName = function (model) {
        return model.Label;
    };

    DScriptGenerator.prototype.codegen_ = function (model) {
        var res = "";
        var notes = model.Notes;
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

        return res;
    };

    DScriptGenerator.prototype.codegen = function () {
        console.log("codegen");
        return this.codegen_(this.model);
    };
    return DScriptGenerator;
})();
