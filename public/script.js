document.addEventListener("dragover", function (e) {
e.preventDefault();
});

document.addEventListener("drop", function (e) {
e.preventDefault();
});

console.log("MyPDFTools Loaded");

// ======================
// FILE INPUT PREVIEW
// ======================

const pdfInput = document.getElementById("pdfInput");
const fileList = document.getElementById("fileList");

if (pdfInput && fileList) {

```
pdfInput.addEventListener("change", function () {

    fileList.innerHTML = "";

    for (let i = 0; i < pdfInput.files.length; i++) {

        let p = document.createElement("p");
        p.textContent = "✔ " + pdfInput.files[i].name;

        fileList.appendChild(p);

    }

});
```

}

// ======================
// DRAG & DROP
// ======================

const zone = document.querySelector(".drop-zone");
const fileInput = document.querySelector("input[type='file']");
const list = document.getElementById("fileList");

if (zone && fileInput) {

```
zone.addEventListener("dragover", (e) => {

    e.preventDefault();
    zone.classList.add("dragover");

});

zone.addEventListener("dragleave", () => {

    zone.classList.remove("dragover");

});

zone.addEventListener("drop", (e) => {

    e.preventDefault();

    zone.classList.remove("dragover");

    fileInput.files = e.dataTransfer.files;

    showFiles();

});

fileInput.addEventListener("change", showFiles);

function showFiles() {

    if (!list) return;

    let names = [];

    for (let i = 0; i < fileInput.files.length; i++) {

        names.push("✔ " + fileInput.files[i].name);

    }

    list.innerHTML = names.join("<br>");

}
```

}

// ======================
// LOADER
// ======================

const form = document.querySelector("form");
const loader = document.getElementById("loader");

if (form && loader) {

```
form.addEventListener("submit", () => {

    loader.style.display = "block";

});
```

}

// ======================
// SEARCH BAR
// ======================

const searchBox = document.getElementById("searchTools");

if (searchBox) {

searchBox.addEventListener("input", () => {

    const value = searchBox.value.toLowerCase();

    const cards = document.querySelectorAll(".card");

    cards.forEach(card => {

        const text = card.textContent.toLowerCase();

        if (text.includes(value)) {

            card.style.display = "";

        } else {

            card.style.display = "none";

        }

    });

});

}
const toggleBtn = document.getElementById("themeToggle");

if(toggleBtn){

    if(localStorage.getItem("theme")==="dark"){
        document.body.classList.add("dark-mode");
        toggleBtn.innerHTML="☀️ Light Mode";
    }

    toggleBtn.addEventListener("click",()=>{

        document.body.classList.toggle("dark-mode");

        if(document.body.classList.contains("dark-mode")){

            localStorage.setItem("theme","dark");
            toggleBtn.innerHTML="☀️ Light Mode";

        }else{

            localStorage.setItem("theme","light");
            toggleBtn.innerHTML="🌙 Dark Mode";

        }

    });

}
function showSuccess(msg){

    Swal.fire({
        icon: "success",
        title: "Success",
        text: msg,
        confirmButtonColor: "#e53935"
    });

}

function showError(msg){

    Swal.fire({
        icon: "error",
        title: "Oops...",
        text: msg,
        confirmButtonColor: "#e53935"
    });

}

function showLoading(){

    Swal.fire({
        title: "Processing...",
        text: "Please wait",
        allowOutsideClick: false,
        didOpen: () => {
            Swal.showLoading();
        }
    });

}
const form = document.querySelector("form");

if(form){

    form.addEventListener("submit", () => {

        showLoading();

    });

}
const fileInputCheck = document.querySelector("input[type=file]");

if(fileInputCheck){

    fileInputCheck.addEventListener("change", () => {

        if(fileInputCheck.files.length > 10){

            showError(
                "Maximum 10 files allowed."
            );

            fileInputCheck.value = "";

        }

    });

}
console.log("PDF Preview Code Running");
const pdfInputPreview = document.querySelector('input[type="file"]');
const canvas = document.getElementById("pdfCanvas");
const preview = document.getElementById("pdfPreview");

if(pdfInputPreview && canvas && preview){

    pdfInputPreview.addEventListener("change", async () => {
console.log("File Selected");
        const file = pdfInputPreview.files[0];

        if(!file || file.type !== "application/pdf"){
            return;
        }

        preview.innerHTML =
            `📄 ${file.name}<br>
             Size: ${(file.size/1024/1024).toFixed(2)} MB`;

        const fileReader = new FileReader();

        fileReader.onload = async function(){

            const typedarray =
                new Uint8Array(this.result);

            const pdf =
                await pdfjsLib.getDocument(
                    typedarray
                ).promise;

            const page =
                await pdf.getPage(1);

            const viewport =
                page.getViewport({scale:1.2});

            const context =
                canvas.getContext("2d");

            canvas.height =
                viewport.height;

            canvas.width =
                viewport.width;

            canvas.style.display =
                "block";

            await page.render({
                canvasContext: context,
                viewport: viewport
            }).promise;

        };

        fileReader.readAsArrayBuffer(file);

    });

}