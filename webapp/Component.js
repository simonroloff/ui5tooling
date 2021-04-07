sap.ui.define(["sap/ui/core/UIComponent"],
	function(UIComponent) {
	"use strict";

	return UIComponent.extend("kora.pdf.Component", {

		metadata: {
			manifest: "json",
			properties: {
				loadedAoid: "string"
			},
		},

		createContent: function() {
			kora.pdf.that = this;

			kora.pdf.oPdfViewer = new sap.m.PDFViewer({
				showDownloadButton: false,
				displayType: "Embedded"
			});
			jQuery.sap.addUrlWhitelist("blob");
			/*var oBlob = new Blob([getBlob(oEvent.Pdf)], {type: "application/pdf"});
			var oViewer = new sap.m.PDFViewer({
				source: URL.createObjectURL(oBlob),
				showDownloadButton: false
			});
			jQuery.sap.addUrlWhitelist("blob");
			oViewer.open();*/

			return kora.pdf.oPdfViewer;
		},

		initParameter: function(oConfig, oMsgHelper) {
			kora.pdf.sCurCfg = oConfig.Config;
			kora.pdf.oMsgHelper = oMsgHelper;
		},

		openLocalFile: function() {
			kora.pdf.that.oFileDialog = new sap.m.Dialog({
				customHeader: new sap.m.Bar({
					contentMiddle: new sap.m.Label({text: "Open File"}),
					contentRight: new sap.m.Button({
						icon: "sap-icon://decline",
						press: function() {
							kora.pdf.that.oFileDialog.close();
						}
					})
				}),
				content: [
					new sap.ui.unified.FileUploader({
						placeholder: ".pdf",
						multiple: true,
						width: "100%",
						fileType: ["pdf"],
						change: function(oEvent) {
							kora.pdf.that.oFileDialog.close();
							var aFiles = oEvent.getParameters().files;

							kora.pdf.that.applyLocalResource(aFiles[0]);
						}
					})
				],
				contentWidth: window.innerWidth * 0.3 + "px"
			});
			kora.pdf.that.oFileDialog.open();
		},

		applyLocalResource: function(oPdfFile) {
			function getBlob(sBase64) {
				var byteCharacters = atob(sBase64);
				var byteNumbers = new Array(byteCharacters.length);
				for (z = 0; z < byteCharacters.length; z++) {
					byteNumbers[z] = byteCharacters.charCodeAt(z);
				}
				return new Uint8Array(byteNumbers);
			}
			// let oBlob = new Blob([oPdfFile], {type: "application/pdf"});

			kora.pdf.oPdfViewer.setSource(URL.createObjectURL(oPdfFile));
		},

		applyResource: function(fnFinLoad, fnLoadError, bSecond, aFilters) {
			if (aFilters.length > 0) {
				let oModel = kora.pdf.that.getModel("MEDIA_SRV");
				oModel.setHeaders({curcfg: kora.pdf.sCurCfg});

				aFilters.forEach(f => {
					if (f.sPath == "Dynid") kora.pdf.that.setLoadedAoid(f.oValue1);
				});

				let oFile, z;

				function b64DecodeUnicode(str) {
					// Going backwards: from bytestream, to percent-encoding, to original string.
					return decodeURIComponent(atob(str).split("").map(function(c) {
						return "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2);
					}).join(""));
				}

				function getBlob(sBase64) {
					let byteCharacters = atob(sBase64);
					let byteNumbers = new Array(byteCharacters.length);
					for (z = 0; z < byteCharacters.length; z++) {
						byteNumbers[z] = byteCharacters.charCodeAt(z);
					}
					return new Uint8Array(byteNumbers);
				}

				function readThat(resolve, reject) {
					oModel.read("/DynObjDrwCollection", {
						filters: aFilters,
						success: function(oEvent, response) {
							kora.pdf.oMsgHelper.checkHttpResponse(response);
							if (oEvent.results.length > 0) {
								oFile = new Blob([getBlob(oEvent.results[0].Value)],
										{type: oEvent.results[0].MimeType});
								resolve([oFile, fnFinLoad]);
							}
						},
						error: function(oEvent) {
							kora.pdf.oMsgHelper.errorProcessing(oEvent);
						}
					});
				}

				new Promise((resolve, reject) => {
					readThat(resolve, reject);
				}).then((aValues) => {
					console.log(aValues);
					kora.pdf.oPdfViewer.setSource(URL.createObjectURL(aValues[0]));

					if (aValues[1] && typeof aValues[1] == "function") aValues[1]();
				});
			}
		},

		applyHeight: function(sHeight) {
			kora.pdf.oPdfViewer.setHeight(sHeight);
		}
	});
});