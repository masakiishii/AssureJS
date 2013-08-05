$(function () {
    var serverApi = new AssureIt.ServerAPI('http://localhost/ait');
    var pluginManager = new AssureIt.PlugInManager();
    pluginManager.AddActionPlugIn("menu", new MenuBarPlugIn());
    pluginManager.AddActionPlugIn("editor", new EditorPlugIn());
    pluginManager.AddHTMLRenderPlugIn("annotation", new AnnotationHTMLRenderPlugIn());
    pluginManager.AddHTMLRenderPlugIn("monitor", new MonitorHTMLRenderPlugIn());
    pluginManager.AddHTMLRenderPlugIn("note", new NoteHTMLRenderPlugIn());
    pluginManager.AddSVGRenderPlugIn("monitor", new MonitorSVGRenderPlugIn());

    var JsonData = {
        "DCaseName": "test",
        "NodeCount": 23,
        "TopGoalLabel": "G1",
        "NodeList": [
            {
                "Children": [
                    "S1",
                    "C1"
                ],
                "Statement": "",
                "NodeType": 0,
                "Label": "G1",
                "Annotations": [],
                "Notes": []
            },
            {
                "Children": [],
                "Statement": "",
                "NodeType": 1,
                "Label": "C1",
                "Annotations": [{ "Name": "Def", "Body": "a = 1" }],
                "Notes": []
            },
            {
                "Children": [
                    "G2",
                    "G3"
                ],
                "Statement": "",
                "NodeType": 2,
                "Label": "S1",
                "Annotations": [],
                "Notes": []
            },
            {
                "Children": [
                    "S2"
                ],
                "Statement": "",
                "NodeType": 0,
                "Label": "G2",
                "Annotations": [],
                "Notes": []
            },
            {
                "Children": [
                    "G4",
                    "G5",
                    "G6",
                    "C3"
                ],
                "Statement": "",
                "NodeType": 2,
                "Label": "S2",
                "Annotations": [],
                "Notes": []
            },
            {
                "Children": [
                    "E1"
                ],
                "Statement": "",
                "NodeType": 0,
                "Label": "G4",
                "Annotations": [],
                "Notes": []
            },
            {
                "Children": [
                    "C2",
                    "E2",
                    "E3"
                ],
                "Statement": "",
                "NodeType": 0,
                "Label": "G5",
                "Annotations": [],
                "Notes": []
            },
            {
                "Children": [
                    "E4"
                ],
                "Statement": "",
                "NodeType": 0,
                "Label": "G6",
                "Annotations": [],
                "Notes": []
            },
            {
                "Children": [],
                "Statement": "",
                "NodeType": 3,
                "Label": "E1",
                "Annotations": [],
                "Notes": [
                    {
                        "Name": "Monitor",
                        "Body": {
                            "nodeID": 51
                        }
                    }
                ]
            },
            {
                "Children": [],
                "Statement": "",
                "NodeType": 1,
                "Label": "C2",
                "Annotations": [{ "Name": "Def", "Body": "a = 2" }],
                "Notes": []
            },
            {
                "Children": [
                    "C4"
                ],
                "Statement": "",
                "NodeType": 3,
                "Label": "E2",
                "Annotations": [],
                "Notes": []
            },
            {
                "Children": [],
                "Statement": "",
                "NodeType": 1,
                "Label": "C4",
                "Annotations": [{ "Name": "Def", "Body": "a = 4" }],
                "Notes": []
            },
            {
                "Children": [],
                "Statement": "",
                "NodeType": 1,
                "Label": "C3",
                "Annotations": [{ "Name": "Def", "Body": "a = 3" }],
                "Notes": []
            },
            {
                "Children": [],
                "Statement": "",
                "NodeType": 3,
                "Label": "E3",
                "Annotations": [],
                "Notes": []
            },
            {
                "Children": [],
                "Statement": "",
                "NodeType": 3,
                "Label": "E4",
                "Annotations": [],
                "Notes": []
            },
            {
                "Children": [
                    "S3"
                ],
                "Statement": "",
                "NodeType": 0,
                "Label": "G3",
                "Annotations": [],
                "Notes": []
            },
            {
                "Children": [
                    "G7",
                    "G8",
                    "G9"
                ],
                "Statement": "",
                "NodeType": 2,
                "Label": "S3",
                "Annotations": [],
                "Notes": []
            },
            {
                "Children": [
                    "C5",
                    "E5",
                    "E6"
                ],
                "Statement": "",
                "NodeType": 0,
                "Label": "G7",
                "Annotations": [],
                "Notes": []
            },
            {
                "Children": [],
                "Statement": "",
                "NodeType": 3,
                "Label": "E5",
                "Annotations": [],
                "Notes": []
            },
            {
                "Children": [],
                "Statement": "",
                "NodeType": 3,
                "Label": "E6",
                "Annotations": [],
                "Notes": []
            },
            {
                "Children": [],
                "Statement": "",
                "NodeType": 1,
                "Label": "C5",
                "Annotations": [],
                "Notes": []
            },
            {
                "Children": [],
                "Statement": "",
                "NodeType": 0,
                "Label": "G8",
                "Annotations": [],
                "Notes": []
            },
            {
                "Children": [],
                "Statement": "",
                "NodeType": 0,
                "Label": "G9",
                "Annotations": [],
                "Notes": []
            }
        ]
    };

    var Case0 = new AssureIt.Case();
    var caseDecoder = new AssureIt.CaseDecoder();
    var root = caseDecoder.ParseJson(Case0, JsonData);

    Case0.SetElementTop(root);
    var Viewer = new AssureIt.CaseViewer(Case0, pluginManager, serverApi);
    var backgroundlayer = document.getElementById("background");
    var shapelayer = document.getElementById("layer0");
    var contentlayer = document.getElementById("layer1");
    var controllayer = document.getElementById("layer2");

    var Screen = new AssureIt.ScreenManager(shapelayer, contentlayer, controllayer, backgroundlayer);
    Viewer.Draw(Screen);
});
