var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var MenuBar = (function () {
    function MenuBar(caseViewer, case0, node, serverApi) {
        this.caseViewer = caseViewer;
        this.case0 = case0;
        this.node = node;
        this.serverApi = serverApi;
        this.Init();
    }
    MenuBar.prototype.Init = function () {
        var self = this;

        var thisNodeLabel = self.node.children('h4').text();
        var thisNodeType = self.case0.ElementMap[thisNodeLabel].Type;

        $('#menu').remove();
        var menu = $('<div id="menu">' + '<a href="#" ><img id="commit"   src="images/icon.png" title="Commit" alt="commit" /></a>' + '<a href="#" ><img id="remove"   src="images/icon.png" title="Remove" alt="remove" /></a>' + '</div>');

        switch (thisNodeType) {
            case AssureIt.NodeType.Goal:
                menu.append('<a href="#" ><img id="context"  src="images/icon.png" title="Context" alt="context" /></a>');
                menu.append('<a href="#" ><img id="strategy" src="images/icon.png" title="Strategy" alt="strategy" /></a>');
                menu.append('<a href="#" ><img id="evidence" src="images/icon.png" title="Evidence" alt="evidence" /></a>');
                break;
            case AssureIt.NodeType.Strategy:
                menu.append('<a href="#" ><img id="goal"     src="images/icon.png" title="Goal" alt="goal" /></a>');
                menu.append('<a href="#" ><img id="context"  src="images/icon.png" title="Context" alt="context" /></a>');
                break;
            default:
                break;
        }

        menu.css({ position: 'absolute', top: self.node.position().top + self.node.height() + 5, display: 'block', opacity: 0 });
        menu.hover(function () {
        }, function () {
            $(this).remove();
        });
        (menu).jqDock({
            align: 'bottom',
            fadeIn: 200,
            idle: 1500,
            size: 45,
            distance: 60,
            labels: 'tc',
            duration: 500,
            source: function () {
                return this.src.replace(/(jpg|gif)$/, 'png');
            },
            onReady: function () {
                menu.css({ left: self.node.position().left + (self.node.outerWidth() - menu.width()) / 2 });
            }
        });
        menu.appendTo($('#layer2'));
    };

    MenuBar.prototype.ReDraw = function () {
        var backgroundlayer = document.getElementById("background");
        var shapelayer = document.getElementById("layer0");
        var contentlayer = document.getElementById("layer1");
        var controllayer = document.getElementById("layer2");
        var offset = $("#layer1").offset();

        var Screen = new AssureIt.ScreenManager(shapelayer, contentlayer, controllayer, backgroundlayer);
        this.caseViewer.Draw(Screen);
        Screen.SetOffset(offset.left, offset.top);
    };

    MenuBar.prototype.AddNode = function (nodeType) {
        var thisNodeView = this.caseViewer.ViewMap[this.node.children("h4").text()];
        var newNodeModel = new AssureIt.NodeModel(this.case0, thisNodeView.Source, nodeType, null, null);
        this.case0.SaveIdCounterMax(this.case0.ElementTop);
        this.caseViewer.ViewMap[newNodeModel.Label] = new AssureIt.NodeView(this.caseViewer, newNodeModel);
        this.caseViewer.ViewMap[newNodeModel.Label].ParentShape = this.caseViewer.ViewMap[newNodeModel.Parent.Label];
        this.caseViewer.Resize();
        this.ReDraw();
    };

    MenuBar.prototype.GetDescendantLabels = function (labels, children) {
        for (var i = 0; i < children.length; i++) {
            labels.push(children[i].Label);
            this.GetDescendantLabels(labels, children[i].Children);
        }
        return labels;
    };

    MenuBar.prototype.RemoveNode = function () {
        var thisLabel = this.node.children("h4").text();
        var thisNodeView = this.caseViewer.ViewMap[thisLabel];
        var thisNodeModel = thisNodeView.Source;
        var brotherNodeModels = thisNodeModel.Parent.Children;

        for (var i = 0; i < brotherNodeModels.length; i++) {
            if (brotherNodeModels[i].Label == thisLabel) {
                brotherNodeModels.splice(i, 1);
            }
        }

        var labels = [thisLabel];
        labels = this.GetDescendantLabels(labels, thisNodeModel.Children);

        for (var i = 0; i < labels.length; i++) {
            delete this.case0.ElementMap[labels[i]];
            var nodeView = this.caseViewer.ViewMap[labels[i]];
            nodeView.DeleteHTMLElementRecursive(null, null);
            delete this.caseViewer.ViewMap[labels[i]];
        }

        this.caseViewer.Resize();
        this.ReDraw();
    };

    MenuBar.prototype.Commit = function () {
        ($('#modal')).dialog('open');
    };

    MenuBar.prototype.SetEventHandlers = function () {
        var self = this;

        $('#goal').click(function () {
            self.AddNode(AssureIt.NodeType.Goal);
        });

        $('#context').click(function () {
            self.AddNode(AssureIt.NodeType.Context);
        });

        $('#strategy').click(function () {
            self.AddNode(AssureIt.NodeType.Strategy);
        });

        $('#evidence').click(function () {
            self.AddNode(AssureIt.NodeType.Evidence);
        });

        $('#remove').click(function () {
            self.RemoveNode();
        });

        $('#commit').click(function () {
            self.Commit();
        });
    };
    return MenuBar;
})();

var CommitWindow = (function () {
    function CommitWindow() {
        this.defaultMessage = "Type your commit message...";
        this.Init();
    }
    CommitWindow.prototype.Init = function () {
        $('#modal').remove();
        var modal = $('<div id="modal" title="Commit Message" />');
        (modal).dialog({
            autoOpen: false,
            modal: true,
            resizable: false,
            draggable: false,
            show: "clip",
            hide: "fade"
        });

        var messageBox = $('<p align="center"><input id="message_box" type="text" size="30" value="' + this.defaultMessage + '" /></p>');
        messageBox.css('color', 'gray');

        var commitButton = $('<p align="right"><input id="commit_button" type="button" value="commit"/></p>');
        modal.append(messageBox);
        modal.append(commitButton);
        modal.appendTo($('layer2'));
    };

    CommitWindow.prototype.SetEventHandlers = function (caseViewer, case0, serverApi) {
        var self = this;

        $('#message_box').focus(function () {
            if ($(this).val() == self.defaultMessage) {
                $(this).val("");
                $(this).css('color', 'black');
            }
        });

        $('#message_box').blur(function () {
            if ($(this).val() == "") {
                $(this).val(self.defaultMessage);
                $(this).css('color', 'gray');
            }
        });

        $('#commit_button').click(function () {
            var encoder = new AssureIt.CaseEncoderDeprecated();
            var converter = new AssureIt.Converter();
            var contents = converter.GenOldJson(encoder.ConvertToOldJson(case0));
            serverApi.Commit(contents, $(this).val, case0.CommitId);
            window.location.reload();
        });
    };
    return CommitWindow;
})();

var MenuBarPlugIn = (function (_super) {
    __extends(MenuBarPlugIn, _super);
    function MenuBarPlugIn() {
        _super.apply(this, arguments);
    }
    MenuBarPlugIn.prototype.IsEnabled = function (caseViewer, case0) {
        return true;
    };

    MenuBarPlugIn.prototype.Delegate = function (caseViewer, case0, serverApi) {
        $('.node').unbind('hover');
        $('.node').hover(function () {
            var node = $(this);

            var menuBar = new MenuBar(caseViewer, case0, node, serverApi);
            menuBar.SetEventHandlers();

            var commitWindow = new CommitWindow();
            commitWindow.SetEventHandlers(caseViewer, case0, serverApi);
        }, function () {
        });
        return true;
    };
    return MenuBarPlugIn;
})(AssureIt.ActionPlugIn);
