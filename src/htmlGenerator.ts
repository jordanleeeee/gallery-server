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
        z-index: 9999;
    }
    
    #preview img {
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        max-width: 100%;
        max-height: 100%;
    }
    
    #images {
        zoom: 30%
    }
 </style>
</head>
<body>
    <div id="preview" onclick="hidePreview()"></div>
    {{header}}
    {{content}}
</body>
<script>
   
    function showPreview(imageSrc) {
        let preview = document.getElementById('preview');
        preview.style.display = 'block';
        preview.innerHTML = '<img onclick="showPreview()" src="' + imageSrc + '" alt="' + imageSrc + '" />'
    }
    
    function hidePreview() {
        document.getElementById('preview').style.display = 'none';
    }
</script>
</html>
`
const fileIcon = "file"
const directoryIcon = "directory"

export function getDirectoryHtml(files: File[], resources: string, path: string): string {
    let html = htmlTemplate;
    const nonImageFile = files.filter(f => f.type === 'directory' || !isImage(f.contentType!));
    if (nonImageFile.length === 0 && files.length > 0) {
        html = html.replace("{{header}}", "")
        const content = files.map(file => `<img onclick='showPreview("${path + "/" + file.path}")' src="${path + "/" + file.path}" alt="${file.path}" />`).join("\n")
        html = html.replace("{{content}}", `<div id="images">${content}</div>`);
    } else {
        html = html.replace("{{header}}", `<h1>${resources}</h1>`)
        let parent = path.substring(1, path.length);
        let content = files.map(file => `<div>${file.type === "directory"? directoryIcon: fileIcon}  <a href="${parent + "/" + file.path}">${file.path}</a></div>`).join("\n")
        if (parent !== "") {
            content = "<div>" + directoryIcon + "  <a href='../'>../</a></div>" + content;
        }
        html = html.replace("{{content}}", content);
    }
    return html;
}
