import {File} from "../type/file";
import {isImage} from "./fileUtil";

const htmlTemplate = `
<!DOCTYPE html>
<html lang="">
<head>
  <title>Gallery</title>
  <style>
    #preview {
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        width: 95%;
        height: 95%;
        background-color: rgba(0, 0, 0, 0.95);
        display: none;
        z-index: 10;
    }
    
    #preview img {
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        max-width: 100%;
        max-height: 100%;
    }
    
    #prev-btn {
        position: absolute;
        height: 100%;
        width: 4%;
        background-color: transparent;
        color: white;
        border: none;
        cursor: pointer;
        font-size: 20px;
    }
    
    #next-btn {
        position: absolute;
        height: 100%;
        width: 4%;
        left: 96%;
        background-color: transparent;
        color: white;
        border: none;
        cursor: pointer;
        font-size: 20px;
        z-index: 20;
    }
    
    #images {
        zoom: 50%
    }
 </style>
</head>
<body>
    <div id="preview">
        <button id="prev-btn" onclick="prevImage()">&#10094;</button>
        <img id="previewImage" src="#" alt="#" onclick="hidePreview()" />
        <button id="next-btn" onclick="nextImage()">&#10095;</button>
    </div>
    {{header}}
    {{content}}
</body>
<script>
   let currentImageIndex = 0;
   let images = document.querySelectorAll('#images img')
   
    function showPreview(imageSrc) {
        document.getElementById('preview').style.display = 'block';
        document.getElementById('previewImage').src = imageSrc;
        document.getElementById('previewImage').alt = imageSrc;
        currentImageIndex = Array.from(images).findIndex(img => decodeURI(imageSrc).endsWith(decodeURI(img.alt)));
    }
    
    function prevImage() {
        currentImageIndex--;
        if (currentImageIndex < 0) {
            currentImageIndex = images.length - 1;
        }
        showPreview(images[currentImageIndex].src)
    }
    
    function nextImage() {
        currentImageIndex++;
        if (currentImageIndex >= images.length) {
            currentImageIndex = 0;
        }
        showPreview(images[currentImageIndex].src)
    }
    
    function hidePreview() {
        document.getElementById('preview').style.display = 'none';
    }
</script>
</html>
`
const fileIcon = "file"
const directoryIcon = "directory"

export function getDirectoryHtml(files: File[], resources: string, showParentDir: boolean): string {
    let html = htmlTemplate;
    const nonImageFile = files.filter(f => f.type === 'directory' || !isImage(f.contentType!));
    if (nonImageFile.length === 0 && files.length > 0) {
        html = html.replace("{{header}}", "")
        const content = files.map(file => `<img onclick='showPreview("./${file.path}")' src="./${file.path}" alt="${file.path}" />`).join("\n")
        html = html.replace("{{content}}", `<div id="images">${content}</div>`);
    } else {
        html = html.replace("{{header}}", `<h1>${resources}</h1>`)
        let content = files.map(file => `<div>${file.type === "directory" ? directoryIcon : fileIcon} <a href="./${file.path}${file.type === "directory" ? "/" : ""}">${file.path}</a></div>`).join("\n")

        if (showParentDir) {
            content = "<div>" + directoryIcon + " <a href='../'>../</a></div>" + content;
        }
        html = html.replace("{{content}}", content);
    }
    return html;
}
