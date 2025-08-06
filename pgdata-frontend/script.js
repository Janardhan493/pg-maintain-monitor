let students = [];
let editingStudentId = null;
let currentSortColumn = null;
let currentSortDirection = 'asc'; // 'asc' or 'desc'
let searchTimeout = null;

// --- DOM Elements (Cached for performance) ---
const studentForm = document.getElementById("studentForm");
const submitBtn = document.getElementById("submitBtn");
const cancelEditBtn = document.getElementById("cancelEditBtn");
const searchStudentInput = document.getElementById("searchStudent");
const feeStatusFilter = document.getElementById("feeStatusFilter");
const studentBody = document.getElementById("studentBody");
const studentTable = document.getElementById("studentTable");
const noRecordsMessage = document.getElementById("noRecordsMessage");
const loadingSpinner = document.getElementById("loadingSpinner");
const dataFetchErrorMessage = document.getElementById("dataFetchErrorMessage");
const toastContainer = document.getElementById("toast-container");

// Form input elements and their error message divs
const nameInput = document.getElementById("name");
const roomNoInput = document.getElementById("roomNo");
const mobileNoInput = document.getElementById("mobileNo");
const feeInput = document.getElementById("fee");
const statusSelect = document.getElementById("status");

const nameError = document.getElementById("name-error");
const roomNoError = document.getElementById("roomNo-error");
const mobileNoError = document.getElementById("mobileNo-error");
const feeError = document.getElementById("fee-error");
const statusError = document.getElementById("status-error");

// Dashboard Stats Elements
const totalStudentsSpan = document.getElementById("totalStudents");
const totalPaidSpan = document.getElementById("totalPaid");
const totalUnpaidSpan = document.getElementById("totalUnpaid");

// --- Event Listeners ---
document.addEventListener("DOMContentLoaded", function () {
  fetchStudents();

  studentForm.addEventListener("submit", async function (e) {
    e.preventDefault();
    if (validateForm()) {
      if (editingStudentId === null) {
        await addStudent();
      } else {
        await updateStudent(editingStudentId);
      }
    } else {
        showToast('Please correct the form errors.', 'error');
    }
  });

  searchStudentInput.addEventListener("keyup", function () {
    clearTimeout(searchTimeout);
    searchTimeout = setTimeout(() => {
      renderTable();
    }, 300);
  });

  feeStatusFilter.addEventListener("change", function() {
    renderTable();
  });

  cancelEditBtn.addEventListener("click", resetForm);

  // Add event listeners to table headers for sorting
  document.querySelectorAll('#studentTable thead th[data-sort]').forEach(header => {
    header.addEventListener('click', () => {
      const column = header.getAttribute('data-sort');
      if (currentSortColumn === column) {
        currentSortDirection = currentSortDirection === 'asc' ? 'desc' : 'asc';
      } else {
        currentSortColumn = column;
        currentSortDirection = 'asc';
      }
      document.querySelectorAll('#studentTable thead th[data-sort]').forEach(th => {
        th.classList.remove('asc', 'desc');
        th.innerHTML = th.textContent.trim() + ' <i class="fas fa-sort"></i>';
      });
      header.classList.add(currentSortDirection);
      header.innerHTML = header.textContent.trim() + (currentSortDirection === 'asc' ? ' <i class="fas fa-sort-up"></i>' : ' <i class="fas fa-sort-down"></i>');

      renderTable();
    });
  });

  // Add input validation listeners for all form fields
  nameInput.addEventListener('input', () => validateField(nameInput, nameError, 'Student name is required and must be at least 3 characters.'));
  roomNoInput.addEventListener('input', () => validateField(roomNoInput, roomNoError, 'Room number is required and can only contain letters, numbers, and hyphens.'));
  mobileNoInput.addEventListener('input', () => validateField(mobileNoInput, mobileNoError, 'Mobile number is required and must be 10 digits.'));
  feeInput.addEventListener('input', () => validateField(feeInput, feeError, 'Fee amount is required and must be a positive number.'));
  statusSelect.addEventListener('change', () => validateField(statusSelect, statusError, 'Please select fee status.'));
});

// --- API Calls ---
async function fetchStudents() {
  loadingSpinner.style.display = 'block';
  dataFetchErrorMessage.style.display = 'none';
  try {
    const res = await fetch("http://localhost:8080/students/students");
    if (!res.ok) {
      const errorDetail = res.headers.get('Content-Type')?.includes('application/json') ? await res.json() : await res.text();
      const message = typeof errorDetail === 'object' && errorDetail.message ? errorDetail.message : errorDetail;
      throw new Error(`Failed to fetch students. Status: ${res.status}. ${message}`);
    }
    const data = await res.json();
    students = data;
    renderTable();
    updateDashboardStats();
    showToast('Student data loaded successfully!', 'success');
  } catch (err) {
    console.error("Fetch Error:", err);
    dataFetchErrorMessage.textContent = `Error: ${err.message || 'Could not connect to the server.'} Please ensure the backend is running.`;
    dataFetchErrorMessage.style.display = 'block';
    studentBody.innerHTML = '';
    noRecordsMessage.style.display = 'block';
    studentTable.style.display = 'none';
    updateDashboardStats();
    showToast('Failed to load student data.', 'error');
  } finally {
    loadingSpinner.style.display = 'none';
  }
}

async function addStudent() {
  const student = getFormData();
  try {
    const res = await fetch("http://localhost:8080/students/add", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(student),
    });
    if (!res.ok) {
      const errorDetail = res.headers.get('Content-Type')?.includes('application/json') ? await res.json() : await res.text();
      const message = typeof errorDetail === 'object' && errorDetail.message ? errorDetail.message : errorDetail;
      throw new Error(`Failed to add student. Status: ${res.status}. ${message}`);
    }
    const data = await res.json();
    students.push(data);
    resetForm();
    renderTable();
    updateDashboardStats();
    showToast('Student added successfully!', 'success');
  } catch (err) {
    console.error("Add Error:", err);
    showToast(`Error adding student: ${err.message}`, 'error');
  }
}

async function updateStudent(id) {
  const updatedStudent = getFormData();
  try {
    const res = await fetch(`http://localhost:8080/students/update/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(updatedStudent),
    });
    if (!res.ok) {
      const errorDetail = res.headers.get('Content-Type')?.includes('application/json') ? await res.json() : await res.text();
      const message = typeof errorDetail === 'object' && errorDetail.message ? errorDetail.message : errorDetail;
      throw new Error(`Failed to update student. Status: ${res.status}. ${message}`);
    }
    const data = await res.json();
    const index = students.findIndex(s => s.id === id);
    if (index !== -1) { students[index] = data; }
    resetForm();
    renderTable();
    updateDashboardStats();
    showToast('Student updated successfully!', 'success');
  } catch (err) {
    console.error("Update Error:", err);
    showToast(`Error updating student: ${err.message}`, 'error');
  }
}

async function deleteStudent(id) {
  if (!confirm("Are you sure you want to delete this student record? This action cannot be undone.")) {
    return;
  }
  try {
    const res = await fetch(`http://localhost:8080/students/delete/${id}`, { method: "DELETE" });
    if (!res.ok) {
      const errorDetail = res.headers.get('Content-Type')?.includes('application/json') ? await res.json() : await res.text();
      const message = typeof errorDetail === 'object' && errorDetail.message ? errorDetail.message : errorDetail;
      throw new Error(`Failed to delete student. Status: ${res.status}. ${message}`);
    }
    students = students.filter(s => s.id !== id);
    renderTable();
    updateDashboardStats();
    showToast('Student deleted successfully!', 'info');
  } catch (err) {
    console.error("Delete Error:", err);
    showToast(`Error deleting student: ${err.message}`, 'error');
  }
}

// --- UI Rendering & Logic ---

function renderTable() {
  studentBody.innerHTML = ""; // Clear existing rows
  const searchTerm = searchStudentInput.value.toLowerCase();
  const selectedStatusFilter = feeStatusFilter.value;

  let filteredAndSortedStudents = students.filter(student => {
    const matchesSearch = student.name.toLowerCase().includes(searchTerm) ||
                          student.roomNumber.toLowerCase().includes(searchTerm) ||
                          (student.mobileNumber && String(student.mobileNumber).includes(searchTerm));

    const matchesStatus = (selectedStatusFilter === 'all') ||
                          (selectedStatusFilter === 'paid' && student.feePaid) ||
                          (selectedStatusFilter === 'unpaid' && !student.feePaid);

    return matchesSearch && matchesStatus;
  });

  if (currentSortColumn) {
    filteredAndSortedStudents.sort((a, b) => {
      let valA = a[currentSortColumn];
      let valB = b[currentSortColumn];

      if (currentSortColumn === 'feeAmount') {
        valA = parseFloat(valA);
        valB = parseFloat(valB);
      } else if (currentSortColumn === 'feePaid') {
        valA = valA ? 1 : 0;
        valB = valB ? 1 : 0;
      } else {
        valA = String(valA || '').toLowerCase();
        valB = String(valB || '').toLowerCase();
      }

      if (valA < valB) return currentSortDirection === 'asc' ? -1 : 1;
      if (valA > valB) return currentSortDirection === 'asc' ? 1 : -1;
      return 0;
    });
  }

  if (filteredAndSortedStudents.length === 0) {
    noRecordsMessage.style.display = 'block';
    studentTable.style.display = 'none';
  } else {
    noRecordsMessage.style.display = 'none';
    studentTable.style.display = 'table';
    filteredAndSortedStudents.forEach((student, index) => {
      // HTML for the table row. Note: NO onclick attributes here.
      const rowHTML = `
        <tr>
          <td data-label="Sr. No.">${index + 1}</td>
          <td data-label="Name">${student.name}</td>
          <td data-label="Room No">${student.roomNumber}</td>
          <td data-label="Mobile No">${student.mobileNumber || 'N/A'}</td>
          <td data-label="Fee Amount">₹${student.feeAmount.toFixed(2)}</td>
          <td data-label="Fee Status">
            <span class="${student.feePaid ? "badge-paid" : "badge-unpaid"}">
              ${student.feePaid ? "Paid" : "Unpaid"}
            </span>
          </td>
          <td data-label="Actions" class="actions">
            <button class="edit-btn" data-id="${student.id}" title="Edit Student"><i class="fas fa-edit"></i></button>
            <button class="delete-btn" data-id="${student.id}" title="Delete Student"><i class="fas fa-trash-alt"></i></button>
          </td>
        </tr>
      `;
      // Insert the HTML string into the tbody
      studentBody.insertAdjacentHTML('beforeend', rowHTML); 

      // --- Dynamically attach event listeners AFTER the HTML is in the DOM ---
      // Get the last element inserted (which is the new row)
      const lastRowElement = studentBody.lastElementChild; 

      // Find the buttons within this specific row
      const editButton = lastRowElement.querySelector('.edit-btn');
      const deleteButton = lastRowElement.querySelector('.delete-btn');

      // Add event listeners to the found buttons
      if (editButton) {
        editButton.addEventListener('click', (event) => {
          const id = event.currentTarget.dataset.id; // Get the student ID from the data-id attribute
          editStudent(Number(id)); // Convert id to number and call editStudent
        });
      }
      if (deleteButton) {
        deleteButton.addEventListener('click', (event) => {
          const id = event.currentTarget.dataset.id; // Get the student ID from the data-id attribute
          deleteStudent(Number(id)); // Convert id to number and call deleteStudent
        });
      }
    });
  }
}

// Function to populate the form for editing
function editStudent(id) {
  const student = students.find(s => s.id === id);
  if (!student) {
      console.warn("Student not found for editing with ID:", id);
      showToast("Student not found for editing.", "error");
      return;
  }

  // Populate form fields
  nameInput.value = student.name;
  roomNoInput.value = student.roomNumber;
  mobileNoInput.value = student.mobileNumber;
  feeInput.value = student.feeAmount;
  statusSelect.value = student.feePaid.toString(); // Convert boolean to string for select

  editingStudentId = id; // Set the ID of the student being edited
  
  // Change button text and style for update mode
  submitBtn.innerHTML = '<i class="fas fa-save"></i> Update Student';
  submitBtn.classList.remove('btn-primary');
  submitBtn.classList.add('btn-warning');
  cancelEditBtn.style.display = 'inline-flex'; // Show cancel button

  // Scroll to form section for better UX
  document.getElementById("student-management-section").scrollIntoView({ behavior: 'smooth' });
  // Focus on the first input for convenience
  nameInput.focus();
}


function updateDashboardStats() {
    totalStudentsSpan.textContent = students.length;
    const paidCount = students.filter(s => s.feePaid).length;
    const unpaidCount = students.filter(s => !s.feePaid).length;
    totalPaidSpan.textContent = paidCount;
    totalUnpaidSpan.textContent = unpaidCount;
}

// --- Form Validation ---
function validateForm() {
    let isValid = true;

    if (!validateField(nameInput, nameError, 'Student name is required and must be at least 3 characters.', nameInput.value.length >= 3 && nameInput.value.length <= 100)) {
        isValid = false;
    }

    const roomNoPattern = /^[A-Za-z0-9-]+$/;
    if (!validateField(roomNoInput, roomNoError, 'Room number is required and can only contain letters, numbers, and hyphens.', roomNoInput.value.trim() !== '' && roomNoPattern.test(roomNoInput.value))) {
        isValid = false;
    }

    const mobileNoPattern = /^[0-9]{10}$/;
    if (!validateField(mobileNoInput, mobileNoError, 'Mobile number is required and must be 10 digits.', mobileNoInput.value.trim() !== '' && mobileNoPattern.test(mobileNoInput.value))) {
        isValid = false;
    }

    const feeAmount = parseFloat(feeInput.value);
    if (!validateField(feeInput, feeError, 'Fee amount is required and must be a positive number.', !isNaN(feeAmount) && feeAmount > 0)) {
        isValid = false;
    }

    if (!validateField(statusSelect, statusError, 'Please select fee status.', statusSelect.value !== '')) {
        isValid = false;
    }

    return isValid;
}

function validateField(inputElement, errorElement, errorMessageText, condition = inputElement.checkValidity()) {
    if (condition) {
        inputElement.classList.remove('invalid');
        errorElement.textContent = '';
        return true;
    } else {
        inputElement.classList.add('invalid');
        errorElement.textContent = errorMessageText;
        return false;
    }
}

function getFormData() {
  return {
    name: nameInput.value.trim(),
    roomNumber: roomNoInput.value.trim(),
    mobileNumber: mobileNoInput.value.trim(),
    feeAmount: parseFloat(feeInput.value),
    feePaid: statusSelect.value === "true"
  };
}

function resetForm() {
  studentForm.reset();
  editingStudentId = null;
  submitBtn.innerHTML = '<i class="fas fa-save"></i> Save Student';
  submitBtn.classList.remove('btn-warning');
  submitBtn.classList.add('btn-primary');
  cancelEditBtn.style.display = 'none';

  document.querySelectorAll('.error-message').forEach(el => el.textContent = '');
  document.querySelectorAll('.form-group input, .form-group select').forEach(el => el.classList.remove('invalid'));

  renderTable();
}

// --- Toast Notification System ---
function showToast(message, type = 'info', duration = 3000) {
  const toast = document.createElement('div');
  toast.classList.add('toast', type);
  toast.innerHTML = `<i class="${getToastIcon(type)}"></i> <span>${message}</span>`;
  
  toastContainer.appendChild(toast);

  void toast.offsetWidth;

  toast.classList.add('show');

  setTimeout(() => {
    toast.classList.remove('show');
    toast.classList.add('hide');
    toast.addEventListener('transitionend', () => toast.remove(), { once: true });
  }, duration);
}

function getToastIcon(type) {
  switch (type) {
    case 'success': return 'fas fa-check-circle';
    case 'error': return 'fas fa-times-circle';
    case 'info': return 'fas fa-info-circle';
    case 'warning': return 'fas fa-exclamation-circle';
    default: return 'fas fa-bell';
  }
}