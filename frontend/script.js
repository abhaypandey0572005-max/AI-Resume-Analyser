const API_URL = "https://ai-resume-analyser-2pfu.onrender.com/analyze";
const uploadBox = document.getElementById("uploadBox");
const fileInput = document.getElementById("fileInput");
const fileName = document.getElementById("fileName");
const analyzeBtn = document.getElementById("analyzeBtn");
const loader = document.getElementById("loader");
const results = document.getElementById("results");
const errorBox = document.getElementById("errorBox");
const resetBtn = document.getElementById("resetBtn");

let selectedFile = null;

// Upload box click karne pe file picker khule
uploadBox.addEventListener("click", () => {
  fileInput.click();
});

// Drag and drop support
uploadBox.addEventListener("dragover", (e) => {
  e.preventDefault();
  uploadBox.style.background = "#f0ebff";
});

uploadBox.addEventListener("dragleave", () => {
  uploadBox.style.background = "";
});

uploadBox.addEventListener("drop", (e) => {
  e.preventDefault();
  uploadBox.style.background = "";
  if (e.dataTransfer.files.length > 0) {
    handleFile(e.dataTransfer.files[0]);
  }
});

// File select hone pe
fileInput.addEventListener("change", () => {
  if (fileInput.files.length > 0) {
    handleFile(fileInput.files[0]);
  }
});

function handleFile(file) {
  const validTypes = [".pdf", ".docx"];
  const isValid = validTypes.some(type => file.name.toLowerCase().endsWith(type));

  if (!isValid) {
    showError("Sirf PDF ya DOCX files allowed hain.");
    return;
  }

  selectedFile = file;
  fileName.textContent = "✅ " + file.name;
  analyzeBtn.disabled = false;
  hideError();
}

// Analyze button click
analyzeBtn.addEventListener("click", async () => {
  if (!selectedFile) return;

  hideError();
  results.classList.add("hidden");
  loader.classList.remove("hidden");
  analyzeBtn.disabled = true;

  const formData = new FormData();
  formData.append("file", selectedFile);

  try {
    const response = await fetch(API_URL, {
      method: "POST",
      body: formData
    });

    const data = await response.json();

    loader.classList.add("hidden");

    if (data.error) {
      showError("Error: " + data.error);
      analyzeBtn.disabled = false;
      return;
    }

    displayResults(data);

  } catch (err) {
    loader.classList.add("hidden");
    analyzeBtn.disabled = false;
    showError("Backend se connect nahi ho paya. Check karo server chal raha hai ya nahi.");
  }
});

function displayResults(data) {
  document.getElementById("scoreValue").textContent = data.overall_score ?? "N/A";

  const skillsList = document.getElementById("skillsList");
  skillsList.innerHTML = "";
  (data.skills_found || []).forEach(skill => {
    const span = document.createElement("span");
    span.textContent = skill;
    skillsList.appendChild(span);
  });

  fillList("strengthsList", data.strengths);
  fillList("weaknessesList", data.weaknesses);
  fillList("suggestionsList", data.suggestions);

  results.classList.remove("hidden");
}

function fillList(id, items) {
  const ul = document.getElementById(id);
  ul.innerHTML = "";
  (items || []).forEach(item => {
    const li = document.createElement("li");
    li.textContent = item;
    ul.appendChild(li);
  });
}

function showError(msg) {
  errorBox.textContent = msg;
  errorBox.classList.remove("hidden");
}

function hideError() {
  errorBox.classList.add("hidden");
  errorBox.textContent = "";
}

// Reset button
resetBtn.addEventListener("click", () => {
  selectedFile = null;
  fileInput.value = "";
  fileName.textContent = "";
  analyzeBtn.disabled = true;
  results.classList.add("hidden");
  hideError();
});