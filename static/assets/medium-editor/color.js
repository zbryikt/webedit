 var ColorPickerExtension = MediumEditor.Extension.extend({
      name: "colorPicker",

      init: function () {
        this.button = this.document.createElement('button');
        this.button.classList.add('medium-editor-action');
        this.button.classList.add('editor-color-picker');
        this.button.title = 'Text color'
        this.button.innerHTML = '<i class="fa fa-paint-brush"></i>';

        this.on(this.button, 'click', this.handleClick.bind(this));
      },

      getButton: function () {
        return this.button;
      },

      handleClick: function (e) {
        e.preventDefault();
        e.stopPropagation();

        this.selectionState = this.base.exportSelection();

        // If no text selected, stop here.
        if (this.selectionState && (this.selectionState.end - this.selectionState.start === 0)) {
          return;
        }

        // colors for picker
        var pickerColors = [
          "#1abc9c",
          "#2ecc71",
          "#3498db",
          "#9b59b6",
          "#34495e",
          "#16a085",
          "#27ae60",
          "#2980b9",
          "#8e44ad",
          "#2c3e50",
          "#f1c40f",
          "#e67e22",
          "#e74c3c",
          "#bdc3c7",
          "#95a5a6",
          "#f39c12"
        ];

        var picker = vanillaColorPicker(this.document.querySelector(".medium-editor-toolbar-active .editor-color-picker").parentNode);
        picker.set("customColors", pickerColors);
        picker.set("positionOnTop");
        picker.openPicker();
        picker.on("colorChosen", function (color) {
          this.base.importSelection(this.selectionState);
          this.document.execCommand("styleWithCSS", false, true);
          this.document.execCommand("foreColor", false, color);
        }.bind(this));
      }
    });
