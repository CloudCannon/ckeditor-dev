(function () {
	function CodeStyleCommand(style, ext) {
		this.style = style;
		this.allowedContent = style;
		this.requiredContent = style;

		CKEDITOR.tools.extend(this, ext, true);
	};

	CodeStyleCommand.prototype.exec = function (editor) {
		editor.focus();

		var selection = editor.getSelection(),
			text = selection.getSelectedText();

		var element = selection.getStartElement();
		while (element && (element.getName() !== "p" && element.getName() !== "pre")) {
			element = element.getParent();
		}

		var shouldToggleCodeBlock = !text.trim() ||
			(element && (
				element.getName() === "pre" ||
				text.replace(/\s/g, "") === element.getText().replace(/\s/g, "")
			));

		if (shouldToggleCodeBlock) {
			var newElement;

			if (element.getName() === "p") {
				newElement = editor.document.createElement("pre");
				newElement.setHtml("<code>" + element.getHtml() + "</code>");
			} else {
				newElement = editor.document.createElement("p");
				newElement.setHtml(element.getHtml().trim().replace(/^<code[^>]*>([\s\S]*)<\/code>$/, "$1"));
			}

			var insertRange = editor.createRange();
			insertRange.setStartAt(element, CKEDITOR.POSITION_BEFORE_START);
			insertRange.collapse(true);

			editor.editable().insertElement(newElement, insertRange);
			element.remove();

			var selectRange = editor.createRange();
			selectRange.selectNodeContents(newElement);
			selectRange.select();
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
			})

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
