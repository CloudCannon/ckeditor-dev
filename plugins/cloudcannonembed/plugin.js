CKEDITOR.plugins.add("cloudcannonembed", {
	requires: "widget",
	icons: "cloudcannonembed", // %REMOVE_LINE_CORE%
	hidpi: true, // %REMOVE_LINE_CORE%

	init: function (editor) {
		function b64DecodeUnicode(str) {
			return decodeURIComponent(atob(str).split("").map(function (c) {
				return "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2);
			}).join(""));
		}

		// Prevent filtering of [data-cms-embed] elements
		editor.filter.addElementCallback(function (el) {
			if ("data-cms-embed" in el.attributes) {
				return CKEDITOR.FILTER_SKIP_TREE;
			}
		});

		editor.widgets.add("cloudcannonembed", {
			button: "Embed",
			template: "<div class=\"cms-embed\" data-cms-embed></div>",
			draggable: true,

			init: function () {
				var embed = this.element.getAttribute("data-cms-embed");
				this.setData("embed", embed || "");
			},

			data: function () {
				var decoded = b64DecodeUnicode(this.data.embed),
					sanitised = editor.config.sanitiseEmbedHtmlFn(decoded);

				if (decoded !== sanitised) { // Means it contains unsanitised content (i.e. a script tag) or has been tampered with outside editor
					this.element.setHtml(editor.config.unsafeEmbedTemplateFn(decoded));
				} else {
					this.element.setHtml(decoded);
				}
			},

			downcast: function (element) {
				element.attributes["data-cms-embed"] = this.data.embed;

				// Return a clone here so we don't add potential script tags on save
				var cloneEl = element.clone();
				cloneEl.setHtml(b64DecodeUnicode(this.data.embed));
				return cloneEl;
			},

			upcast: function (element) {
				return element.name === "div" && element.hasClass("cms-embed");
			}
		});
	}
});