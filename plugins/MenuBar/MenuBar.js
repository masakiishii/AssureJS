var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var MenuBarAPI = (function () {
    function MenuBarAPI(caseViewer, case0, node, serverApi) {
        this.caseViewer = caseViewer;
        this.case0 = case0;
        this.node = node;
        this.serverApi = serverApi;
    }
    MenuBarAPI.prototype.ReDraw = function () {
        var backgroundlayer = document.getElementById("background");
        var shapelayer = document.getElementById("layer0");
        var contentlayer = document.getElementById("layer1");
        var controllayer = document.getElementById("layer2");
        var offset = $("#layer1").offset();

        var Screen = new AssureIt.ScreenManager(shapelayer, contentlayer, controllayer, backgroundlayer);
        this.caseViewer.Draw(Screen);
        Screen.SetOffset(offset.left, offset.top);
    };

    MenuBarAPI.prototype.AddNode = function (nodeType) {
        var thisNodeView = this.caseViewer.ViewMap[this.node.children("h4").text()];
        var newNodeModel = new AssureIt.NodeModel(this.case0, thisNodeView.Source, nodeType, null, null);
        this.case0.SaveIdCounterMax(this.case0.ElementTop);
        this.caseViewer.ViewMap[newNodeModel.Label] = new AssureIt.NodeView(this.caseViewer, newNodeModel);
        this.caseViewer.ViewMap[newNodeModel.Label].ParentShape = this.caseViewer.ViewMap[newNodeModel.Parent.Label];
        this.caseViewer.Resize();
        this.ReDraw();
    };

    MenuBarAPI.prototype.GetDescendantLabels = function (labels, children) {
        for (var i = 0; i < children.length; i++) {
            labels.push(children[i].Label);
            this.GetDescendantLabels(labels, children[i].Children);
        }
        return labels;
    };

    MenuBarAPI.prototype.RemoveNode = function () {
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

    MenuBarAPI.prototype.Commit = function () {
        ($('#commit_window')).dialog('open');
    };
    return MenuBarAPI;
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

            $('#menu').remove();
            var menu = $('<div id="menu">' + '<a href="#" ><img id="goal" src="images/icon.png" title="Goal" alt="goal" /></a>' + '<a href="#" ><img id="context" src="images/icon.png" title="Context" alt="context" /></a>' + '<a href="#" ><img id="strategy" src="images/icon.png" title="Strategy" alt="strategy" /></a>' + '<a href="#" ><img id="evidence" src="images/icon.png" title="Evidence" alt="evidence" /></a>' + '<a href="#" ><img id="remove" src="images/icon.png" title="Remove" alt="remove" /></a>' + '<a href="#" ><img id="commit" src="images/icon.png" title="Commit" alt="commit" /></a>' + '</div>');
            menu.css({ position: 'absolute', top: node.position().top + 75, display: 'block', opacity: 0 });
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
                    menu.css({ left: node.position().left + (node.outerWidth() - menu.width()) / 2 });
                }
            });
            menu.appendTo($('#layer2'));

            var menuBarApi = new MenuBarAPI(caseViewer, case0, node, serverApi);

            $('#goal').click(function () {
                menuBarApi.AddNode(AssureIt.NodeType.Goal);
            });

            $('#context').click(function () {
                menuBarApi.AddNode(AssureIt.NodeType.Context);
            });

            $('#strategy').click(function () {
                menuBarApi.AddNode(AssureIt.NodeType.Strategy);
            });

            $('#evidence').click(function () {
                menuBarApi.AddNode(AssureIt.NodeType.Evidence);
            });

            $('#remove').click(function () {
                menuBarApi.RemoveNode();
            });

            $('#commit').click(function () {
                menuBarApi.Commit();
            });

            $('#commit_window').remove();
            var commitWindow = $('<div id="commit_window">' + '<textarea>Type your commit message here...</textarea>' + '</div>');
            (commitWindow).dialog({
                autoOpen: false,
                modal: true,
                resizable: false,
                draggable: false,
                show: "clip",
                hide: "fade"
            });
            commitWindow.appendTo($('layer2'));
        }, function () {
        });
        return true;
    };
    return MenuBarPlugIn;
})(AssureIt.ActionPlugIn);
