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
    viewport: "desktop",
    expandedProperties: new Set()
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

  function isLocal() {
    var host = window.location.hostname;
    return host === "localhost" || host === "127.0.0.1" || host === "[::1]";
  }

  function toBase64(str) {
    return btoa(unescape(encodeURIComponent(str)));
  }

  function fromBase64(str) {
    return decodeURIComponent(escape(atob(str)));
  }

  function getIdentityJwt() {
    if (!window.netlifyIdentity) {
      return Promise.reject(new Error("Netlify Identity is not loaded"));
    }
    var user = window.netlifyIdentity.currentUser();
    if (!user) {
      return Promise.reject(new Error("Not signed in"));
    }
    return window.netlifyIdentity.refresh().catch(function () {
      return user.jwt ? user.jwt() : Promise.reject(new Error("Unable to refresh token"));
    });
  }

  function gitGatewayRequest(method, path, body) {
    return getIdentityJwt().then(function (token) {
      var options = {
        method: method,
        headers: { "Authorization": "Bearer " + token }
      };
      if (body !== undefined) {
        options.headers["Content-Type"] = "application/json";
        options.body = JSON.stringify(body);
      }
      return fetch(path, options).then(function (response) {
        if (!response.ok) {
          return response.text().then(function (text) {
            throw new Error("CMS server returned " + response.status + ": " + text);
          });
        }
        if (response.status === 204 || method === "DELETE") return null;
        return response.json().catch(function () { return null; });
      });
    });
  }

  function gitGatewayContentsUrl(repoPath) {
    // Git Gateway proxies GitHub's contents endpoint. The path is passed as-is
    // so literal slashes separate directories; only encode if a segment needs it.
    var parts = repoPath.split("/").map(encodeURIComponent).join("/");
    return "/.netlify/git/github/contents/" + parts;
  }

  function gitGatewayGetFile(repoPath, branch) {
    return gitGatewayRequest(
      "GET",
      gitGatewayContentsUrl(repoPath) + "?ref=" + encodeURIComponent(branch || "main")
    ).then(function (result) {
      if (!result || !result.content) return null;
      return { sha: result.sha, raw: fromBase64(result.content) };
    });
  }

  function gitGatewayPutFile(repoPath, raw, message, branch, sha) {
    var body = {
      message: message || "chore: update content",
      content: toBase64(raw),
      branch: branch || "main"
    };
    if (sha) body.sha = sha;
    return gitGatewayRequest(
      "PUT",
      gitGatewayContentsUrl(repoPath),
      body
    );
  }

  function gitGatewayPutMedia(repoPath, base64Content, message, branch, sha) {
    var body = {
      message: message || "chore: upload media",
      content: base64Content,
      branch: branch || "main"
    };
    if (sha) body.sha = sha;
    return gitGatewayRequest(
      "PUT",
      gitGatewayContentsUrl(repoPath),
      body
    );
  }

  function setStatus(message, tone) {
    if (!els.saveStatus) return;
    els.saveStatus.textContent = message;
    els.saveStatus.setAttribute("data-tone", tone || "neutral");
  }

  var toastTimer = null;
  function showToast(message, tone) {
    var toast = qs("studio-toast");
    if (!toast) {
      toast = document.createElement("div");
      toast.id = "studio-toast";
      toast.className = "studio-toast";
      var app = qs("studio-app") || document.body;
      app.appendChild(toast);
    }
    toast.textContent = message;
    toast.setAttribute("data-tone", tone || "neutral");
    toast.classList.add("is-visible");
    if (toastTimer) clearTimeout(toastTimer);
    toastTimer = setTimeout(function () {
      toast.classList.remove("is-visible");
    }, tone === "error" ? 8000 : 4000);
  }

  function setDirty(isDirty) {
    state.dirty = isDirty;
    if (els.saveSection) {
      var local = isLocal();
      els.saveSection.disabled = state.saving || !state.dirty;
      if (state.saving) {
        els.saveSection.textContent = local ? "Saving..." : "Publishing...";
      } else if (isDirty) {
        els.saveSection.textContent = local ? "Save draft" : "Publish";
      } else {
        els.saveSection.textContent = local ? "Saved" : "Published";
      }
    }
    setStatus(isDirty ? (isLocal() ? "Unsaved local changes" : "Unpublished changes") : "✓ All changes saved", isDirty ? "warn" : "success");
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

  var PROPERTY_SCHEMA = {
    name: { label: "Name", type: "text" },
    slug: { label: "Slug", type: "text" },
    location: { label: "Location", type: "text" },
    postcode: { label: "Postcode", type: "text" },
    summary: { label: "Summary", type: "textarea" },
    description: { label: "Description", type: "textarea" },
    bedrooms: { label: "Bedrooms", type: "number" },
    sleeps: { label: "Sleeps", type: "number" },
    bathrooms: { label: "Bathrooms", type: "number" },
    priceFrom: { label: "Price From", type: "number" },
    heroImage: { label: "Hero Image", type: "image" },
    imageAlt: { label: "Image Alt Text", type: "text" },
    gallery: { label: "Gallery", type: "image-list" },
    highlights: { label: "Highlights", type: "string-list" },
    amenities: { label: "Amenities", type: "string-list" },
    bestFor: { label: "Best For", type: "string-list" },
    mapLabel: { label: "Map Label", type: "text" },
    tokeetRentalId: { label: "Tokeet Rental ID", type: "text" },
    tokeetBookingWidgetCode: { label: "Tokeet Booking Widget Code", type: "textarea" },
    reviews: { label: "Reviews", type: "review-list" }
  };

  function defaultProperty() {
    return {
      name: "New property",
      slug: "",
      location: "",
      postcode: "",
      summary: "",
      description: "",
      bedrooms: 0,
      sleeps: 0,
      bathrooms: 0,
      priceFrom: 0,
      heroImage: "",
      imageAlt: "",
      gallery: [],
      highlights: [],
      amenities: [],
      bestFor: [],
      mapLabel: "",
      tokeetRentalId: "",
      tokeetBookingWidgetCode: "",
      reviews: []
    };
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
    var isLogo = options.field === "logo" || options.key === "logo";
    var fallback = isLogo ? "/logo.png" : "data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7";
    var pathAttr = options.field
      ? ' data-field="' + escapeHtml(options.field) + '"'
      : ' data-list="' + escapeHtml(options.list) + '" data-index="' + options.index + '"' + (options.key ? ' data-key="' + escapeHtml(options.key) + '"' : "") + (options.subindex != null ? ' data-subindex="' + options.subindex + '"' : "");
    var uploadAttr = options.field
      ? ' data-media-upload data-field="' + escapeHtml(options.field) + '"'
      : ' data-media-upload data-list="' + escapeHtml(options.list) + '" data-index="' + options.index + '"' + (options.key ? ' data-key="' + escapeHtml(options.key) + '"' : "") + (options.subindex != null ? ' data-subindex="' + options.subindex + '"' : "");
    return '<label class="media-control"><span>' + escapeHtml(options.label) + '</span>' +
      '<div class="media-field">' +
      '<img src="' + escapeHtml(value || fallback) + '" alt="" onerror="this.style.visibility=\'hidden\'" />' +
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

  function propertyFieldKeys(property) {
    var known = Object.keys(PROPERTY_SCHEMA);
    var extra = Object.keys(property || {}).filter(function (key) {
      return known.indexOf(key) === -1;
    });
    return known.concat(extra);
  }

  function renderPropertyStringList(field, property, index, key, items, label) {
    var list = escapeHtml(field.name);
    var safeKey = escapeHtml(key);
    var safeLabel = escapeHtml(label);
    var values = Array.isArray(items) ? items : [];
    return '<div class="nested-field property-list-field"><span>' + safeLabel + '</span>' +
      '<div class="string-list-items">' +
      values.map(function (item, subindex) {
        return '<div class="string-list-item">' +
          '<input type="text" data-list="' + list + '" data-index="' + index + '" data-key="' + safeKey + '" data-subindex="' + subindex + '" value="' + escapeHtml(item == null ? "" : item) + '" />' +
          '<button type="button" class="list-remove-button" data-remove-list-item data-list="' + list + '" data-index="' + index + '" data-key="' + safeKey + '" data-subindex="' + subindex + '">Remove</button>' +
          '</div>';
      }).join("") +
      '</div>' +
      '<button type="button" class="list-add-button" data-add-list-item data-list="' + list + '" data-index="' + index + '" data-key="' + safeKey + '">+ Add ' + safeLabel + '</button>' +
      '</div>';
  }

  function renderPropertyImageList(field, property, index, key, items, label) {
    var list = escapeHtml(field.name);
    var safeKey = escapeHtml(key);
    var safeLabel = escapeHtml(label);
    var values = Array.isArray(items) ? items : [];
    return '<div class="nested-field property-image-list"><span>' + safeLabel + '</span>' +
      '<div class="image-list-items">' +
      values.map(function (item, subindex) {
        return '<div class="image-list-item">' +
          renderMediaControl({ label: safeLabel + " " + (subindex + 1), list: field.name, index: index, key: key, subindex: subindex, value: item }) +
          '<button type="button" class="list-remove-button" data-remove-list-item data-list="' + list + '" data-index="' + index + '" data-key="' + safeKey + '" data-subindex="' + subindex + '">Remove</button>' +
          '</div>';
      }).join("") +
      '</div>' +
      '<button type="button" class="list-add-button" data-add-list-item data-list="' + list + '" data-index="' + index + '" data-key="' + safeKey + '">+ Add image</button>' +
      '</div>';
  }

  function renderPropertyReviewList(field, property, index, key, reviews, label) {
    var list = escapeHtml(field.name);
    var safeKey = escapeHtml(key);
    var safeLabel = escapeHtml(label);
    var values = Array.isArray(reviews) ? reviews : [];
    return '<div class="nested-field property-review-list"><span>' + safeLabel + '</span>' +
      '<div class="review-list-items">' +
      values.map(function (review, subindex) {
        return '<div class="review-card">' +
          '<label class="nested-field"><span>Quote</span><textarea data-list="' + list + '" data-index="' + index + '" data-key="' + safeKey + '" data-subindex="' + subindex + '" data-subkey="quote">' + escapeHtml(review.quote || "") + '</textarea></label>' +
          '<label class="nested-field"><span>Guest Name</span><input type="text" data-list="' + list + '" data-index="' + index + '" data-key="' + safeKey + '" data-subindex="' + subindex + '" data-subkey="name" value="' + escapeHtml(review.name || "") + '" /></label>' +
          '<label class="nested-field"><span>Guest Type</span><input type="text" data-list="' + list + '" data-index="' + index + '" data-key="' + safeKey + '" data-subindex="' + subindex + '" data-subkey="type" value="' + escapeHtml(review.type || "") + '" /></label>' +
          '<button type="button" class="list-remove-button" data-remove-list-item data-list="' + list + '" data-index="' + index + '" data-key="' + safeKey + '" data-subindex="' + subindex + '">Remove review</button>' +
          '</div>';
      }).join("") +
      '</div>' +
      '<button type="button" class="list-add-button" data-add-list-item data-list="' + list + '" data-index="' + index + '" data-key="' + safeKey + '">+ Add review</button>' +
      '</div>';
  }

  function renderPropertyControl(field, property, index, key) {
    var value = property[key];
    var spec = PROPERTY_SCHEMA[key] || {};
    var label = spec.label || labelFromKey(key);
    var list = escapeHtml(field.name);
    var safeKey = escapeHtml(key);
    var attr = ' data-list="' + list + '" data-index="' + index + '" data-key="' + safeKey + '"';

    if (spec.type === "image-list" || (spec.type === "auto" && key === "gallery" && Array.isArray(value))) {
      return renderPropertyImageList(field, property, index, key, value, label);
    }
    if (spec.type === "review-list" || (spec.type === "auto" && key === "reviews" && Array.isArray(value))) {
      return renderPropertyReviewList(field, property, index, key, value, label);
    }
    if (spec.type === "string-list" || (Array.isArray(value) && (spec.type === "auto" || !spec.type))) {
      return renderPropertyStringList(field, property, index, key, value, label);
    }
    if (spec.type === "image" || isImageKey(key)) {
      return renderMediaControl({ label: label, list: field.name, index: index, key: key, value: value });
    }
    if (spec.type === "textarea" || (spec.type === "auto" && shouldUseTextarea(key, value))) {
      return '<label class="nested-field"><span>' + escapeHtml(label) + '</span><textarea' + attr + '>' + escapeHtml(value || "") + '</textarea></label>';
    }
    var inputType = spec.type === "number" || (spec.type === "auto" && typeof value === "number") ? "number" : "text";
    return '<label class="nested-field"><span>' + escapeHtml(label) + '</span><input type="' + inputType + '"' + attr + ' value="' + escapeHtml(value == null ? "" : value) + '" /></label>';
  }

  function renderPropertyCard(field, property, index) {
    var list = escapeHtml(field.name);
    var isExpanded = state.expandedProperties.has(property);
    var header = '<div class="property-card-header">' +
      '<button type="button" class="property-card-title" data-toggle-property data-list="' + list + '" data-index="' + index + '">' +
      '<strong>' + escapeHtml(property.name || "Property") + '</strong>' +
      '<small>' + escapeHtml([property.location, property.postcode, property.bedrooms ? property.bedrooms + " bedrooms" : "", property.sleeps ? "Sleeps " + property.sleeps : ""].filter(Boolean).join(" · ")) + '</small>' +
      '</button>' +
      '<div class="property-card-actions">' +
      '<button type="button" class="toggle-property-button" data-toggle-property data-list="' + list + '" data-index="' + index + '">' + (isExpanded ? "Collapse" : "Edit") + '</button>' +
      '<button type="button" class="remove-property-button" data-remove-property data-list="' + list + '" data-index="' + index + '">Remove</button>' +
      '</div>' +
      '</div>';

    if (!isExpanded) {
      return '<div class="property-card is-collapsed" data-property-index="' + index + '">' + header + '</div>';
    }

    var keys = propertyFieldKeys(property);
    return '<div class="property-card is-expanded" data-property-index="' + index + '">' +
      header +
      '<div class="property-card-body">' +
      '<div class="nested-grid">' +
      keys.map(function (key) { return renderPropertyControl(field, property, index, key); }).join("") +
      '</div>' +
      '</div>' +
      '</div>';
  }

  function renderPropertyList(field, value) {
    var list = escapeHtml(field.name);
    var properties = Array.isArray(value) ? value : [];
    return '<div class="field"><label>' + escapeHtml(field.label) + '</label>' +
      renderFieldHint(field) +
      '<button type="button" class="add-property-button" data-add-property data-list="' + list + '">+ Add property</button>' +
      '<div class="property-preview" data-list="' + list + '">' +
      properties.map(function (property, index) { return renderPropertyCard(field, property, index); }).join("") +
      '</div>' +
      '</div>';
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

  function renderFieldHint(field) {
    return field.hint ? '<small class="field-hint">' + escapeHtml(field.hint) + '</small>' : '';
  }

  function renderField(field, value) {
    if (field.type === "textarea") {
      return '<div class="field"><label>' + escapeHtml(field.label) + '</label>' +
        renderFieldHint(field) +
        '<textarea data-field="' + escapeHtml(field.name) + '">' + escapeHtml(value || "") + '</textarea></div>';
    }

    if (field.type === "image") {
      return '<div class="field"><label>' + escapeHtml(field.label) + '</label>' + renderFieldHint(field) +
        renderMediaControl({ label: field.label, field: field.name, value: value }) + '</div>';
    }

    if (field.type === "list") {
      var items = Array.isArray(value) ? value : [];
      var summaryFields = field.summaryFields || [];
      var keys = listItemKeys(items, field);
      return '<div class="field"><label>' + escapeHtml(field.label) + '</label>' +
        renderFieldHint(field) +
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
      return renderPropertyList(field, value);
    }

    var type = field.type === "color" ? "color" : "text";
    return '<div class="field"><label>' + escapeHtml(field.label) + '</label>' +
      renderFieldHint(field) +
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
      var local = isLocal();
      els.editorNote.textContent = (local ? "Editing " : "Publishing ") + section.file + (local ? ". Save draft writes to your local content file." : ". Publish commits to Git and triggers a Netlify deploy.");
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

  function isInsideHeaderOrFooter(element) {
    var node = element && element.parentElement;
    while (node) {
      if (node.tagName === "HEADER" || node.tagName === "FOOTER") return true;
      node = node.parentElement;
    }
    return false;
  }

  function srcMatches(src, value) {
    if (!value) return false;
    if (src === value || src.indexOf(value) >= 0) return true;
    try {
      if (decodeURIComponent(src).indexOf(value) >= 0) return true;
    } catch (e) {}
    return false;
  }

  function patchImages(doc, fieldName, oldValue, newValue) {
    if (!/image|logo/i.test(fieldName) || !newValue) return;

    var fallbackLogo = "/logo.png";

    Array.prototype.forEach.call(doc.querySelectorAll("img"), function (img) {
      var src = img.getAttribute("src") || "";
      var alt = img.getAttribute("alt") || "";

      // For normal image fields, only replace images whose current src matches the old value.
      if (!/logo/i.test(fieldName)) {
        if (oldValue && srcMatches(src, oldValue)) {
          img.setAttribute("src", newValue);
        }
        return;
      }

      // For the logo field, only replace actual logo images:
      // - images inside <header> or <footer>
      // - images whose src is (or encodes) the fallback /logo.png path
      var isFallback = src === fallbackLogo || srcMatches(src, fallbackLogo) || src.indexOf("logo.png") >= 0;
      if (isFallback || isInsideHeaderOrFooter(img)) {
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

  function loadContentFromBackend(section) {
    if (isLocal()) {
      return localProxyRequest("getEntry", { branch: "main", path: cleanPath(section.file) })
        .then(function (result) {
          var raw = result && (result.data || (result.entry && result.entry.raw));
          return raw ? JSON.parse(raw) : null;
        });
    }
    return gitGatewayGetFile(cleanPath(section.file), "main")
      .then(function (result) {
        return result && result.raw ? JSON.parse(result.raw) : null;
      });
  }

  function loadSection(section) {
    state.dirty = false;
    setStatus("Loading section...", "neutral");

    return loadContentFromBackend(section)
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

    var local = isLocal();
    state.saving = true;
    if (els.saveSection) {
      els.saveSection.disabled = true;
      els.saveSection.textContent = local ? "Saving..." : "Publishing...";
    }
    setStatus(local ? "Saving draft locally..." : "Publishing to live site...", "neutral");
    showToast(local ? "Saving draft..." : "Publishing to live site...", "neutral");

    var raw = JSON.stringify(state.content, null, 2) + "\n";
    var repoPath = cleanPath(section.file);

    function onSuccess() {
      state.studioContent[section.id] = cloneJson(state.content);
      state.originalContent = cloneJson(state.content);
      state.saving = false;
      setDirty(false);
      applyPreviewPatch();
      showToast(local ? "Draft saved" : "Published! Netlify will rebuild in ~60s.", "success");
    }

    function onError(error) {
      console.error("[Studio] Save failed:", error);
      state.saving = false;
      if (els.saveSection) {
        els.saveSection.disabled = false;
        els.saveSection.textContent = local ? "Save draft" : "Publish";
      }
      var msg = local
        ? "Local save failed. Start npm run cms and try again."
        : "Publish failed: " + (error && error.message ? error.message : "unknown error") + ". Check you are signed in and Git Gateway is enabled.";
      setStatus(msg, "error");
      showToast(msg, "error");
      throw error;
    }

    if (local) {
      return localProxyRequest("persistEntry", {
        branch: "main",
        dataFiles: [{
          slug: section.entry,
          path: repoPath,
          raw: raw
        }],
        assets: [],
        options: {
          branch: "main",
          collectionName: section.collection,
          commitMessage: "chore: update " + section.title,
          useWorkflow: false,
          status: "draft"
        }
      }).then(onSuccess).catch(onError);
    }

    return gitGatewayGetFile(repoPath, "main")
      .catch(function () { return null; })
      .then(function (existing) {
        return gitGatewayPutFile(repoPath, raw, "chore: update " + section.title, "main", existing && existing.sha);
      })
      .then(onSuccess)
      .catch(onError);
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
      var subkey = target.getAttribute("data-subkey");
      var current = state.content[list][index];
      if (key && subindex != null && subkey != null) {
        current[key][Number(subindex)][subkey] = value;
      } else if (key && subindex != null) {
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
    if (!file) {
      console.warn("[Studio] Upload triggered but no file selected");
      return Promise.resolve();
    }

    console.log("[Studio] Upload started:", file.name, file.type, file.size, "bytes");

    var uploadPath = "public/uploads/" + uploadName(file.name);
    var publicPath = "/uploads/" + uploadPath.split("/").pop();
    var local = isLocal();

    // Show loading state on the upload button
    var uploadLabel = input.closest(".upload-button");
    if (uploadLabel) {
      uploadLabel.setAttribute("data-loading", "true");
      uploadLabel.style.opacity = "0.6";
      uploadLabel.style.pointerEvents = "none";
    }

    setStatus("Uploading image...", "neutral");
    showToast("Uploading " + file.name + "...", "neutral");

    function finishLoading() {
      if (uploadLabel) {
        uploadLabel.removeAttribute("data-loading");
        uploadLabel.style.opacity = "";
        uploadLabel.style.pointerEvents = "";
      }
    }

    function applyUpload() {
      console.log("[Studio] Upload succeeded, applying to field:", publicPath);
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
      var msg = local
        ? "Image uploaded. Save draft to keep this change."
        : "Image uploaded. Click Publish to make it live.";
      setStatus(msg, "warn");
      showToast("Image uploaded successfully", "success");
      finishLoading();
    }

    return readFileAsBase64(file)
      .then(function (content) {
        console.log("[Studio] File read as base64, length:", content.length);
        if (local) {
          console.log("[Studio] Uploading via local decap-server proxy");
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
        }
        console.log("[Studio] Uploading via Git Gateway");
        return gitGatewayGetFile(uploadPath, "main")
          .catch(function () { return null; })
          .then(function (existing) {
            return gitGatewayPutMedia(uploadPath, content, "chore: upload CMS image", "main", existing && existing.sha);
          });
      })
      .then(applyUpload)
      .catch(function (error) {
        console.error("[Studio] Upload failed:", error);
        finishLoading();
        var msg = local
          ? "Image upload failed. Start npm run cms and try again."
          : "Image upload failed: " + (error && error.message ? error.message : "unknown error") + ". Check you are signed in and Git Gateway is enabled.";
        setStatus(msg, "error");
        showToast(msg, "error");
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
        var subkey = event.target.getAttribute("data-subkey");
        var current = state.content[list][index];
        var value = event.target.type === "number" ? Number(event.target.value) : event.target.value;
        if (key && subindex != null && subkey != null) {
          current[key][Number(subindex)][subkey] = value;
        } else if (key && subindex != null) {
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
      console.log("[Studio] change event on:", event.target.tagName, "data-media-upload:", event.target.hasAttribute("data-media-upload"));
      if (!event.target.matches("[data-media-upload]")) return;
      handleMediaUpload(event.target).catch(function (error) {
        console.error(error);
      });
    });

    els.editorForm.addEventListener("click", function (event) {
      var toggleProperty = event.target.closest("[data-toggle-property]");
      if (toggleProperty) {
        var list = toggleProperty.getAttribute("data-list");
        var index = Number(toggleProperty.getAttribute("data-index"));
        var property = state.content[list][index];
        if (state.expandedProperties.has(property)) {
          state.expandedProperties.delete(property);
        } else {
          state.expandedProperties.add(property);
        }
        renderEditor();
        return;
      }

      var addProperty = event.target.closest("[data-add-property]");
      if (addProperty) {
        var list = addProperty.getAttribute("data-list");
        state.content[list] = state.content[list] || [];
        var newProperty = cloneJson(defaultProperty());
        state.content[list].unshift(newProperty);
        state.expandedProperties.clear();
        state.expandedProperties.add(newProperty);
        setDirty(true);
        renderEditor();
        return;
      }

      var removeProperty = event.target.closest("[data-remove-property]");
      if (removeProperty) {
        var list = removeProperty.getAttribute("data-list");
        var index = Number(removeProperty.getAttribute("data-index"));
        var property = state.content[list][index];
        if (confirm("Remove this property? This cannot be undone.")) {
          state.expandedProperties.delete(property);
          state.content[list].splice(index, 1);
          setDirty(true);
          renderEditor();
        }
        return;
      }

      var addListItem = event.target.closest("[data-add-list-item]");
      if (addListItem) {
        var list = addListItem.getAttribute("data-list");
        var index = Number(addListItem.getAttribute("data-index"));
        var key = addListItem.getAttribute("data-key");
        var arr = state.content[list][index][key];
        if (key === "reviews") {
          arr.push({ quote: "", name: "", type: "" });
        } else if (isImageKey(key) || key === "gallery") {
          arr.push("");
        } else {
          arr.push("");
        }
        setDirty(true);
        renderEditor();
        return;
      }

      var removeListItem = event.target.closest("[data-remove-list-item]");
      if (removeListItem) {
        var list = removeListItem.getAttribute("data-list");
        var index = Number(removeListItem.getAttribute("data-index"));
        var key = removeListItem.getAttribute("data-key");
        var subindex = Number(removeListItem.getAttribute("data-subindex"));
        state.content[list][index][key].splice(subindex, 1);
        setDirty(true);
        renderEditor();
        return;
      }
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

  function startApp() {
    Promise.all([
      fetch("/cms/studio-manifest.json", { cache: "no-store" }).then(function (response) { return response.json(); }),
      fetch("/cms/studio-content.json", { cache: "no-store" })
        .then(function (response) { return response.ok ? response.json() : { content: {} }; })
        .catch(function () { return { content: {} }; })
    ])
      .then(function (results) {
        state.manifest = results[0];
        state.studioContent = results[1].content || {};
        updateChromeForMode();
        bindEvents();
        return loadSection(getSection());
      })
      .catch(function (error) {
        document.body.innerHTML = '<main style="padding:32px;font-family:system-ui"><h1>Sorted Studio could not load</h1><p>' + escapeHtml(error.message) + '</p><p>Refresh the page, or ask Sorted to check the CMS setup.</p></main>';
      });
  }

  function updateChromeForMode() {
    var local = isLocal();
    if (els.editorNote) {
      els.editorNote.textContent = local
        ? "Editing local content files. Save draft writes to your local content file; publish stays a separate Git/Netlify step."
        : "Editing live site content. Click Publish to commit changes to Git and trigger a Netlify deploy.";
    }
    if (els.saveSection) {
      if (state.dirty) {
        els.saveSection.textContent = local ? "Save draft" : "Publish";
      } else {
        els.saveSection.textContent = local ? "Saved" : "Published";
      }
    }
    if (els.publishNote) {
      els.publishNote.textContent = local
        ? "Draft saves locally. Publishing is handled by Sorted."
        : "Publishing commits to Git. Netlify rebuilds the live site in about 60 seconds.";
    }
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
      editorNote: qs("editor-note"),
      publishNote: qs("publish-note"),
      authOverlay: qs("auth-overlay"),
      loginButton: qs("login-button")
    };

    if (isLocal()) {
      startApp();
      return;
    }

    if (!window.netlifyIdentity) {
      document.body.innerHTML = '<main style="padding:32px;font-family:system-ui"><h1>Sorted Studio could not load</h1><p>Netlify Identity is not loaded. Check that the Identity widget script is included.</p></main>';
      return;
    }

    window.netlifyIdentity.init();

    function onLogin() {
      if (els.authOverlay) els.authOverlay.style.display = "none";
      startApp();
    }

    if (window.netlifyIdentity.currentUser()) {
      onLogin();
      return;
    }

    if (els.authOverlay) els.authOverlay.style.display = "flex";
    if (els.loginButton) {
      els.loginButton.addEventListener("click", function () {
        window.netlifyIdentity.open("login");
      });
    }

    window.netlifyIdentity.on("login", onLogin);
    window.netlifyIdentity.on("error", function (error) {
      console.error("Identity error:", error);
      setStatus("Sign-in error. Please try again.", "error");
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
