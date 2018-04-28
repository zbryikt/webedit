 var ColorPickerExtension = MediumEditor.Extension.extend({
      name: "colorPicker",

      init: function () {
        this.button = this.document.createElement('button');
        this.button.classList.add('medium-editor-action');
        this.button.classList.add('editor-color-picker');
        this.button.title = 'Text color'
        this.button.innerHTML = "<div></div>";

        this.on(this.button, 'click', this.handleClick.bind(this));
      },

      getButton: function () {
        return this.button;
      },

      handleClick: function (e) {
        e.preventDefault();
        e.stopPropagation();

        this.selectionState = this.base.exportSelection();
        console.log(this.selectionState);

        // If no text selected, stop here.
        if (this.selectionState && (this.selectionState.end - this.selectionState.start === 0)) {
          return;
        }

        // colors for picker
        var pickerColors = [
          "#212121",
          "#8E8E8E",
          "#C2C4C5",
          "#ffffff",
          "#F44336",
          "#E91E63",
          "#9C27B0",
          "#673AB7",
          "#3F51B5",
          "#2196F3",
          "#03A9F4",
          "#00BCD4",
          "#009688",
          "#4CAF50",
          "#8BC34A",
          "#CDDC39",
          "#FFEB3B",
          "#FFC107",
          "#FF9800",
          "#FF5722",
          "#795548",
          "#607D8B"
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
