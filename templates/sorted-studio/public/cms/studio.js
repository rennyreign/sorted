(function () {
  var state = {
    manifest: null,
    studioContent: null,
    pageId: "home",
    sectionId: "homepage-hero",
    content: {},
    originalContent: {},
    dirty: false,
    saving: false,
    viewport: "desktop"
  };

  var els = {};

  function qs(id) {
    return document.getElementById(id);
  }

  function escapeHtml(value) {
    return String(value == null ? "" : value)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function getPage() {
    return state.manifest.pages.find(function (page) { return page.id === state.pageId; }) || state.manifest.pages[0];
  }

  function getSection() {
    var page = getPage();
    return page.sections.find(function (section) { return section.id === state.sectionId; }) || page.sections[0];
  }

  function cleanPath(path) {
    return String(path || "").replace(/^\//, "");
  }

  function cloneJson(value) {
    return JSON.parse(JSON.stringify(value || {}));
  }

  function localProxyRequest(action, params) {
    return fetch("http://localhost:8081/api/v1", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: action, params: params || {} })
    }).then(function (response) {
      if (!response.ok) {
        throw new Error("Local CMS backend returned " + response.status);
      }
      return response.json();
    });
  }

  function setStatus(message, tone) {
    if (!els.saveStatus) return;
    els.saveStatus.textContent = message;
    els.saveStatus.setAttribute("data-tone", tone || "neutral");
  }

  function setDirty(isDirty) {
    state.dirty = isDirty;
    if (els.saveSection) {
      els.saveSection.disabled = state.saving || !state.dirty;
      els.saveSection.textContent = state.saving ? "Saving..." : state.dirty ? "Save draft" : "Saved";
    }
    setStatus(isDirty ? "Unsaved local changes" : "✓ All changes saved", isDirty ? "warn" : "success");
  }

  function groupFields(fields) {
    return fields.reduce(function (groups, field) {
      var name = field.group || "Content";
      groups[name] = groups[name] || [];
      groups[name].push(field);
      return groups;
    }, {});
  }

  function labelFromKey(key) {
    return String(key || "")
      .replace(/([A-Z])/g, " $1")
      .replace(/[-_]/g, " ")
      .replace(/\b\w/g, function (letter) { return letter.toUpperCase(); })
      .trim();
  }

  function shouldUseTextarea(key, value) {
    return /copy|description|intro|message|quote|summary|text|code/i.test(key) || String(value || "").length > 80;
  }

  function isImageKey(key) {
    return /(^image$|image$|heroImage|mainImage|insetImage|logo|gallery)/i.test(String(key || "")) && !/alt/i.test(String(key || ""));
  }

  function uploadName(name) {
    var parts = String(name || "image").split(".");
    var extension = parts.length > 1 ? parts.pop().toLowerCase() : "bin";
    var base = parts.join(".")
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "") || "image";
    return base + "-" + Date.now() + "." + extension;
  }

  function listItemKeys(items, field) {
    if (field.itemFields && field.itemFields.length) return field.itemFields;
    var keys = [];
    items.forEach(function (item) {
      if (!item || typeof item !== "object" || Array.isArray(item)) return;
      Object.keys(item).forEach(function (key) {
        if (keys.indexOf(key) === -1) keys.push(key);
      });
    });
    return keys.filter(function (key) {
      return ["icon", "title", "copy", "label", "href", "image", "step", "name", "location", "postcode", "summary", "description", "bedrooms", "sleeps", "bathrooms", "priceFrom", "heroImage", "gallery"].indexOf(key) >= 0;
    });
  }

  function renderMediaControl(options) {
    var value = options.value || "";
    var pathAttr = options.field
      ? ' data-field="' + escapeHtml(options.field) + '"'
      : ' data-list="' + escapeHtml(options.list) + '" data-index="' + options.index + '"' + (options.key ? ' data-key="' + escapeHtml(options.key) + '"' : "") + (options.subindex != null ? ' data-subindex="' + options.subindex + '"' : "");
    var uploadAttr = options.field
      ? ' data-media-upload data-field="' + escapeHtml(options.field) + '"'
      : ' data-media-upload data-list="' + escapeHtml(options.list) + '" data-index="' + options.index + '"' + (options.key ? ' data-key="' + escapeHtml(options.key) + '"' : "") + (options.subindex != null ? ' data-subindex="' + options.subindex + '"' : "");
    return '<label class="media-control"><span>' + escapeHtml(options.label) + '</span>' +
      '<div class="media-field">' +
      '<img src="' + escapeHtml(value || "/logo.png") + '" alt="" onerror="this.style.visibility=\'hidden\'" />' +
      '<div class="media-actions">' +
      '<input class="media-path-input" value="' + escapeHtml(value) + '"' + pathAttr + ' />' +
      '<label class="upload-button">Upload image<input type="file" accept="image/*"' + uploadAttr + ' /></label>' +
      '</div></div></label>';
  }

  function renderListControl(field, index, key, value) {
    var label = key ? labelFromKey(key) : field.label;
    var attr = ' data-list="' + escapeHtml(field.name) + '" data-index="' + index + '"' + (key ? ' data-key="' + escapeHtml(key) + '"' : "");
    if (Array.isArray(value)) {
      return '<div class="nested-field"><span>' + escapeHtml(label) + '</span><div class="nested-list">' +
        value.map(function (item, subindex) {
          if (isImageKey(key)) {
            return renderMediaControl({ label: label + " " + (subindex + 1), list: field.name, index: index, key: key, subindex: subindex, value: item });
          }
          return '<label class="nested-field"><span>' + escapeHtml(label + " " + (subindex + 1)) + '</span><input type="text"' + attr + ' data-subindex="' + subindex + '" value="' + escapeHtml(item == null ? "" : item) + '" /></label>';
        }).join("") +
        '</div></div>';
    }
    if (isImageKey(key || field.name)) {
      return renderMediaControl({ label: label, list: field.name, index: index, key: key, value: value });
    }
    if (shouldUseTextarea(key || field.name, value)) {
      return '<label class="nested-field"><span>' + escapeHtml(label) + '</span><textarea' + attr + '>' + escapeHtml(value || "") + '</textarea></label>';
    }
    var type = typeof value === "number" ? "number" : "text";
    return '<label class="nested-field"><span>' + escapeHtml(label) + '</span><input type="' + type + '"' + attr + ' value="' + escapeHtml(value == null ? "" : value) + '" /></label>';
  }

  function renderPageTabs() {
    var html = state.manifest.pages.map(function (page) {
      return '<button class="page-tab ' + (page.id === state.pageId ? 'is-active' : '') + '" type="button" data-page="' + page.id + '">' +
        escapeHtml(page.title) +
        '</button>';
    }).join("");
    els.pageTabs.innerHTML = html;
  }

  function sectionIcon(section) {
    var id = section.id || "";
    var title = section.title || "";
    var key = "file";
    if (/hero|content/i.test(id + title)) key = "layout";
    if (/trust|benefit|why/i.test(id + title)) key = "shield";
    if (/audience|who|family|business|relocation|stay/i.test(id + title)) key = "users";
    if (/cta|enquiry|contact/i.test(id + title)) key = "message";
    if (/propert/i.test(id + title)) key = "home";
    if (/settings|footer/i.test(id + title)) key = "settings";

    var paths = {
      layout: '<rect x="4" y="5" width="16" height="14" rx="2"></rect><path d="M4 10h16"></path><path d="M10 10v9"></path>',
      shield: '<path d="M12 3l7 3v5c0 5-3 8-7 10-4-2-7-5-7-10V6l7-3z"></path><path d="M9 12l2 2 4-5"></path>',
      users: '<path d="M16 20v-2a4 4 0 0 0-4-4H7a4 4 0 0 0-4 4v2"></path><circle cx="9.5" cy="7" r="4"></circle><path d="M22 20v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path>',
      message: '<path d="M21 15a4 4 0 0 1-4 4H8l-5 3V7a4 4 0 0 1 4-4h10a4 4 0 0 1 4 4z"></path>',
      home: '<path d="M3 11l9-8 9 8"></path><path d="M5 10v10h14V10"></path><path d="M9 20v-6h6v6"></path>',
      settings: '<circle cx="12" cy="12" r="3"></circle><path d="M19.4 15a1.7 1.7 0 0 0 .34 1.88l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06A1.7 1.7 0 0 0 15 19.4a1.7 1.7 0 0 0-1 .6 1.7 1.7 0 0 0-.4 1.1V21a2 2 0 1 1-4 0v-.09A1.7 1.7 0 0 0 8.6 19.4a1.7 1.7 0 0 0-1.88.34l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06A1.7 1.7 0 0 0 4.6 15a1.7 1.7 0 0 0-.6-1 1.7 1.7 0 0 0-1.1-.4H3a2 2 0 1 1 0-4h.09A1.7 1.7 0 0 0 4.6 8.6a1.7 1.7 0 0 0-.34-1.88l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06A1.7 1.7 0 0 0 9 4.6a1.7 1.7 0 0 0 1-.6 1.7 1.7 0 0 0 .4-1.1V3a2 2 0 1 1 4 0v.09A1.7 1.7 0 0 0 15.4 4.6a1.7 1.7 0 0 0 1.88-.34l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06A1.7 1.7 0 0 0 19.4 9c.24.37.6.66 1 .8.34.13.71.2 1.1.2H21a2 2 0 1 1 0 4h-.09a1.7 1.7 0 0 0-1.51 1z"></path>',
      file: '<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><path d="M14 2v6h6"></path>'
    };

    return '<span class="section-icon" aria-hidden="true"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round">' + paths[key] + '</svg></span>';
  }

  function renderSectionList() {
    var page = getPage();
    els.crumbPage.textContent = page.title;
    var html = page.sections.map(function (section) {
      return '<button class="section-item ' + (section.id === state.sectionId ? 'is-active' : '') + '" type="button" data-section="' + section.id + '">' +
        sectionIcon(section) +
        '<span class="section-copy">' + escapeHtml(section.title) + '<small>' + escapeHtml(section.summary || section.file) + '</small></span>' +
        '</button>';
    }).join("");
    els.sectionList.innerHTML = html;
  }

  function renderField(field, value) {
    if (field.type === "textarea") {
      return '<div class="field"><label>' + escapeHtml(field.label) + '</label>' +
        '<textarea data-field="' + escapeHtml(field.name) + '">' + escapeHtml(value || "") + '</textarea></div>';
    }

    if (field.type === "image") {
      return '<div class="field">' + renderMediaControl({ label: field.label, field: field.name, value: value }) + '</div>';
    }

    if (field.type === "list") {
      var items = Array.isArray(value) ? value : [];
      var summaryFields = field.summaryFields || [];
      var keys = listItemKeys(items, field);
      return '<div class="field"><label>' + escapeHtml(field.label) + '</label>' +
        '<div class="list-preview">' +
        items.map(function (item, index) {
          if (typeof item === "string") {
            return '<div class="list-card"><strong>Item ' + (index + 1) + '</strong>' +
              renderListControl(field, index, "", item) +
              '</div>';
          }
          var title = item.title || item.name || item.step || "Item " + (index + 1);
          var details = summaryFields.map(function (key) { return item[key]; }).filter(Boolean).join(" · ");
          return '<div class="list-card"><strong>' + escapeHtml(title) + '</strong><small>' + escapeHtml(details) + '</small>' +
            '<div class="nested-grid">' +
            keys.map(function (key) { return renderListControl(field, index, key, item[key]); }).join("") +
            '</div></div>';
        }).join("") +
        '</div></div>';
    }

    if (field.type === "property-list") {
      var properties = Array.isArray(value) ? value : [];
      return '<div class="field"><label>' + escapeHtml(field.label) + '</label>' +
        '<div class="property-preview">' +
        properties.map(function (property, index) {
          var keys = ["name", "location", "postcode", "summary", "bedrooms", "sleeps", "bathrooms", "priceFrom", "heroImage", "imageAlt", "gallery"];
          return '<div class="property-card">' +
            '<strong>' + escapeHtml(property.name || "Property") + '</strong>' +
            '<small>' + escapeHtml([property.location, property.postcode, property.bedrooms ? property.bedrooms + " bedrooms" : "", property.sleeps ? "Sleeps " + property.sleeps : ""].filter(Boolean).join(" · ")) + '</small>' +
            '<small>' + escapeHtml(property.summary || "") + '</small>' +
            '<div class="nested-grid">' +
            keys.map(function (key) { return renderListControl(field, index, key, property[key]); }).join("") +
            '</div>' +
            '</div>';
        }).join("") +
        '</div></div>';
    }

    var type = field.type === "color" ? "color" : "text";
    return '<div class="field"><label>' + escapeHtml(field.label) + '</label>' +
      '<input type="' + type + '" data-field="' + escapeHtml(field.name) + '" value="' + escapeHtml(value || "") + '" />' +
      '</div>';
  }

  function renderEditor() {
    var section = getSection();
    var groups = groupFields(section.fields || []);
    els.crumbSection.textContent = section.title;
    els.editorTitle.textContent = section.title;
    els.editorId.textContent = section.id;
    if (els.editorNote) {
      els.editorNote.textContent = "Editing " + section.file + ". Save draft writes to your local content file; publish remains a separate Git/Netlify step.";
    }

    var html = Object.keys(groups).map(function (groupName) {
      return '<section class="field-group"><h2>' + escapeHtml(groupName) + '</h2>' +
        groups[groupName].map(function (field) {
          return renderField(field, state.content[field.name]);
        }).join("") +
        '</section>';
    }).join("");

    els.editorForm.innerHTML = html || '<p class="editor-note">No editable fields are configured for this section yet.</p>';
  }

  function updatePreview() {
    var section = getSection();
    var path = section.previewPath || getPage().path || "/";
    var url = path;
    els.preview.src = url;
    els.previewUrl.value = window.location.origin + path;
    els.openPreview.href = path;
    els.openPreviewToolbar.href = path;
    els.preview.addEventListener("load", applyPreviewPatch, { once: true });
  }

  function normalizeText(value) {
    return String(value == null ? "" : value).replace(/\s+/g, " ").trim();
  }

  function patchTextNode(doc, oldValue, newValue) {
    var oldText = normalizeText(oldValue);
    var newText = normalizeText(newValue);
    if (!oldText || oldText === newText) return;

    var walker = doc.createTreeWalker(doc.body, NodeFilter.SHOW_TEXT, {
      acceptNode: function (node) {
        var parent = node.parentElement;
        if (!parent || ["SCRIPT", "STYLE", "NOSCRIPT"].indexOf(parent.tagName) >= 0) {
          return NodeFilter.FILTER_REJECT;
        }
        return normalizeText(node.nodeValue).indexOf(oldText) >= 0 ? NodeFilter.FILTER_ACCEPT : NodeFilter.FILTER_SKIP;
      }
    });

    var node = walker.nextNode();
    if (node) {
      node.nodeValue = node.nodeValue.replace(oldValue, newValue);
      if (node.nodeValue === oldValue) node.nodeValue = newValue;
    }
  }

  function patchLinks(doc, fieldName, oldValue, newValue) {
    if (!/href|url|link/i.test(fieldName) || !oldValue || !newValue || oldValue === newValue) return;
    Array.prototype.forEach.call(doc.querySelectorAll("a[href]"), function (link) {
      var href = link.getAttribute("href") || "";
      if (href === oldValue || link.href === oldValue || href.indexOf(oldValue) >= 0) {
        link.setAttribute("href", newValue);
      }
    });
  }

  function patchImages(doc, fieldName, oldValue, newValue) {
    if (!/image|logo/i.test(fieldName) || !newValue) return;
    Array.prototype.forEach.call(doc.querySelectorAll("img"), function (img) {
      var src = img.getAttribute("src") || "";
      var alt = img.getAttribute("alt") || "";
      if (!oldValue || src.indexOf(oldValue) >= 0 || alt === state.originalContent.imageAlt || fieldName === "logo") {
        img.setAttribute("src", newValue);
      }
    });
  }

  function patchStructuredStrings(doc, oldValue, newValue) {
    if (Array.isArray(oldValue) && Array.isArray(newValue)) {
      newValue.forEach(function (newItem, index) {
        patchStructuredStrings(doc, oldValue[index], newItem);
      });
      return;
    }
    if (oldValue && newValue && typeof oldValue === "object" && typeof newValue === "object") {
      Object.keys(newValue).forEach(function (key) {
        patchStructuredStrings(doc, oldValue[key], newValue[key]);
      });
      return;
    }
    if (typeof oldValue === "string" && typeof newValue === "string") {
      patchTextNode(doc, oldValue, newValue);
    }
  }

  function applyPreviewPatch() {
    var doc;
    try {
      doc = els.preview.contentDocument;
    } catch (error) {
      return;
    }
    if (!doc || !doc.body) return;

    var section = getSection();
    (section.fields || []).forEach(function (field) {
      var oldValue = state.originalContent[field.name];
      var newValue = state.content[field.name];
      if (Array.isArray(newValue) || (newValue && typeof newValue === "object")) {
        patchStructuredStrings(doc, oldValue, newValue);
        return;
      }

      if (field.type === "image") {
        patchImages(doc, field.name, oldValue, newValue);
        return;
      }

      patchTextNode(doc, oldValue, newValue);
      patchLinks(doc, field.name, oldValue, newValue);
    });
  }

  function renderChrome() {
    var site = state.manifest.site;
    els.topSiteName.textContent = site.name;
    document.querySelector(".site-mark").textContent = site.initial || site.name.charAt(0);
  }

  function render() {
    renderChrome();
    renderPageTabs();
    renderSectionList();
    renderEditor();
    updatePreview();
  }

  function loadContentFromProxy(section) {
    return localProxyRequest("getEntry", { branch: "main", path: cleanPath(section.file) })
      .then(function (result) {
        var raw = result && (result.data || (result.entry && result.entry.raw));
        return raw ? JSON.parse(raw) : null;
      });
  }

  function loadSection(section) {
    state.dirty = false;
    setStatus("Loading section...", "neutral");

    return loadContentFromProxy(section)
      .catch(function () {
        return state.studioContent && state.studioContent[section.id] ? state.studioContent[section.id] : null;
      })
      .then(function (content) {
        if (content) {
          state.content = cloneJson(content);
          state.originalContent = cloneJson(content);
          render();
          setDirty(false);
          return;
        }

        state.content = {};
        state.originalContent = {};
        render();
        els.editorForm.innerHTML = '<p class="editor-note">No Studio content snapshot was found for this section. Open Decap to edit the original content.</p>';
        setStatus("No section content found", "warn");
      });
  }

  function saveSection() {
    var section = getSection();
    if (!state.dirty || state.saving) return Promise.resolve();

    state.saving = true;
    if (els.saveSection) {
      els.saveSection.disabled = true;
      els.saveSection.textContent = "Saving...";
    }
    setStatus("Saving draft locally...", "neutral");

    return localProxyRequest("persistEntry", {
      branch: "main",
      dataFiles: [{
        slug: section.entry,
        path: cleanPath(section.file),
        raw: JSON.stringify(state.content, null, 2) + "\n"
      }],
      assets: [],
      options: {
        branch: "main",
        collectionName: section.collection,
        commitMessage: "chore: update " + section.title,
        useWorkflow: false,
        status: "draft"
      }
    }).then(function () {
      state.studioContent[section.id] = cloneJson(state.content);
      state.originalContent = cloneJson(state.content);
      state.saving = false;
      setDirty(false);
      applyPreviewPatch();
    }).catch(function (error) {
      state.saving = false;
      if (els.saveSection) {
        els.saveSection.disabled = false;
        els.saveSection.textContent = "Save draft";
      }
      setStatus("Local save failed. Start npm run cms, or publish in Decap.", "error");
      throw error;
    });
  }

  function readFileAsBase64(file) {
    return new Promise(function (resolve, reject) {
      var reader = new FileReader();
      reader.onload = function () {
        var result = String(reader.result || "");
        resolve(result.indexOf(",") >= 0 ? result.split(",")[1] : result);
      };
      reader.onerror = function () { reject(reader.error || new Error("Could not read file")); };
      reader.readAsDataURL(file);
    });
  }

  function setValueFromElementTarget(target, value) {
    var field = target.getAttribute("data-field");
    var list = target.getAttribute("data-list");
    if (list) {
      var index = Number(target.getAttribute("data-index"));
      var key = target.getAttribute("data-key");
      var subindex = target.getAttribute("data-subindex");
      var current = state.content[list][index];
      if (key && subindex != null) {
        current[key][Number(subindex)] = value;
      } else if (key) {
        current[key] = value;
      } else {
        state.content[list][index] = value;
      }
      return;
    }
    if (field) state.content[field] = value;
  }

  function handleMediaUpload(input) {
    var file = input.files && input.files[0];
    if (!file) return Promise.resolve();

    var uploadPath = "public/uploads/" + uploadName(file.name);
    var publicPath = "/uploads/" + uploadPath.split("/").pop();
    setStatus("Uploading image...", "neutral");

    return readFileAsBase64(file)
      .then(function (content) {
        return localProxyRequest("persistMedia", {
          branch: "main",
          asset: {
            path: uploadPath,
            content: content,
            encoding: "base64"
          },
          options: {
            commitMessage: "chore: upload CMS image"
          }
        });
      })
      .then(function () {
        setValueFromElementTarget(input, publicPath);
        var mediaField = input.closest(".media-field");
        if (mediaField) {
          var image = mediaField.querySelector("img");
          var pathInput = mediaField.querySelector(".media-path-input");
          if (image) {
            image.src = publicPath;
            image.style.visibility = "visible";
          }
          if (pathInput) pathInput.value = publicPath;
        }
        setDirty(true);
        applyPreviewPatch();
        setStatus("Image uploaded. Save draft to keep this section update.", "warn");
      })
      .catch(function (error) {
        setStatus("Image upload failed. Start npm run cms and try again.", "error");
        throw error;
      });
  }

  function setPage(pageId) {
    var page = state.manifest.pages.find(function (candidate) { return candidate.id === pageId; });
    if (!page) return;
    state.pageId = page.id;
    state.sectionId = page.sections[0].id;
    loadSection(getSection());
  }

  function setSection(sectionId) {
    var page = getPage();
    var section = page.sections.find(function (candidate) { return candidate.id === sectionId; });
    if (!section) return;
    state.sectionId = section.id;
    loadSection(section);
  }

  function bindEvents() {
    els.pageTabs.addEventListener("click", function (event) {
      var button = event.target.closest("[data-page]");
      if (button) setPage(button.getAttribute("data-page"));
    });

    els.sectionList.addEventListener("click", function (event) {
      var button = event.target.closest("[data-section]");
      if (button) setSection(button.getAttribute("data-section"));
    });

    els.editorForm.addEventListener("input", function (event) {
      if (event.target.matches("[data-media-upload]")) return;
      var field = event.target.getAttribute("data-field");
      var list = event.target.getAttribute("data-list");
      if (!field && !list) return;
      if (list) {
        var index = Number(event.target.getAttribute("data-index"));
        var key = event.target.getAttribute("data-key");
        var subindex = event.target.getAttribute("data-subindex");
        var current = state.content[list][index];
        var value = event.target.type === "number" ? Number(event.target.value) : event.target.value;
        if (key && subindex != null) {
          current[key][Number(subindex)] = value;
        } else if (key) {
          current[key] = value;
        } else {
          state.content[list][index] = value;
        }
      } else {
        state.content[field] = event.target.value;
      }
      setDirty(true);
      applyPreviewPatch();
    });

    els.editorForm.addEventListener("change", function (event) {
      if (!event.target.matches("[data-media-upload]")) return;
      handleMediaUpload(event.target).catch(function (error) {
        console.error(error);
      });
    });

    els.saveSection.addEventListener("click", function () {
      saveSection().catch(function (error) {
        console.error(error);
      });
    });

    els.refreshPreview.addEventListener("click", function () {
      updatePreview();
    });

    els.desktopPreview.addEventListener("click", function () {
      state.viewport = "desktop";
      document.querySelector(".preview-frame-shell").classList.remove("is-mobile");
      els.desktopPreview.classList.add("is-active");
      els.mobilePreview.classList.remove("is-active");
    });

    els.mobilePreview.addEventListener("click", function () {
      state.viewport = "mobile";
      document.querySelector(".preview-frame-shell").classList.add("is-mobile");
      els.mobilePreview.classList.add("is-active");
      els.desktopPreview.classList.remove("is-active");
    });

    document.querySelectorAll(".nav-item").forEach(function (item) {
      item.addEventListener("click", function () {
        document.querySelectorAll(".nav-item").forEach(function (button) {
          button.classList.remove("is-active");
          button.setAttribute("aria-pressed", "false");
        });
        item.classList.add("is-active");
        item.setAttribute("aria-pressed", "true");
        var view = item.getAttribute("data-view");
        if (view === "pages") setPage("home");
        if (view === "settings") setPage("settings");
      });
    });
  }

  function init() {
    els = {
      topSiteName: qs("top-site-name"),
      pageTabs: qs("page-tabs"),
      sectionList: qs("section-list"),
      crumbPage: qs("crumb-page"),
      crumbSection: qs("crumb-section"),
      editorTitle: qs("editor-title"),
      editorId: qs("editor-id"),
      editorForm: qs("editor-form"),
      preview: qs("site-preview"),
      previewUrl: qs("preview-url"),
      openPreview: qs("open-preview"),
      openPreviewToolbar: qs("open-preview-toolbar"),
      refreshPreview: qs("refresh-preview"),
      desktopPreview: qs("desktop-preview"),
      mobilePreview: qs("mobile-preview"),
      saveSection: qs("save-section"),
      saveStatus: qs("save-status"),
      editorNote: qs("editor-note")
    };

    Promise.all([
      fetch("/cms/studio-manifest.json", { cache: "no-store" }).then(function (response) { return response.json(); }),
      fetch("/cms/studio-content.json", { cache: "no-store" })
        .then(function (response) { return response.ok ? response.json() : { content: {} }; })
        .catch(function () { return { content: {} }; })
    ])
      .then(function (results) {
        state.manifest = results[0];
        state.studioContent = results[1].content || {};
        bindEvents();
        return loadSection(getSection());
      })
      .catch(function (error) {
        document.body.innerHTML = '<main style="padding:32px;font-family:system-ui"><h1>Sorted Studio could not load</h1><p>' + escapeHtml(error.message) + '</p><p>Refresh the page, or ask Sorted to check the local CMS server.</p></main>';
      });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
