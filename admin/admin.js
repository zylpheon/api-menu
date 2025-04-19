// API Base URL
const API_URL = "https://puma-bold-grubworm.ngrok-free.app";

// DOM Elements
const menuTable = document.getElementById("menuTable");
const loadingSpinner = document.querySelector(".loading-spinner");
const toastContainer = document.querySelector(".toast-container");
const connectionStatus = document.getElementById("connectionStatus");
const debugInfo = document.getElementById("debugInfo");
const toggleDebugBtn = document.getElementById("toggleDebugBtn");

// Bootstrap Modal Instances
let addMenuModal, editMenuModal, deleteMenuModal;

// Helper function to add ngrok-skip-browser-warning header to all requests
async function fetchWithHeaders(url, options = {}) {
  // Ensure headers object exists
  if (!options.headers) {
    options.headers = {};
  }

  // Add ngrok skip header
  options.headers["ngrok-skip-browser-warning"] = "1";

  return fetch(url, options);
}

// Modified preWarmNgrok function
async function preWarmNgrok() {
  try {
    console.log("Pre-warming ngrok connection...");
    // Direct fetch with the header
    await fetchWithHeaders(`${API_URL}/`);
    console.log("Prewarming ngrok complete");
  } catch (e) {
    console.log("Prewarming attempt failed:", e);
  }
}

// Panggil fungsi ini segera
preWarmNgrok();

// Event Listeners
document.addEventListener("DOMContentLoaded", function () {
  // Initialize Bootstrap modals
  addMenuModal = new bootstrap.Modal(document.getElementById("addMenuModal"));
  editMenuModal = new bootstrap.Modal(document.getElementById("editMenuModal"));
  deleteMenuModal = new bootstrap.Modal(
    document.getElementById("deleteMenuModal")
  );

  // Add event listeners
  document.getElementById("saveMenuBtn").addEventListener("click", addMenu);
  document
    .getElementById("updateMenuBtn")
    .addEventListener("click", updateMenu);
  document
    .getElementById("confirmDeleteBtn")
    .addEventListener("click", deleteMenu);

  // Toggle debug info
  toggleDebugBtn.addEventListener("click", function () {
    if (debugInfo.style.display === "none") {
      debugInfo.style.display = "block";
      this.innerHTML = '<i class="bi bi-bug"></i> Hide Debug Info';
    } else {
      debugInfo.style.display = "none";
      this.innerHTML = '<i class="bi bi-bug"></i> Show Debug Info';
    }
  });

  // Check API connection first then load menu data
  checkAPIConnection();
});

// Check API connection
async function checkAPIConnection() {
  connectionStatus.innerHTML = "Checking API connection...";
  connectionStatus.className = "alert alert-info mb-4";

  try {
    // Use fetchWithHeaders to bypass ngrok warning
    const response = await fetchWithHeaders(`${API_URL}/`);

    // Try to parse the response as text first
    const responseText = await response.text();
    logDebug("Raw API response", responseText);

    try {
      // Now try to parse as JSON
      const data = JSON.parse(responseText);
      logDebug("API connection successful", data);

      connectionStatus.innerHTML = `<i class="bi bi-check-circle-fill"></i> Terhubung ke API: ${API_URL}`;
      connectionStatus.className = "alert alert-success mb-4";

      // Now that we know API is connected, load the menu data
      loadMenus();
      return true;
    } catch (parseError) {
      // Handle case where API responds with non-JSON content
      logDebug("API returned non-JSON response", parseError);

      // Check if the response contains a known ngrok warning page pattern
      if (
        responseText.includes("ngrok") &&
        responseText.includes("ERR_NGROK")
      ) {
        connectionStatus.innerHTML = `
          <i class="bi bi-exclamation-triangle-fill"></i> Terdeteksi halaman konfirmasi ngrok. 
          <button id="ngrokFixBtn" class="btn btn-warning btn-sm">Coba Buka Secara Otomatis</button> atau
          <a href="${API_URL}" target="_blank" class="btn btn-primary btn-sm">Buka Manual & "Visit Site"</a>
          kemudian <button class="btn btn-info btn-sm" onclick="checkAPIConnection()">Refresh</button>
        `;

        // Tambahkan event listener untuk tombol fix
        setTimeout(() => {
          document
            .getElementById("ngrokFixBtn")
            .addEventListener("click", function () {
              // Buka window baru ke API URL
              const newWindow = window.open(API_URL, "_blank");

              // Beri petunjuk dan tombol cek ulang
              this.disabled = true;
              this.textContent = "Jendela dibuka, klik Visit Site di sana";

              // Cek ulang setelah beberapa detik
              setTimeout(checkAPIConnection, 5000);
            });
        }, 100);
      } else {
        connectionStatus.innerHTML = `<i class="bi bi-exclamation-triangle-fill"></i> API merespon dengan format yang tidak diharapkan. Harap periksa debug info.`;
      }
      connectionStatus.className = "alert alert-warning mb-4";
      return false;
    }
  } catch (error) {
    logDebug("API connection failed", error);
    connectionStatus.innerHTML = `<i class="bi bi-x-circle-fill"></i> Gagal terhubung ke API: ${API_URL}.<br>
        Kemungkinan penyebab:
        <ul>
            <li>URL API tidak benar</li>
            <li>Ngrok tunnel tidak berjalan</li>
            <li>CORS tidak diaktifkan pada API</li>
            <li>Server API tidak berjalan</li>
        </ul>
        <button class="btn btn-sm btn-primary" onclick="checkAPIConnection()">Coba Lagi</button>`;
    connectionStatus.className = "alert alert-danger mb-4";
    return false;
  }
}

// Log debug information
function logDebug(title, data) {
  const timestamp = new Date().toISOString();
  let debugText = `[${timestamp}] ${title}:\n`;

  if (typeof data === "object") {
    try {
      debugText += JSON.stringify(data, null, 2);
    } catch (e) {
      debugText += String(data);
    }
  } else {
    debugText += String(data);
  }

  const debugEntry = document.createElement("div");
  debugEntry.className = "mb-3 p-2 border-bottom";
  
  // Create a pre element for better formatting of code and JSON
  const pre = document.createElement("pre");
  pre.className = "mb-0 text-wrap";
  pre.style.whiteSpace = "pre-wrap";
  pre.style.fontSize = "0.875rem";
  pre.textContent = debugText;
  
  debugEntry.appendChild(pre);

  // Find the debug entries container and prepend the new entry
  const entriesContainer = debugInfo.querySelector('.debug-entries');
  entriesContainer.prepend(debugEntry);

  // Limit number of entries
  if (entriesContainer.children.length > 10) {
    entriesContainer.removeChild(entriesContainer.lastChild);
  }

  console.log(title, data);
}

// Fetch all menus
async function loadMenus() {
  showLoading(true);
  try {
    const response = await fetchWithHeaders(`${API_URL}/tampil`);
    const responseText = await response.text();

    // Log the raw response
    logDebug("Raw API response", responseText);

    // Try to parse as JSON
    try {
      const data = JSON.parse(responseText);
      logDebug("Parsed JSON data", data);

      // Check if data has the expected structure
      if (data.status === 200 && Array.isArray(data.values)) {
        renderMenuTable(data.values);
        showNotification("Data menu berhasil dimuat", "success");
      } else {
        throw new Error("Format data tidak sesuai yang diharapkan");
      }
    } catch (parseError) {
      logDebug("JSON parse error", parseError);
      throw new Error("Respons API bukan dalam format JSON yang valid");
    }
  } catch (error) {
    console.error("Error loading menus:", error);
    showNotification("Gagal memuat data menu: " + error.message, "danger");

    // Show empty table with error message
    menuTable.innerHTML = `
      <tr>
        <td colspan="6" class="text-center">Error loading data: ${error.message}</td>
      </tr>
    `;
  } finally {
    showLoading(false);
  }
}

// Render menu table with data
function renderMenuTable(menus) {
  menuTable.innerHTML = "";

  if (menus.length === 0) {
    menuTable.innerHTML = `
      <tr>
        <td colspan="6" class="text-center">Tidak ada data menu</td>
      </tr>
    `;
    return;
  }

  menus.forEach((menu) => {
    const title = escapeHtml(menu.title || "");
    const category = escapeHtml(menu.category || "");
    const desc = escapeHtml(menu.description1 || "-");

    menuTable.innerHTML += `
      <tr>
        <td>${menu.id}</td>
        <td>${title}</td>
        <td>${category}</td>
        <td>Rp ${formatPrice(menu.price)}</td>
        <td>${desc}</td>
        <td>
          <button class="btn btn-sm btn-primary edit-btn" 
            data-id="${menu.id}">
            <i class="bi bi-pencil-square"></i> Edit
          </button>
          <button class="btn btn-sm btn-danger delete-btn" 
            data-id="${menu.id}" data-name="${title}">
            <i class="bi bi-trash"></i> Hapus
          </button>
        </td>
      </tr>
    `;
  });

  // Add event listeners to edit buttons
  document.querySelectorAll(".edit-btn").forEach((btn) => {
    btn.addEventListener("click", function () {
      const id = this.getAttribute("data-id");
      fetchSingleMenu(id);
    });
  });

  // Add event listeners to delete buttons
  document.querySelectorAll(".delete-btn").forEach((btn) => {
    btn.addEventListener("click", function () {
      const id = this.getAttribute("data-id");
      const name = this.getAttribute("data-name");
      openDeleteModal(id, name);
    });
  });
}

// Fetch single menu for editing
async function fetchSingleMenu(id) {
  showLoading(true);
  try {
    // First try with /tampil/{id} endpoint if available
    let response = await fetchWithHeaders(`${API_URL}/tampil/${id}`);
    let responseText = await response.text();

    logDebug(`Fetching menu item with ID: ${id}`, responseText);

    try {
      const data = JSON.parse(responseText);

      if (data.status === 200 && data.values) {
        // If API returns values directly
        if (Array.isArray(data.values) && data.values.length > 0) {
          // If values is an array, take the first item
          openEditModal(data.values[0]);
        } else if (typeof data.values === "object") {
          // If values is a single object
          openEditModal(data.values);
        } else {
          throw new Error("Unexpected data format");
        }
      } else {
        // Fallback: fetch all and filter
        response = await fetchWithHeaders(`${API_URL}/tampil`);
        responseText = await response.text();
        const allData = JSON.parse(responseText);

        if (allData.status === 200 && Array.isArray(allData.values)) {
          const menuItem = allData.values.find((item) => item.id == id);

          if (menuItem) {
            openEditModal(menuItem);
          } else {
            throw new Error(`Menu dengan ID ${id} tidak ditemukan`);
          }
        } else {
          throw new Error("Format data tidak sesuai yang diharapkan");
        }
      }
    } catch (parseError) {
      logDebug("JSON parse error", parseError);
      throw new Error("Respons API bukan dalam format JSON yang valid");
    }
  } catch (error) {
    console.error("Error fetching menu:", error);
    showNotification(`Gagal memuat data menu: ${error.message}`, "danger");
    showLoading(false);
  }
}

// Remove the toggleImageInput function if it exists
// Add this function to preview images from URL if it doesn't exist already
function previewImageFromUrl(inputId, previewId) {
  const urlInput = document.getElementById(inputId);
  const previewContainer = document.getElementById(previewId);
  
  if (urlInput.value.trim()) {
    // Show preview
    previewContainer.innerHTML = `
      <div class="mt-2">
        <p class="mb-1">Preview:</p>
        <img src="${urlInput.value}" alt="Preview" class="img-thumbnail" style="max-height: 150px;">
      </div>
    `;
  } else {
    // Clear preview
    previewContainer.innerHTML = '';
  }
}

// Fix the event listener for the edit image URL
document.addEventListener('DOMContentLoaded', function() {
  // Add event listeners after DOM is loaded
  const addImageUrl = document.getElementById('imageUrl');
  const editImageUrl = document.getElementById('edit_imageUrl');
  
  if (addImageUrl) {
    addImageUrl.addEventListener('blur', function() {
      previewImageFromUrl('imageUrl', 'imageUrlPreview');
    });
  }
  
  if (editImageUrl) {
    editImageUrl.addEventListener('blur', function() {
      previewImageFromUrl('edit_imageUrl', 'editImageUrlPreview');
    });
  }
  
  // ... rest of your DOMContentLoaded code ...
});

// Update the addMenu function to handle only URL
async function addMenu() {
  const form = document.getElementById("addMenuForm");

  // Basic form validation
  if (!form.checkValidity()) {
    form.reportValidity();
    return;
  }

  // Get all required fields
  const title = document.getElementById("title").value.trim();
  const category = document.getElementById("category").value;
  const price = document.getElementById("price").value;
  const description1 = document.getElementById("description1").value.trim();
  const description2 = document.getElementById("description2").value.trim();
  const imageUrl = document.getElementById("imageUrl").value.trim();
  
  // Validate required fields
  if (!title || !category || !price || !description1 || !description2) {
    showNotification("Semua field wajib diisi", "danger");
    return;
  }
  
  // Validate image URL
  if (!imageUrl) {
    showNotification("URL gambar menu wajib diisi", "danger");
    return;
  }
  
  // Validate URL format
  const urlRegex = /^(http|https):\/\/[^ "]+$/;
  if (!urlRegex.test(imageUrl)) {
    showNotification("Format URL gambar tidak valid", "danger");
    return;
  }
  
  // Create request data
  const requestData = {
    title,
    category,
    price,
    description1,
    description2,
    imageUrl
  };

  showLoading(true);
  try {
    // Log the request
    logDebug("Sending POST request to /tambah with image URL", requestData);

    const response = await fetchWithHeaders(`${API_URL}/tambah`, {
      method: "POST",
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(requestData)
    });

    const responseText = await response.text();
    logDebug("Raw API response from POST", responseText);

    try {
      const data = JSON.parse(responseText);
      logDebug("Parsed JSON response from POST", data);

      if (data.status === 200) {
        showNotification("Menu berhasil ditambahkan", "success");
        form.reset();
        addMenuModal.hide();
        loadMenus();
      } else {
        throw new Error(data.values?.message || "Gagal menambahkan menu");
      }
    } catch (parseError) {
      throw new Error("Respons API bukan dalam format JSON yang valid");
    }
  } catch (error) {
    console.error("Error adding menu:", error);
    showNotification("Gagal menambahkan menu: " + error.message, "danger");
  } finally {
    showLoading(false);
  }
}

// Update the openEditModal function to handle URL only
function openEditModal(menu) {
  // Log the menu data for debugging
  logDebug("Opening edit modal with data", menu);

  // Ensure menu is an object
  if (!menu || typeof menu !== "object") {
    showNotification("Data menu tidak valid", "danger");
    return;
  }

  // Populate form fields
  document.getElementById("edit_id").value = menu.id || "";
  document.getElementById("edit_title").value = menu.title || "";
  document.getElementById("edit_category").value = menu.category || "";
  document.getElementById("edit_price").value = menu.price || 0;
  document.getElementById("edit_description1").value = menu.description1 || "";
  document.getElementById("edit_description2").value = menu.description2 || "";
  
  // Set image URL
  const imageUrl = menu.image || "";
  document.getElementById("edit_imageUrl").value = imageUrl;
  
  // Show image preview
  const previewContainer = document.getElementById("editImageUrlPreview");
  if (imageUrl) {
    previewContainer.innerHTML = `
      <div class="mt-2">
        <p class="mb-1">Current Image:</p>
        <img src="${imageUrl}" alt="Current Image" class="img-thumbnail" style="max-height: 150px;">
      </div>
    `;
  } else {
    previewContainer.innerHTML = '';
  }

  // Show the modal
  editMenuModal.show();

  // Hide loading spinner
  showLoading(false);
}

// Update the updateMenu function to handle URL only
async function updateMenu() {
  const form = document.getElementById("editMenuForm");

  // Basic form validation
  if (!form.checkValidity()) {
    form.reportValidity();
    return;
  }

  const id = document.getElementById("edit_id").value;
  
  // Get all required fields
  const title = document.getElementById("edit_title").value.trim();
  const category = document.getElementById("edit_category").value;
  const price = document.getElementById("edit_price").value;
  const description1 = document.getElementById("edit_description1").value.trim();
  const description2 = document.getElementById("edit_description2").value.trim();
  const imageUrl = document.getElementById("edit_imageUrl").value.trim();
  
  // Validate required fields
  if (!title || !category || !price || !description1 || !description2) {
    showNotification("Semua field wajib diisi", "danger");
    return;
  }
  
  // Validate image URL
  if (!imageUrl) {
    showNotification("URL gambar menu wajib diisi", "danger");
    return;
  }
  
  // Validate URL format
  const urlRegex = /^(http|https):\/\/[^ "]+$/;
  if (!urlRegex.test(imageUrl)) {
    showNotification("Format URL gambar tidak valid", "danger");
    return;
  }
  
  // Create request data object instead of FormData
  const requestData = {
    title,
    category,
    price: parseFloat(price).toFixed(2),
    description1,
    description2,
    imageUrl
  };

  showLoading(true);
  try {
    logDebug(`Sending PUT request to /ubah/${id} with image URL`, requestData);
    
    const response = await fetchWithHeaders(`${API_URL}/ubah/${id}`, {
      method: "PUT",
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(requestData)
    });
    
    const responseText = await response.text();
    logDebug("Raw API response from PUT", responseText);

    try {
      const data = JSON.parse(responseText);
      logDebug("Parsed JSON response from PUT", data);

      if (data.status === 200) {
        showNotification("Menu berhasil diperbarui", "success");
        editMenuModal.hide();
        loadMenus();
      } else {
        throw new Error(data.values?.message || "Gagal memperbarui menu");
      }
    } catch (parseError) {
      throw new Error("Respons API bukan dalam format JSON yang valid");
    }
  } catch (error) {
    console.error("Error updating menu:", error);
    showNotification("Gagal memperbarui menu: " + error.message, "danger");
  } finally {
    showLoading(false);
  }
}

// Open delete confirmation modal
function openDeleteModal(id, title) {
  document.getElementById("delete_id").value = id;
  document.getElementById("deleteMenuName").textContent = title;
  deleteMenuModal.show();
}

// Delete menu
async function deleteMenu() {
  const id = document.getElementById("delete_id").value;

  showLoading(true);
  try {
    // Log the request
    logDebug(`Sending DELETE request to /hapus/${id}`);

    const response = await fetchWithHeaders(`${API_URL}/hapus/${id}`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        "ngrok-skip-browser-warning": "1",
      },
    });

    const responseText = await response.text();
    logDebug("Raw API response from DELETE", responseText);

    try {
      const data = JSON.parse(responseText);
      logDebug("Parsed JSON response from DELETE", data);

      if (data.status === 200) {
        showNotification("Menu berhasil dihapus", "success");
        deleteMenuModal.hide();
        loadMenus();
      } else {
        throw new Error(data.values?.message || "Gagal menghapus menu");
      }
    } catch (parseError) {
      throw new Error("Respons API bukan dalam format JSON yang valid");
    }
  } catch (error) {
    console.error("Error deleting menu:", error);
    showNotification("Gagal menghapus menu: " + error.message, "danger");
  } finally {
    showLoading(false);
  }
}

// Show notification toast
function showNotification(message, type = "info") {
  const toast = document.createElement("div");
  toast.className = `toast align-items-center text-white bg-${type} border-0`;
  toast.setAttribute("role", "alert");
  toast.setAttribute("aria-live", "assertive");
  toast.setAttribute("aria-atomic", "true");

  toast.innerHTML = `
    <div class="d-flex">
      <div class="toast-body">
        ${escapeHtml(message)}
      </div>
      <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast" aria-label="Close"></button>
    </div>
  `;

  toastContainer.appendChild(toast);

  const bsToast = new bootstrap.Toast(toast, { delay: 3000 });
  bsToast.show();

  // Remove toast after it's hidden
  toast.addEventListener("hidden.bs.toast", function () {
    toast.remove();
  });
}

// Show/hide loading spinner
function showLoading(show) {
  if (show) {
    loadingSpinner.style.display = "flex";
  } else {
    loadingSpinner.style.display = "none";
  }
}

// Helper function to escape HTML
function escapeHtml(unsafe) {
  if (typeof unsafe !== "string") return "";
  return unsafe
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

// Helper function to format price
function formatPrice(price) {
  return parseFloat(price).toLocaleString("id-ID");
}
