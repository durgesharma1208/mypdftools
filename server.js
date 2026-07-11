const pdfParse = require("pdf-parse");
const { Document, Packer, Paragraph } = require("docx");
const libre = require("libreoffice-convert");
const { exec } = require("child_process");
const sharp = require("sharp");
const { fromPath } = require("pdf2pic");
const PDFDocumentKit = require("pdfkit");
const express = require("express");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const { PDFDocument, rgb, StandardFonts, degrees } = require("pdf-lib");
const app = express();

// Public Folder
app.use(express.static("public"));

// Storage Settings
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, "uploads/");
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + path.extname(file.originalname));
    }
});

const upload = multer({
    storage: storage
});

// =====================
// MERGE PDF
// =====================

app.post("/merge", upload.array("pdfs"), async (req, res) => {

    try {

        const mergedPdf = await PDFDocument.create();

        for (const file of req.files) {

            const pdfBytes = fs.readFileSync(file.path);

            const pdf = await PDFDocument.load(pdfBytes);

            const copiedPages = await mergedPdf.copyPages(
                pdf,
                pdf.getPageIndices()
            );

            copiedPages.forEach((page) => {
                mergedPdf.addPage(page);
            });

        }

        const mergedBytes = await mergedPdf.save();

        const outputPath = "uploads/merged.pdf";

        fs.writeFileSync(outputPath, mergedBytes);

        res.download(outputPath);

    } catch (err) {

        console.log(err);
        res.send("Error while merging PDF.");

    }

});

// =====================
// SPLIT PDF
// =====================

app.post("/split", upload.single("pdfFile"), async (req, res) => {

    try {

        const pageNumber = parseInt(req.body.pageNumber);

        const pdfBytes = fs.readFileSync(req.file.path);

        const pdf = await PDFDocument.load(pdfBytes);

        const totalPages = pdf.getPageCount();

        if (pageNumber < 1 || pageNumber > totalPages) {
            return res.send("Invalid Page Number");
        }

        const newPdf = await PDFDocument.create();

        const [page] = await newPdf.copyPages(
            pdf,
            [pageNumber - 1]
        );

        newPdf.addPage(page);

        const outputBytes = await newPdf.save();

        const outputPath = "uploads/split.pdf";

        fs.writeFileSync(outputPath, outputBytes);

        res.download(outputPath);

    } catch (err) {

        console.log(err);
        res.send("Error while splitting PDF.");

    }

});
app.post("/jpgtopdf", upload.array("images"), async (req, res) => {

    try {

        const outputPath = "uploads/images.pdf";

        const doc = new PDFDocumentKit({
            autoFirstPage: false
        });

        const stream = fs.createWriteStream(outputPath);

        doc.pipe(stream);

        for (const file of req.files) {

            doc.addPage();

            doc.image(
                file.path,
                50,
                50,
                {
                    fit: [500, 700],
                    align: "center",
                    valign: "center"
                }
            );

        }

        doc.end();

        stream.on("finish", () => {
            res.download(outputPath);
        });

    } catch (err) {

        console.log(err);

        res.send("Error while converting JPG to PDF.");

    }

});
app.post("/pdftojpg", upload.fields([
    { name: "pdfFile", maxCount: 1 },
    { name: "logo", maxCount: 1 }
]), async (req, res) => {

    try {

        const options = {
            density: 100,
            saveFilename: "converted",
            savePath: "./uploads",
            format: "jpg",
            width: 1200,
            height: 1600
        };

        const convert = fromPath(req.file.path, options);

        await convert(1);

        res.download("./uploads/converted.1.jpg");

    } catch (err) {
    console.error(err);

    res.send(err.toString());


    }

});
app.post("/rotate", upload.single("pdfFile"), async (req, res) => {

    try {

        const pdfBytes = fs.readFileSync(req.file.path);

        const pdfDoc = await PDFDocument.load(pdfBytes);

        const pages = pdfDoc.getPages();

        const angle = parseInt(req.body.angle);

        pages.forEach(page => {
            page.setRotation(degrees(angle));
        });

        const rotatedPdf = await pdfDoc.save();

        const outputPath = "uploads/rotated.pdf";
        
        fs.writeFileSync(outputPath, rotatedPdf);

        res.download(outputPath);

    } catch (err) {

        console.log(err);

        res.send("Error while rotating PDF.");

    }
    });
app.post("/extract", upload.single("pdfFile"), async (req, res) => {

    try {

        const pdfBytes = fs.readFileSync(req.file.path);

        const pdfDoc = await PDFDocument.load(pdfBytes);

        const newPdf = await PDFDocument.create();

        const pages = req.body.pages
            .split(",")
            .map(p => parseInt(p.trim()) - 1);

        for (const pageIndex of pages) {

            if (
                pageIndex >= 0 &&
                pageIndex < pdfDoc.getPageCount()
            ) {

                const [page] = await newPdf.copyPages(
                    pdfDoc,
                    [pageIndex]
                );

                newPdf.addPage(page);

            }

        }

        const outputBytes = await newPdf.save();

        const outputPath = "uploads/extracted.pdf";

        fs.writeFileSync(outputPath, outputBytes);

        res.download(outputPath);

    } catch (err) {

        console.log(err);

        res.send("Error while extracting pages.");

    }

});
app.post("/deletepages", upload.single("pdfFile"), async (req, res) => {

    try {

        const pdfBytes = fs.readFileSync(req.file.path);

        const pdfDoc = await PDFDocument.load(pdfBytes);

        const newPdf = await PDFDocument.create();

        const deletePages = req.body.pages
            .split(",")
            .map(p => parseInt(p.trim()) - 1);

        for (let i = 0; i < pdfDoc.getPageCount(); i++) {

            if (!deletePages.includes(i)) {

                const [page] = await newPdf.copyPages(
                    pdfDoc,
                    [i]
                );

                newPdf.addPage(page);

            }

        }

        const outputBytes = await newPdf.save();

        const outputPath = "uploads/deleted.pdf";

        fs.writeFileSync(outputPath, outputBytes);

        res.download(outputPath);

    } catch (err) {

        console.log(err);

        res.send("Error while deleting pages.");

    }

});

app.post("/watermark",
    upload.fields([
        { name: "pdfFile", maxCount: 1 },
        { name: "logo", maxCount: 1 }
    ]),
    async (req, res) => {

    try {

        const pdfBytes = fs.readFileSync(
            req.files.pdfFile[0].path
        );

        if(req.files.logo){
            console.log("Logo Uploaded");
        }

        const pdfDoc = await PDFDocument.load(pdfBytes);

        const font = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

        const pages = pdfDoc.getPages();

        const text = req.body.watermark;

        pages.forEach(page => {

            const { width, height } = page.getSize();

            page.drawText(text, {

                x: width / 4,

                y: height / 2,

                size: 40,

                font: font,

                color: rgb(0.8, 0.8, 0.8),

                rotate: degrees(45)

            });

        });

        const outputBytes = await pdfDoc.save();

        const outputPath = "uploads/watermarked.pdf";

        fs.writeFileSync(outputPath, outputBytes);

        res.download(outputPath);

    } catch (err) {

        console.log(err);

        res.send("Error while adding watermark.");

    }

});

app.post(
    "/image-watermark",
    upload.fields([
        { name: "pdfFile", maxCount: 1 },
        { name: "logo", maxCount: 1 }
    ]),
    async (req, res) => {

        try {

            const pdfBytes = fs.readFileSync(
                req.files.pdfFile[0].path
            );

            const pdfDoc = await PDFDocument.load(pdfBytes);

            const logoPath = req.files.logo[0].path;

            const logoBytes = fs.readFileSync(logoPath);

            const image = await pdfDoc.embedPng(logoBytes);

            const pages = pdfDoc.getPages();

            const size = parseInt(req.body.size);

            const position = req.body.position;

            for (const page of pages) {

                const { width, height } = page.getSize();

                let x = (width - size) / 2;
                let y = (height - size) / 2;

                if (position === "top-left") {
                    x = 20;
                    y = height - size - 20;
                }

                if (position === "top-right") {
                    x = width - size - 20;
                    y = height - size - 20;
                }

                if (position === "bottom-left") {
                    x = 20;
                    y = 20;
                }

                if (position === "bottom-right") {
                    x = width - size - 20;
                    y = 20;
                }

                page.drawImage(image, {
                    x,
                    y,
                    width: size,
                    height: size
                });

            }

            const outputBytes = await pdfDoc.save();

            const outputPath =
                "uploads/image_watermarked.pdf";

            fs.writeFileSync(
                outputPath,
                outputBytes
            );

            res.download(outputPath);

        } catch (err) {

            console.log(err);

            res.send(
                "Error while adding image watermark."
            );

        }

    }
);

app.post(
"/page-number",
upload.single("pdfFile"),
async (req,res)=>{

try{

const pdfBytes=fs.readFileSync(req.file.path);

const pdfDoc=await PDFDocument.load(pdfBytes);

const font=await pdfDoc.embedFont(
StandardFonts.Helvetica
);

const pages=pdfDoc.getPages();

const fontSize=parseInt(req.body.fontSize);

const position=req.body.position;

for(let i=0;i<pages.length;i++){

const page=pages[i];

const {width,height}=page.getSize();

let x=width/2;
let y=20;

if(position==="bottom-left"){
x=20;
y=20;
}

if(position==="bottom-right"){
x=width-40;
y=20;
}

if(position==="top-left"){
x=20;
y=height-30;
}

if(position==="top-right"){
x=width-40;
y=height-30;
}

page.drawText(
String(i+1),
{
x:x,
y:y,
size:fontSize,
font:font
}
);

}

const pdfOut=await pdfDoc.save();

const outputPath=
"uploads/page_numbered.pdf";

fs.writeFileSync(
outputPath,
pdfOut
);

res.download(outputPath);

}catch(err){

console.log(err);

res.send(
"Error while adding page numbers."
);

}

});

app.post(
"/organize",
upload.single("pdfFile"),
async(req,res)=>{

try{

const pdfBytes=fs.readFileSync(req.file.path);

const pdfDoc=
await PDFDocument.load(pdfBytes);

const newPdf=
await PDFDocument.create();

const order=req.body.order
.split(",")
.map(x=>parseInt(x.trim())-1);

for(const index of order){

if(
index>=0 &&
index<pdfDoc.getPageCount()
){

const [page]=
await newPdf.copyPages(
pdfDoc,
[index]
);

newPdf.addPage(page);

}

}

const output=
await newPdf.save();

const outputPath=
"uploads/organized.pdf";

fs.writeFileSync(
outputPath,
output
);

res.download(outputPath);

}catch(err){

console.log(err);

res.send(
"Error while organizing PDF."
);

}

});

app.post("/compress", upload.single("pdfFile"), async (req, res) => {
    try {

        const inputPdf = req.file.path;

        const outputPdf = "uploads/compressed.pdf";

        exec(
            `"C:\\poppler\\poppler-26.02.0\\Library\\bin\\pdftoppm.exe" -jpeg -jpegopt quality=50 "${inputPdf}" uploads/page`,
            async (err) => {

                if (err) {
                    console.log(err);
                    return res.send("Compression Error");
                }

                const { PDFDocument } = require("pdf-lib");

                const newPdf = await PDFDocument.create();

                const fs = require("fs");

                const files = fs.readdirSync("uploads")
                    .filter(f => f.startsWith("page"));

                for (const file of files) {

                    const imgBytes = fs.readFileSync(
                        "uploads/" + file
                    );

                    const img = await newPdf.embedJpg(
                        imgBytes
                    );

                    const page = newPdf.addPage([
                        img.width,
                        img.height
                    ]);

                    page.drawImage(img, {
                        x: 0,
                        y: 0,
                        width: img.width,
                        height: img.height
                    });
                }

                const pdfBytes = await newPdf.save();

                fs.writeFileSync(
                    outputPdf,
                    pdfBytes
                );

                res.download(outputPdf);
            }
        );

    } catch (e) {
        console.log(e);
        res.send("Error");
    }
});

app.post(
"/word-to-pdf",
upload.single("wordFile"),
async (req,res)=>{

try{

const file=fs.readFileSync(req.file.path);

libre.convert(
file,
".pdf",
undefined,
(err,done)=>{

if(err){
console.log(err);
return res.send(
"Conversion Failed"
);
}

const outputPath=
"uploads/converted.pdf";

fs.writeFileSync(
outputPath,
done
);

res.download(outputPath);

}
);

}catch(err){

console.log(err);

res.send(
"Error converting file."
);

}

});

app.post(
"/excel-to-pdf",
upload.single("excelFile"),
async (req,res)=>{

try{

const file=fs.readFileSync(req.file.path);

libre.convert(
file,
".pdf",
undefined,
(err,done)=>{

if(err){
console.log(err);
return res.send("Conversion Failed");
}

const outputPath=
"uploads/excel_converted.pdf";

fs.writeFileSync(
outputPath,
done
);

res.download(outputPath);

}
);

}catch(err){

console.log(err);

res.send("Error");

}

});

app.post(
"/ppt-to-pdf",
upload.single("pptFile"),
async (req,res)=>{

try{

const file=fs.readFileSync(req.file.path);

libre.convert(
file,
".pdf",
undefined,
(err,done)=>{

if(err){
console.log(err);
return res.send("Conversion Failed");
}

const outputPath=
"uploads/ppt_converted.pdf";

fs.writeFileSync(
outputPath,
done
);

res.download(outputPath);

}
);

}catch(err){

console.log(err);

res.send("Error");

}

});

app.post(
"/pdf-to-word",
upload.single("pdf"),
async (req,res)=>{

try{

const pdfBuffer =
fs.readFileSync(req.file.path);

const data =
await pdfParse(pdfBuffer);

const doc =
new Document({

sections:[
{
properties:{},
children:[
new Paragraph(
data.text
)
]
}
]

});

const buffer =
await Packer.toBuffer(doc);

const outputPath =
"uploads/converted.docx";

fs.writeFileSync(
outputPath,
buffer
);

res.download(outputPath);

}catch(err){

console.log(err);

res.send(err.toString());

}
});
// =====================
// START SERVER
// =====================

app.listen(3000, () => {
    console.log("Server Started at http://localhost:3000");
});