// Adapted from:
//  - https://github.com/MithoonKumar/google-doc-paste-plugin-ckeditor
//  - https://ckeditor.com/cke4/addon/googleDocPastePlugin

// Can be removed once this ticket is resolved:
//  - https://github.com/ckeditor/ckeditor-dev/issues/835
//  - https://dev.ckeditor.com/ticket/13877

(function () {
	"use strict";

	function isBold(fontWeight) {
		return fontWeight && (fontWeight === "bold" || (+fontWeight >= 600));
	}

	function recursiveFormatting(context) {
		for (var i = 0; i < context.childNodes.length; i++){
			var clonedEle,
				ele;

			// Italic
			if (context.childNodes[i].style.fontStyle !== "") {
				if (context.childNodes[i].style.fontStyle === "italic") {
					context.childNodes[i].style.fontStyle = null;
					clonedEle = context.childNodes[i].cloneNode(true);
					ele = document.createElement("em");
					ele.append(clonedEle);
					context.replaceChild(ele, context.childNodes[i]);
				} else {
					context.childNodes[i].style.fontStyle = null;
				}
			}

	 		// Underline
			if (context.childNodes[i].style.textDecoration !== "") {
				if (context.childNodes[i].style.textDecoration === "underline") {
					context.childNodes[i].style.textDecoration = null;
					clonedEle = context.childNodes[i].cloneNode(true);
					ele = document.createElement("u");
					ele.append(clonedEle);
					context.replaceChild(ele, context.childNodes[i]);
				} else {
					context.childNodes[i].style.textDecoration = null;
				}
			}

		 	// Bold
			if (context.childNodes[i].style.fontWeight !== "") {
				if (isBold(context.childNodes[i].style.fontWeight)) {
					context.childNodes[i].style.fontWeight = null;
					clonedEle = context.childNodes[i].cloneNode(true);
					ele = document.createElement("strong");
					ele.append(clonedEle);
					context.replaceChild(ele, context.childNodes[i]);
				} else {
					context.childNodes[i].style.fontWeight = null;
				}
			}

			if (context.childNodes[i].children.length > 0) {
				recursiveFormatting(context.childNodes[i]);
			}
		}
	}

	function processFromGoogleDocs(str) {
		var parent = document.createElement("div"),
			parentCopy = document.createElement("div");

		parentCopy.innerHTML = str;

		var len = parentCopy.childNodes[0].children.length;

		for (var i = 0; i < len; i++ ) {
			parent.appendChild(parentCopy.childNodes[0].children[i].cloneNode(true));
		}

		recursiveFormatting(parent);
		return parent.innerHTML;
	}

	CKEDITOR.plugins.add("pastefromgoogledocs", {
		requires: "clipboard",
		init: function (editor) {
			editor.on("paste", function (e) {
				if (e.data &&
						e.data.dataTransfer.hasOwnProperty("_") &&
						e.data.dataTransfer._.hasOwnProperty("data") &&
						e.data.dataTransfer._.data.hasOwnProperty("text/html") &&
						e.data.dataTransfer._.data["text/html"].indexOf("docs-internal-guid") >= 0) {
					var processed = processFromGoogleDocs(e.data.dataTransfer._.data["text/html"]),
						fragment = CKEDITOR.htmlParser.fragment.fromHtml(processed),
						writer = new CKEDITOR.htmlParser.basicWriter();

					if (e.editor.pasteFilter) {
						e.editor.pasteFilter.applyTo(fragment);
					}

					fragment.writeHtml(writer);
					e.data.dataValue = writer.getHtml();
				}
			});
		}
	});
})();
