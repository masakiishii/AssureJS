$(function () {
    var serverApi = new AssureIt.ServerAPI('http://localhost/ait', 'http://54.250.206.119/rec/api/2.0/');

    var selectCaseView = new AssureIt.SelectCaseView(serverApi, '#select-case');
    selectCaseView.initEvents();
    selectCaseView.clear();
    selectCaseView.addElements(null);
});
