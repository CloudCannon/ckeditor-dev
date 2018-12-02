(function () {
	function CodeStyleCommand(style, ext) {
		this.style = style;
		this.allowedContent = style;
		this.requiredContent = style;

		CKEDITOR.tools.extend(this, ext, true);
	}

	function selectContents(editor, element) {
		var selectRange = editor.createRange();
		selectRange.selectNodeContents(element);
		selectRange.select();
	}

	function replaceElement(editor, element, newElement) {
		var insertRange = editor.createRange();
		insertRange.setStartAt(element, CKEDITOR.POSITION_BEFORE_START);
		insertRange.collapse(true);

		editor.editable().insertElement(newElement, insertRange);
		element.remove();
	}

	var toggleableElements = {
		p: true,
		pre: true,
		blockquote: true,
		address: true,
		h1: true,
		h2: true,
		h3: true,
		h4: true,
		h5: true,
		h6: true
	};

	CodeStyleCommand.prototype.exec = function (editor) {
		editor.focus();

		var selection = editor.getSelection(),
			selectedText = selection.getSelectedText();

		var element = selection.getStartElement(),
			elementName = element ? element.getName() : null;

		while (element && (!toggleableElements[elementName] && elementName !== "li")) {
			element = element.getParent();
			elementName = element ? element.getName() : null;
		}

		var containerElement = element;
		while (containerElement && containerElement.getName() !== "li") {
			containerElement = containerElement.getParent();
		}

		var isInsideListItem = containerElement && containerElement.getName && containerElement.getName() === "li";

		var shouldToggleCodeBlock = !selectedText.trim() ||
			(element && (
				elementName === "pre" ||
				selectedText.replace(/\s/g, "") === element.getText().replace(/\s/g, "")
			));

		if (shouldToggleCodeBlock) {
			var newElement,
				action,
				insertRange = selection.getRanges()[0],
				testNode = insertRange.getNextNode();

			while (testNode && testNode.type === CKEDITOR.NODE_TEXT && testNode.getText() === "") {
				testNode = testNode.getNext();
			}

			if (isInsideListItem && testNode && testNode.getName && testNode.getName() === "br") {
				action = "append";
				insertRange = selection.getRanges()[0];
				insertRange.setStartAfter(element);
				insertRange.collapse(true);
				newElement = editor.document.createElement("pre");
				newElement.setHtml("<code></code>");
			} else if (toggleableElements[elementName]) {
				action = "replace";
				var contentHtml = element.getHtml().trim().replace(/^<code[^>]*>([\s\S]*)<\/code>(<br>)*$/, "$1");

				if (elementName === "pre") {
					newElement = editor.document.createElement("p");
					newElement.setHtml(contentHtml);
				} else {
					newElement = editor.document.createElement("pre");
					newElement.setHtml("<code>" + contentHtml + "</code>");
				}
			} else if (isInsideListItem) {
				action = "wrap";
			}

			switch (action) {
				case "replace":
					replaceElement(editor, element, newElement);
					selectContents(editor, newElement);
					break;
				case "wrap":
					element.setHtml("<pre><code>" + element.getHtml().trim().replace(/<\/*(pre|code)[^>]*>/gi, "") + "</code></pre>");
					selectContents(editor, element);
					break;
				case "append":
					editor.editable().insertElement(newElement, insertRange);
					selectContents(editor, newElement);

					if (isInsideListItem) {
						var strayParagraph = newElement.getNext();
						if (strayParagraph && strayParagraph.getName && strayParagraph.getName() === "p") {
							strayParagraph.remove();
						}
					}
					break;
				default:
					break;
			}

			return;
		}

		if (this.state === CKEDITOR.TRISTATE_OFF) {
			editor.applyStyle(this.style);
		} else if (this.state === CKEDITOR.TRISTATE_ON) {
			editor.removeStyle(this.style);
		}
	};

	CKEDITOR.plugins.add("cloudcannoncode", {
		icons: 'code', // %REMOVE_LINE_CORE%
		hidpi: true, // %REMOVE_LINE_CORE%

		init: function (editor) {
			var style = new CKEDITOR.style({element: "code"});

			editor.attachStyleStateChange(style, function (state) {
				if (!editor.readOnly) {
					editor.getCommand("code").setState(state);
				}
			});

			editor.addCommand("code", new CodeStyleCommand(style));

			if (editor.ui.addButton) {
				editor.ui.addButton("Code", {
					label: "Code",
					command: "code",
					toolbar: "styles"
				});
			}
		}
	});
})();
