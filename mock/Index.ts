/// <reference path="../src/CaseModel.ts" />
/// <reference path="../src/CaseDecoder.ts" />
/// <reference path="../src/CaseViewer.ts" />
/// <reference path="../src/ServerApi.ts" />
/// <reference path="../plugins/MenuBar/MenuBar.ts" />
/// <reference path="../plugins/Editor/Editor.ts" />
/// <reference path="../plugins/Annotation/Annotation.ts" />
/// <reference path="../plugins/Monitor/Monitor.ts" />
/// <reference path="../plugins/Note/Note.ts" />
/// <reference path="../d.ts/jquery.d.ts" />

$(function () {

	var serverApi = new AssureIt.ServerAPI('http://localhost/ait'); //TODO config for Path
	var pluginManager = new AssureIt.PlugInManager();
	pluginManager.AddActionPlugIn("menu", new MenuBarPlugIn());
	pluginManager.AddActionPlugIn("editor", new EditorPlugIn());
	pluginManager.AddHTMLRenderPlugIn("annotation", new AnnotationHTMLRenderPlugIn());
	pluginManager.AddHTMLRenderPlugIn("monitor", new MonitorHTMLRenderPlugIn());
	pluginManager.AddHTMLRenderPlugIn("note", new NoteHTMLRenderPlugIn());
	pluginManager.AddSVGRenderPlugIn("monitor", new MonitorSVGRenderPlugIn());

	var JsonData = {
		"DCaseName": "test",
		"NodeCount": 25,
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
				"Children": [
				],
				"Statement": "",
				"NodeType": 1,
				"Label": "C1",
				"Annotations": [{"Name" : "Def", "Body" : "a = 1"}],
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
				"Children": [
				],
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
				"Children": [
				],
				"Statement": "",
				"NodeType": 1,
				"Label": "C2",
				"Annotations": [{"Name" : "Def", "Body" : "a = 2"}],
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
				"Children": [
				],
				"Statement": "",
				"NodeType": 1,
				"Label": "C4",
				"Annotations": [{"Name" : "Def", "Body" : "a = 4"}],
				"Notes": []
			},
			{
				"Children": [
				],
				"Statement": "",
				"NodeType": 1,
				"Label": "C3",
				"Annotations": [{"Name" : "Def", "Body" : "a = 3"}],
				"Notes": []
			},
			{
				"Children": [
				],
				"Statement": "",
				"NodeType": 3,
				"Label": "E3",
				"Annotations": [],
				"Notes": []
			},
			{
				"Children": [
				],
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
					"E6",
				],
				"Statement": "",
				"NodeType": 0,
				"Label": "G7",
				"Annotations": [],
				"Notes": []
			},
			{
				"Children": [
				],
				"Statement": "",
				"NodeType": 3,
				"Label": "E5",
				"Annotations": [],
				"Notes": []
			},
			{
				"Children": [
				],
				"Statement": "",
				"NodeType": 3,
				"Label": "E6",
				"Annotations": [],
				"Notes": []
			},
			{
				"Children": [
				],
				"Statement": "",
				"NodeType": 1,
				"Label": "C5",
				"Annotations": [],
				"Notes": []
			},
			{
				"Children": [
					"C6",
					"E7"
				],
				"Statement": "",
				"NodeType": 0,
				"Label": "G8",
				"Annotations": [],
				"Notes": []
			},
			{
				"Children": [
				],
				"Statement": "",
				"NodeType": 0,
				"Label": "G9",
				"Annotations": [],
				"Notes": []
			},
			{
				"Children": [
				],
				"Statement": "",
				"NodeType": 1,
				"Label": "C6",
				"Annotations": [],
				"Notes": []
			},
			{
				"Children": [
				],
				"Statement": "",
				"NodeType": 3,
				"Label": "E7",
				"Annotations": [],
				"Notes": []
			},
		]
	}

	var Case0: AssureIt.Case = new AssureIt.Case();
	Case0.CommitId = 0;
	var caseDecoder: AssureIt.CaseDecoder = new AssureIt.CaseDecoder();
	var root: AssureIt.NodeModel = caseDecoder.ParseJson(Case0, JsonData);

	Case0.SetElementTop(root);
	var Viewer = new AssureIt.CaseViewer(Case0, pluginManager, serverApi);
	var backgroundlayer = <HTMLDivElement>document.getElementById("background");
	var shapelayer = <SVGGElement><any>document.getElementById("layer0");
	var contentlayer = <HTMLDivElement>document.getElementById("layer1");
	var controllayer = <HTMLDivElement>document.getElementById("layer2");

	var Screen = new AssureIt.ScreenManager(shapelayer, contentlayer, controllayer, backgroundlayer);
	Viewer.Draw(Screen);
});

