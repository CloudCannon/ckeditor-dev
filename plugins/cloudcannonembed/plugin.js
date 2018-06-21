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
				this.element.setHtml(b64DecodeUnicode(this.data.embed));
			},

			downcast: function (element) {
				element.attributes["data-cms-embed"] = this.data.embed;
			},

			upcast: function (element) {
				return element.name === "div" && element.hasClass("cms-embed");
			}
		});
	}
});