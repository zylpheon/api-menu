let addPromoModal, editPromoModal, deletePromoModal;

document.addEventListener("DOMContentLoaded", function () {
  const promoTable = document.getElementById("promoTable");

  addPromoModal = new bootstrap.Modal(document.getElementById("addPromoModal"));
  editPromoModal = new bootstrap.Modal(
    document.getElementById("editPromoModal")
  );
  deletePromoModal = new bootstrap.Modal(
    document.getElementById("deletePromoModal")
  );

  document.getElementById("savePromoBtn").addEventListener("click", addPromo);
  document
    .getElementById("updatePromoBtn")
    .addEventListener("click", updatePromo);
  document
    .getElementById("confirmDeletePromoBtn")
    .addEventListener("click", deletePromo);

  const addImageUrl = document.getElementById("imageUrl");
  if (addImageUrl) {
    addImageUrl.addEventListener("blur", function () {
      previewImageFromUrl("imageUrl", "imageUrlPreview");
    });
  }

  const editImageUrl = document.getElementById("edit_imageUrl");
  if (editImageUrl) {
    editImageUrl.addEventListener("blur", function () {
      previewImageFromUrl("edit_imageUrl", "editImageUrlPreview");
    });
  }

  // Add required attribute to form fields
  const requiredFields = [
    "title",
    "description",
    "time_start",
    "time_end",
    "imageUrl",
    "edit_title",
    "edit_description",
    "edit_time_start",
    "edit_time_end",
    "edit_imageUrl",
  ];

  requiredFields.forEach((fieldId) => {
    const field = document.getElementById(fieldId);
    if (field) {
      field.setAttribute("required", "required");

      // Clear invalid state when user types
      field.addEventListener("input", function () {
        this.classList.remove("is-invalid");
      });
    }
  });

  initializeDatePickers();

  const addPromoModalElement = document.getElementById("addPromoModal");
  if (addPromoModalElement) {
    addPromoModalElement.addEventListener("shown.bs.modal", function () {
      initializeDatePickers();
    });
  }

  const editPromoModalElement = document.getElementById("editPromoModal");
  if (editPromoModalElement) {
    editPromoModalElement.addEventListener("shown.bs.modal", function () {
      initializeDatePickers();
    });
  }
});

function previewImageFromUrl(inputId, previewId) {
  const urlInput = document.getElementById(inputId);
  const previewContainer = document.getElementById(previewId);

  if (!urlInput || !previewContainer) return;

  if (urlInput.value.trim()) {
    previewContainer.innerHTML = `
      <div class="mt-2">
        <p class="mb-1">Preview:</p>
        <img src="${urlInput.value}" alt="Preview" class="img-thumbnail" style="max-height: 150px;">
      </div>
    `;
  } else {
    previewContainer.innerHTML = "";
  }
}

function initializeDatePickers() {
  flatpickr("#time_start", {
    enableTime: false,
    dateFormat: "Y-m-d",
    altInput: true,
    altFormat: "d F Y",
    locale: "id",
  });

  flatpickr("#time_end", {
    enableTime: false,
    dateFormat: "Y-m-d",
    altInput: true,
    altFormat: "d F Y",
    locale: "id",
  });

  flatpickr("#edit_time_start", {
    enableTime: false,
    dateFormat: "Y-m-d",
    altInput: true,
    altFormat: "d F Y",
    locale: "id",
  });

  flatpickr("#edit_time_end", {
    enableTime: false,
    dateFormat: "Y-m-d",
    altInput: true,
    altFormat: "d F Y",
    locale: "id",
  });
}

async function loadPromos() {
  showLoading(true);
  try {
    const response = await fetchWithHeaders(`${API_URL}/promo`);

    if (!response.ok) {
      throw new Error(`API responded with status: ${response.status}`);
    }

    const responseText = await response.text();
    debugLog("Raw API response for promos", responseText);

    if (!responseText.trim()) {
      throw new Error("API returned empty response");
    }

    try {
      const data = JSON.parse(responseText);
      debugLog("Parsed JSON data for promos", data);

      if (data.status === 200 && Array.isArray(data.values)) {
        renderPromoTable(data.values);
        showNotification("Data promo berhasil dimuat", "success");
      } else {
        throw new Error("Format data tidak sesuai yang diharapkan");
      }
    } catch (parseError) {
      debugLog("JSON parse error", parseError);
      throw new Error(
        `Respons API bukan dalam format JSON yang valid: ${parseError.message}`
      );
    }
  } catch (error) {
    console.error("Error loading promos:", error);
    console.error("Gagal memuat data promo: " + error.message);

    const promoTable = document.getElementById("promoTable");

    if (promoTable) {
      promoTable.innerHTML = `
        <tr>
          <td colspan="7" class="text-center">Error loading data: ${error.message}</td>
        </tr>
      `;
    }
  } finally {
    showLoading(false);
  }
}

function renderPromoTable(promos) {
  const promoTable = document.getElementById("promoTable");
  if (!promoTable) return;

  promoTable.innerHTML = "";

  if (promos.length === 0) {
    promoTable.innerHTML = `
      <tr>
        <td colspan="7" class="text-center">Tidak ada data promo</td>
      </tr>
    `;
    return;
  }

  promos.sort((a, b) => a.id - b.id);

  promos.forEach((promo, index) => {
    const title = escapeHtml(promo.title || "");
    const description = escapeHtml(promo.description || "-");

    const startDate = new Date(promo.time_start).toLocaleDateString("id-ID");
    const endDate = new Date(promo.time_end).toLocaleDateString("id-ID");

    const now = new Date();
    const start = new Date(promo.time_start);
    const end = new Date(promo.time_end);
    end.setHours(23, 59, 59, 999);
    const isActive = now >= start && now <= end;
    const statusBadge = isActive
      ? '<span class="badge bg-success">Aktif</span>'
      : '<span class="badge bg-secondary">Tidak Aktif</span>';

    promoTable.innerHTML += `
      <tr>
        <td class="align-middle">${index + 1}</td>
        <td class="align-middle">${title}</td>
        <td class="align-middle">${description.substring(0, 50)}${
      description.length > 50 ? "..." : ""
    }</td>
        <td class="align-middle">${startDate}</td>
        <td class="align-middle">${endDate}</td>
        <td class="align-middle">${statusBadge}</td>
        <td class="align-middle">
          <button class="btn btn-sm btn-primary edit-promo-btn" 
            data-id="${promo.id}">
            <i class="bi bi-pencil-square"></i> Edit
          </button>
          <button class="btn btn-sm btn-danger delete-promo-btn" 
            data-id="${promo.id}" data-name="${title}">
            <i class="bi bi-trash"></i> Hapus
          </button>
        </td>
      </tr>
    `;
  });

  document.querySelectorAll(".edit-promo-btn").forEach((btn) => {
    btn.addEventListener("click", function () {
      const id = this.getAttribute("data-id");
      fetchSinglePromo(id);
    });
  });

  document.querySelectorAll(".delete-promo-btn").forEach((btn) => {
    btn.addEventListener("click", function () {
      const id = this.getAttribute("data-id");
      const name = this.getAttribute("data-name");
      openDeletePromoModal(id, name);
    });
  });
}

async function fetchSinglePromo(id) {
  showLoading(true);
  try {
    let response = await fetchWithHeaders(`${API_URL}/promo/${id}`);

    if (!response.ok) {
      throw new Error(`API responded with status: ${response.status}`);
    }

    let responseText = await response.text();
    debugLog(`Fetching promo item with ID: ${id}`, responseText);

    try {
      const data = JSON.parse(responseText);

      if (data.status === 200 && data.values) {
        if (Array.isArray(data.values) && data.values.length > 0) {
          openEditPromoModal(data.values[0]);
        } else if (typeof data.values === "object") {
          openEditPromoModal(data.values);
        } else {
          throw new Error("Unexpected data format");
        }
      } else {
        response = await fetchWithHeaders(`${API_URL}/promo`);

        if (!response.ok) {
          throw new Error(`API responded with status: ${response.status}`);
        }

        responseText = await response.text();
        const allData = JSON.parse(responseText);

        if (allData.status === 200 && Array.isArray(allData.values)) {
          const promoItem = allData.values.find((item) => item.id == id);

          if (promoItem) {
            openEditPromoModal(promoItem);
          } else {
            throw new Error(`Promo dengan ID ${id} tidak ditemukan`);
          }
        } else {
          throw new Error("Format data tidak sesuai yang diharapkan");
        }
      }
    } catch (parseError) {
      debugLog("JSON parse error", parseError);
      throw new Error(
        `Respons API bukan dalam format JSON yang valid: ${parseError.message}`
      );
    }
  } catch (error) {
    console.error("Error fetching promo:", error);
    showNotification(`Gagal memuat data promo: ${error.message}`, "danger");
  } finally {
    showLoading(false);
  }
}

function openEditPromoModal(promo) {
  const editIdElement = document.getElementById("edit_id");
  const editTitleElement = document.getElementById("edit_title");
  const editDescriptionElement = document.getElementById("edit_description");
  const editTimeStartElement = document.getElementById("edit_time_start");
  const editTimeEndElement = document.getElementById("edit_time_end");
  const editImageUrlElement = document.getElementById("edit_imageUrl");
  const imagePreview = document.getElementById("editImageUrlPreview");

  if (
    !editIdElement ||
    !editTitleElement ||
    !editDescriptionElement ||
    !editTimeStartElement ||
    !editTimeEndElement ||
    !editImageUrlElement ||
    !imagePreview
  ) {
    console.error("One or more edit form elements not found");
    return;
  }

  editIdElement.value = promo.id;
  editTitleElement.value = promo.title || "";
  editDescriptionElement.value = promo.description || "";

  if (promo.time_start) {
    const startDate = new Date(promo.time_start);
    editTimeStartElement.value = formatDateForPicker(startDate);
  } else {
    editTimeStartElement.value = "";
  }

  if (promo.time_end) {
    const endDate = new Date(promo.time_end);
    editTimeEndElement.value = formatDateForPicker(endDate);
  } else {
    editTimeEndElement.value = "";
  }

  editImageUrlElement.value = promo.image || "";

  if (promo.image) {
    imagePreview.innerHTML = `<img src="${promo.image}" class="img-thumbnail mt-2" style="max-height: 150px;">`;
  } else {
    imagePreview.innerHTML = "";
  }

  editPromoModal.show();

  setTimeout(() => {
    initializeDatePickers();
  }, 100);
}

function formatDateForPicker(date) {
  if (!date || isNaN(date.getTime())) {
    return "";
  }

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function openDeletePromoModal(id, name) {
  const deleteIdElement = document.getElementById("delete_promo_id");
  const deleteNameElement = document.getElementById("deletePromoName");

  if (!deleteIdElement || !deleteNameElement) {
    console.error("Delete modal elements not found");
    return;
  }

  deleteIdElement.value = id;
  deleteNameElement.textContent = name;
  deletePromoModal.show();
}

async function addPromo() {
  const form = document.getElementById("addPromoForm");

  if (!form) {
    console.error("Add promo form not found");
    return;
  }

  // Get form elements
  const titleElement = document.getElementById("title");
  const descriptionElement = document.getElementById("description");
  const timeStartElement = document.getElementById("time_start");
  const timeEndElement = document.getElementById("time_end");
  const imageUrlElement = document.getElementById("imageUrl");

  if (
    !titleElement ||
    !descriptionElement ||
    !timeStartElement ||
    !timeEndElement ||
    !imageUrlElement
  ) {
    console.error("One or more form elements not found");
    return;
  }

  // Prevent default form submission which might be clearing values
  form.addEventListener('submit', (e) => {
    e.preventDefault();
  });

  // Get values directly from the DOM elements
  const title = titleElement.value.trim();
  const description = descriptionElement.value.trim();
  const time_start = timeStartElement.value.trim();
  const time_end = timeEndElement.value.trim();
  const imageUrl = imageUrlElement.value.trim();

  console.log("Form elements:", {
    titleElement,
    imageUrlElement
  });
  
  console.log("Form values before submission:", {
    title,
    description,
    time_start,
    time_end,
    imageUrl,
  });

  // Reset all validation states first
  titleElement.classList.remove("is-invalid");
  descriptionElement.classList.remove("is-invalid");
  timeStartElement.classList.remove("is-invalid");
  timeEndElement.classList.remove("is-invalid");
  imageUrlElement.classList.remove("is-invalid");

  // Validate only the required fields
  let hasError = false;
  let errorFields = [];

  // Check if the values are actually empty after trimming
  if (!title) {
    titleElement.classList.add("is-invalid");
    hasError = true;
    errorFields.push("Judul Promo");
  }

  if (!description) {
    descriptionElement.classList.add("is-invalid");
    hasError = true;
    errorFields.push("Deskripsi Promo");
  }

  if (!time_start) {
    timeStartElement.classList.add("is-invalid");
    hasError = true;
    errorFields.push("Tanggal Mulai");
  }

  if (!time_end) {
    timeEndElement.classList.add("is-invalid");
    hasError = true;
    errorFields.push("Tanggal Berakhir");
  }

  if (!imageUrl) {
    imageUrlElement.classList.add("is-invalid");
    hasError = true;
    errorFields.push("URL Gambar");
  }

  if (hasError) {
    showNotification(`Field berikut wajib diisi: ${errorFields.join(", ")}`, "danger");
    return;
  }

  // URL validation - make it less strict
  if (imageUrl && !imageUrl.startsWith("http")) {
    imageUrlElement.classList.add("is-invalid");
    showNotification(
      "Format URL gambar harus dimulai dengan http:// atau https://",
      "danger"
    );
    return;
  }

  // Date validation
  const startDate = new Date(time_start);
  const endDate = new Date(time_end);

  if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
    showNotification("Format tanggal tidak valid", "danger");
    return;
  }

  if (endDate <= startDate) {
    showNotification("Tanggal berakhir harus setelah tanggal mulai", "danger");
    return;
  }

  // Prepare the request data - map form fields to database fields
  const requestData = {
    title: title, // "title" in form maps to "title" in database
    description: description,
    time_start: time_start,
    time_end: time_end,
    image: imageUrl, // "imageUrl" in form maps to "image" in database
  };

  console.log("Request data being sent:", requestData);

  showLoading(true);
  try {
    debugLog("Sending POST request to /promo with data:", requestData);

    const response = await fetchWithHeaders(`${API_URL}/promo`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "ngrok-skip-browser-warning": "1",
      },
      body: JSON.stringify(requestData),
    });

    if (!response.ok) {
      throw new Error(`API responded with status: ${response.status}`);
    }

    const responseText = await response.text();
    debugLog("Raw API response from POST", responseText);

    try {
      const data = JSON.parse(responseText);
      debugLog("Parsed JSON response from POST", data);

      if (data.status === 200) {
        showNotification("Promo berhasil ditambahkan", "success");
        form.reset();
        addPromoModal.hide();
        loadPromos();
      } else {
        throw new Error(data.values?.message || "Gagal menambahkan promo");
      }
    } catch (parseError) {
      throw new Error(
        `Respons API bukan dalam format JSON yang valid: ${parseError.message}`
      );
    }
  } catch (error) {
    console.error("Error adding promo:", error);
    showNotification("Gagal menambahkan promo: " + error.message, "danger");
  } finally {
    showLoading(false);
  }
}

async function updatePromo() {
  // ... kode yang sudah ada untuk validasi

  // Prepare the request data - map form fields to database fields
  const requestData = {
    title: title,
    description: description,
    time_start: time_start,
    time_end: time_end,
    image: imageUrl,
  };

  console.log("Update request data being sent:", requestData);

  showLoading(true);
  try {
    // Ubah method menjadi PUT dan tambahkan ID pada endpoint
    debugLog(`Sending PUT request to /promo/${id} with data:`, requestData);

    const response = await fetchWithHeaders(`${API_URL}/promo/${id}`, {
      method: "PUT", // Ubah ke PUT sesuai controller
      headers: {
        "Content-Type": "application/json",
        "ngrok-skip-browser-warning": "1",
      },
      body: JSON.stringify(requestData),
    });

    if (!response.ok) {
      throw new Error(`API responded with status: ${response.status}`);
    }

    const responseText = await response.text();
    debugLog("Raw API response from PUT", responseText);

    try {
      const data = JSON.parse(responseText);
      debugLog("Parsed JSON response from PUT", data);

      if (data.status === 200) {
        showNotification("Promo berhasil diperbarui", "success"); // Ubah pesan
        form.reset();
        editPromoModal.hide(); // Ubah modal yang ditutup
        loadPromos();
      } else {
        throw new Error(data.values?.message || "Gagal memperbarui promo"); // Ubah pesan error
      }
    } catch (parseError) {
      throw new Error(
        `Respons API bukan dalam format JSON yang valid: ${parseError.message}`
      );
    }
  } catch (error) {
    console.error("Error updating promo:", error); // Ubah pesan log
    showNotification("Gagal memperbarui promo: " + error.message, "danger"); // Ubah pesan error
  } finally {
    showLoading(false);
  }
}

async function deletePromo() {
  const idElement = document.getElementById("delete_promo_id");

  if (!idElement) {
    console.error("Delete promo ID element not found");
    return;
  }

  const id = idElement.value;

  showLoading(true);
  try {
    const response = await fetchWithHeaders(`${API_URL}/promo/${id}`, {
      method: "DELETE",
    });

    if (!response.ok) {
      throw new Error(`API responded with status: ${response.status}`);
    }

    const responseText = await response.text();
    debugLog("Raw API response from DELETE", responseText);

    try {
      const data = JSON.parse(responseText);
      debugLog("Parsed JSON response from DELETE", data);

      if (data.status === 200) {
        showNotification("Promo berhasil dihapus", "success");
        deletePromoModal.hide();
        loadPromos();
      } else {
        throw new Error(data.values?.message || "Gagal menghapus promo");
      }
    } catch (parseError) {
      throw new Error(
        `Respons API bukan dalam format JSON yang valid: ${parseError.message}`
      );
    }
  } catch (error) {
    console.error("Error deleting promo:", error);
    showNotification("Gagal menghapus promo: " + error.message, "danger");
  } finally {
    showLoading(false);
  }
}

function escapeHtml(unsafe) {
  if (!unsafe) return "";

  return unsafe
    .toString()
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function showLoading(show) {
  if (loadingSpinner) {
    loadingSpinner.style.display = show ? "flex" : "none";
  }
}

function debugLog(title, data) {
  if (typeof window.logDebug === "function") {
    window.logDebug(title, data);
  } else {
    console.log(title, data);
  }
}

function showNotification(message, type = "info") {
  if (typeof window.showToast === "function") {
    window.showToast(message, type);
  } else if (
    typeof window.showNotification === "function" &&
    window.showNotification !== showNotification
  ) {
    // Make sure we're not calling ourselves recursively
    window.showNotification(message, type);
  } else {
    console.log(`${type}: ${message}`);
  }
}

function safeParseJSON(text) {
  if (!text || typeof text !== "string" || !text.trim()) {
    throw new Error("Empty or invalid response received");
  }

  try {
    return JSON.parse(text);
  } catch (error) {
    console.error(
      "JSON parsing failed for text:",
      text.substring(0, 100) + (text.length > 100 ? "..." : "")
    );
    throw new Error(`Invalid JSON format: ${error.message}`);
  }
}

// Add this function to your promo.js file
function setupFormListeners() {
  // Add event listeners to prevent form submission
  const addPromoForm = document.getElementById("addPromoForm");
  if (addPromoForm) {
    addPromoForm.addEventListener('submit', (e) => {
      e.preventDefault();
      console.log("Form submission prevented");
    });
  }

  // Add event listeners to log input changes
  const titleInput = document.getElementById("title");
  const imageUrlInput = document.getElementById("imageUrl");
  
  if (titleInput) {
    titleInput.addEventListener('input', () => {
      console.log("Title input changed:", titleInput.value);
    });
  }
  
  if (imageUrlInput) {
    imageUrlInput.addEventListener('input', () => {
      console.log("Image URL input changed:", imageUrlInput.value);
    });
  }

  // Add click listener to the save button
  const savePromoBtn = document.getElementById("savePromoBtn");
  if (savePromoBtn) {
    savePromoBtn.addEventListener('click', () => {
      console.log("Save button clicked");
      console.log("Current title value:", document.getElementById("title")?.value);
      console.log("Current imageUrl value:", document.getElementById("imageUrl")?.value);
      addPromo();
    });
  }
}

// Call this function when the document is loaded
document.addEventListener('DOMContentLoaded', () => {
  setupFormListeners();
});
