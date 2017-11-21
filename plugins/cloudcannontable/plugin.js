// Based on code from https://github.com/ckeditor/ckeditor-dev/pull/92

(function () {
	CKEDITOR.plugins.add("cloudcannontable", {
		requires: "table,panelbutton,floatpanel",

		afterInit: function (editor) {
			var options = editor.config.tableOptions || {
				rows: 5,
				columns: 5,
				hoverBackground: "#ebebeb"
			};

			function insertTable(rows, columns) {
				var table = new CKEDITOR.dom.element("table", editor.document),
					tbody = table.append(new CKEDITOR.dom.element("tbody", editor.document));

				for (var i = 0; i < rows; i++) {
					var row = tbody.append(new CKEDITOR.dom.element("tr", editor.document));

					for (var j = 0; j < columns; j++) {
						var cell = row.append(new CKEDITOR.dom.element("td", editor.document));
						cell.appendBogus();
					}
				}

				editor.insertElement(table);
			}

			function renderQuickTable() {
				var clickFn = CKEDITOR.tools.addFunction(function (i, j) {
					insertTable(parseInt(i, 10) + 1, parseInt(j, 10) + 1);
				});

				var output = "<a class='cke_table_grid'><table>";

				for (var i = 0; i < options.rows; i++) {
					output += "<tr>";

					for (var j = 0; j < options.columns; j++) {
						output += "<td data-row='" + (i + 1) + "' " +
							"data-column='" + (j + 1) + "' " +
							"onclick='CKEDITOR.tools.callFunction(" + clickFn + ", " + i + ", " + j + "); return false;'></td>";
					}

					output += "</tr>";
				}

				return output + "</table></a>";
			}

			var selection = {
				row: -1,
				column: -1
			};

			function updateSelection(table, row, column) {
				var rows = table.$.tBodies[0].rows;

				for (var i = 0; i < rows.length; i++) {
					for (var j = 0; j < rows[i].cells.length; j++) {
						rows[i].cells[j].style.background = (i < row && j < column) ? options.hoverBackground : "";
					}
				}

				selection.row = row - 1;
				selection.column = column - 1;
			}

			editor.ui.add("Table", CKEDITOR.UI_PANELBUTTON, {
				hasArrow: false,
				label: editor.lang.table.toolbar,
				command: "table",
				modes: {wysiwyg: 1},
				editorFocus: 0,
				toolbar: "insert,30",
				caption: null,
				table: null,
				panel: {
					css: CKEDITOR.skin.getPath("editor"),
					attributes: {role: "listbox", "aria-label": ""}
				},

				onBlock: function (panel, block) {
					block.autoSize = true;
					block.element.addClass("cke_colorblock");

					var tableWrapper = CKEDITOR.dom.element.createFromHtml(renderQuickTable());
					var table = this.table = tableWrapper.getFirst();

					table.on("mouseleave", function (e) {
						updateSelection(table, 1, 1);
					});

					table.on("mousemove", function (e) {
						var target = e.data.getTarget();
						if (target.getName() === "td") {
							var row = parseInt(target.getAttribute("data-row"), 10),
								column = parseInt(target.getAttribute("data-column"), 10);

							updateSelection(table, row, column);
						}
					});

					block.element.append(tableWrapper);
					CKEDITOR.ui.fire("ready", this);
				},

				onOpen: function () {
					updateSelection(this.table, 1, 1);
				}
			});
		}
	});
})();