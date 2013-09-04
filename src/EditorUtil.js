;

var ErrorHighlight = (function () {
    function ErrorHighlight(editor) {
        this.editor = editor;
        this.marker = [];
    }
    ErrorHighlight.prototype.Blink = function (line) {
        var _this = this;
        var cycle = 1000 / 15;
        var cycles = 8;
        var count = 0;
        var blink = function () {
            count = count + 1;
            if (count < cycles) {
                if (count % 2 == 0) {
                    _this.ClearHighlight();
                } else {
                    _this.marker.push(_this.editor.markText({ line: line, ch: 0 }, { line: line + 1, ch: 0 }, { className: "CodeMirror-error" }));
                }

                setTimeout(blink, cycle);
            }
        };
        blink();
    };

    ErrorHighlight.prototype.ClearHighlight = function () {
        for (var i in this.marker) {
            this.marker[i].clear();
        }
        this.marker = [];
    };

    ErrorHighlight.prototype.Highlight = function (line, message) {
        this.Blink(line);
        this.editor.scrollIntoView({ line: line, ch: 0 });
        this.editor.setCursor({ line: line });
    };
    return ErrorHighlight;
})();
