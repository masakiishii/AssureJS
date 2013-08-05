$(function () {
    var serverApi = new AssureIt.ServerAPI('http://192.168.189.146/ait');

    var selectCaseView = new AssureIt.SelectCaseView(serverApi, '#select-case');
    selectCaseView.initEvents();
    selectCaseView.clear();
    selectCaseView.addElements(null);
});
