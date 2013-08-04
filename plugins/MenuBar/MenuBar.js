var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var MenuBarPlugIn = (function (_super) {
    __extends(MenuBarPlugIn, _super);
    function MenuBarPlugIn() {
        _super.apply(this, arguments);
    }
    MenuBarPlugIn.prototype.IsEnabled = function (caseViewer, case0) {
        return true;
    };

    MenuBarPlugIn.prototype.Delegate = function (caseViewer, case0, serverApi) {
        if (MenuBarPlugIn.DelegateInvoked)
            return;
        $('.node').hover(function () {
            var node = $(this);
            $('#menu').remove();
            var p = node.position();
            var j = $('<div id="menu">' + '<a href="#" ><img src="images/icon.png" alt="" /></a>' + '<a href="#" ><img src="images/icon.png" alt="" /></a>' + '<a href="#" ><img src="images/icon.png" alt="" /></a>' + '<a href="#" ><img src="images/icon.png" alt="" /></a>' + '<a href="#" ><img src="images/icon.png" alt="" /></a>' + '<a href="#" ><img src="images/icon.png" alt="" /></a></div>');

            j.appendTo($('#layer2'));
            j.css({ position: 'absolute', top: p.top + 75, display: 'none', opacity: 0 });
            ($('#menu')).jqDock({
                align: 'bottom',
                fadeIn: 200,
                idle: 1500,
                size: 48,
                distance: 60,
                labels: 'hoge,fuga,foo,bar',
                duration: 500,
                source: function () {
                    return this.src.replace(/(jpg|gif)$/, 'png');
                },
                onReady: function () {
                    $('#menu').css({ left: node.position().left + (node.outerWidth() - $('#menu').width()) / 2 });
                }
            });
            $('#menu').css({ display: 'block' }).hover(function () {
            }, function () {
                $(this).remove();
            });
        }, function () {
        });
        MenuBarPlugIn.DelegateInvoked = true;
        return true;
    };
    MenuBarPlugIn.DelegateInvoked = false;
    return MenuBarPlugIn;
})(AssureIt.ActionPlugIn);
