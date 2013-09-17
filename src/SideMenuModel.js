var AssureIt;
(function (AssureIt) {
    var SideMenuModel = (function () {
        function SideMenuModel(href, value, id, callback) {
            this.href = href;
            this.value = value;
            this.id = id;
            this.callback = callback;
        }
        return SideMenuModel;
    })();
    AssureIt.SideMenuModel = SideMenuModel;

    var SideMenu = (function () {
        function SideMenu() {
        }
        SideMenu.Create = function (models) {
            for (var i = 0; i < models.length; i++) {
                var model = models[i];
                $('<li id="' + model.id + '"><a href="' + model.href + '">' + model.value + '</>').prepend($("#drop-menu"));
                $("#" + model.id).click(model.callback);
            }
        };
        return SideMenu;
    })();
    AssureIt.SideMenu = SideMenu;
})(AssureIt || (AssureIt = {}));
