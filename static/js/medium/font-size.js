var mediumEditorFontsizeExtension;mediumEditorFontsizeExtension={},function(){var t;return t={name:"font-size",init:function(t){var e,i=this;return console.log("inited"),this.button=this.document.createElement("button"),this.button.classList.add("medium-editor-action","medium-editor-font-size"),this.button.innerHTML="<span style='font-family:serif;'>T<small style='font-size:0.7em'>T</small></span>",this.on(this.button,"click",function(t){return i.handleClick(t)}),this.div=e=document.createElement("div"),e.classList.add("medium-editor-font-size-list"),document.body.appendChild(e),e.innerHTML=["<div class='list'>","<div class='item'>Auto</div>"].concat(function(){var e,i,n,o=[];for(e=0,n=(i=[12,14,18,24,30,36,48,60,72,96]).length;n>e;++e)t=i[e],o.push("<div class='item' data-size='"+t+"'>"+t+"px</div>");return o}(),["</div>"]).join(""),this.subscribe("hideToolbar",function(){return i.div.style.display="none"}),e.style.display="none",e.addEventListener("click",function(t){var n,o,s;if(t.target&&t.target.getAttribute){for(n=+t.target.getAttribute("data-size"),i.base.importSelection(i.selectionState),i.document.execCommand("styleWithCSS",!1,!0),i.document.execCommand("fontSize",!1,7),o=window.getSelection().getRangeAt(0),s=o.startContainer;!(!s||!s.getAttribute&&3!==s.nodeType||s.getAttribute&&s.style);)s=s.parentNode;return s.style&&(s.style.fontSize=isNaN(n)||!n?"":n+"px",i.trigger("editableInput",{},s)),e.style.display="none"}})},getButton:function(){return this.button},handleClick:function(t){var e,i;return t.preventDefault(),t.stopPropagation(),this.selectionState=this.base.exportSelection(),e=this.document.querySelector(".medium-editor-toolbar-active .medium-editor-font-size").parentNode,i=e.getBoundingClientRect(),this.div.style.top=i.y+i.height+document.scrollingElement.scrollTop+"px",this.div.style.left=i.x+"px",this.div.style.display="block"}},mediumEditorFontsizeExtension=MediumEditor.Extension.extend(t)}();