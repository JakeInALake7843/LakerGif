import { invoke } from "@tauri-apps/api/core";
import { getCurrentWebview } from "@tauri-apps/api/webview";

//#region Variables
let ImageName = "temp.png";

let CurrentMode = "CropPNG";

//#region Elements
const InputField = document.getElementById("ImageInput")! as HTMLInputElement;
const PreviewImage = document.getElementById("PreviewImage")! as HTMLImageElement;
const ProcessButton = document.getElementById("Process")! as HTMLButtonElement;
const Canvas = document.getElementById("Canvas")! as HTMLCanvasElement;
const OutputImage = document.getElementById("OutputImage")! as HTMLImageElement;
const OutputLink = document.getElementById("ImageLink")! as HTMLAnchorElement;

const _TempModeElements = document.getElementsByClassName("ModeSelector");
const ModeElements: HTMLButtonElement[] = [];
for (let i = 0; i < _TempModeElements.length; i++) {
    ModeElements.push(_TempModeElements.item(i)! as HTMLButtonElement);
    ModeElements[i].onclick = ChangeMode;
}
//#endregion

//#endregion

//#region CROPPING LOGIC
let x = 0;
let y = 0;
let w = 0;
let h = 0;
let dragging = false;
let validRect = true;
let canDrag = false;
const CropContainer = document.getElementById("CropContainer")! as HTMLDivElement;
const CropRect = document.getElementById("CropSelection")! as HTMLDivElement;
const CropMask = document.getElementById("CropMask")! as HTMLElement;
const RectMask = document.getElementById("RectMask")! as HTMLDivElement;

CropContainer.addEventListener("mousedown", (e) => {
    if (!canDrag) return;
    dragging = true;
    x = e.offsetX;
    y = e.offsetY;
    w = 0;
    h = 0;
    let rect = CropRect.style;
    rect.left = `${x}px`;
    rect.top = `${y}px`;
    rect.width = `${w}px`;
    rect.height = `${h}px`;
    rect.display = "block";
    RectMask.style.display = "block";
});
CropContainer.addEventListener("mousemove", (e) => {
    if (e.buttons != 1) return;
    if (!dragging) return;
    w = e.offsetX - x;
    h = e.offsetY - y;
    let rect = CropRect.style;
    rect.left = (w < 0 ? e.offsetX : x) + 'px';
    rect.top = (h < 0 ? e.offsetY : y) + 'px';
    rect.width = Math.abs(w) + 'px';
    rect.height = Math.abs(h) + 'px';

    CropMask.setAttribute("x", (w < 0 ? e.offsetX : x) + 'px');
    CropMask.setAttribute("y", (h < 0 ? e.offsetY : y) + 'px');
    CropMask.setAttribute("width", Math.abs(w)+4 + 'px');
    CropMask.setAttribute("height", Math.abs(h)+4 + 'px');
});
CropContainer.addEventListener("mouseup", () => {
    if (!dragging) return;
    dragging = false;
    if (Math.abs(w) < 2 || Math.abs(h) < 2) {
        let rect = CropRect.style;
        rect.x = "0px";
        rect.y = "0px";
        rect.width = "0px";
        rect.height = "0px";
        rect.display = "none";
        RectMask.style.display = "none";
        validRect = false;
        return;
    }
    validRect = true;
})

function resetCrop() {
    let rect = CropRect.style;
    rect.x = "0px";
    rect.y = "0px";
    rect.width = "0px";
    rect.height = "0px";
    rect.display = "none";
    RectMask.style.display = "none";
    validRect = false;
    return;
}

//#endregion

//#region Functions

function getModeElement(mode: string) {
    return ModeElements.find((e) => e.id.replace("Mode_", "") == mode);
}
function ChangeMode(event: MouseEvent) {
    const thisButton = event.target as HTMLButtonElement
    CurrentMode = thisButton.id.replace("Mode_", "");
    ModeElements.forEach((element) => {
        element.classList.remove("Active");
        if (element.id == thisButton.id) element.classList.add("Active"); 
    })
    OnModeChange();
}

function OnModeChange() {
    canDrag = false;
    switch (CurrentMode) {
        case "CropPNG":
            canDrag = true;
            break;
    }
}

function OnImageChange() {
    resetCrop();
    CropContainer.style.width = `${PreviewImage.width}px`;
    CropContainer.style.width = `${PreviewImage.width}px`;
}

function dataURItoBlob(data: string) {
    const byteString = atob(data.split(',')[1]);
    const mime = data.split(',')[0].split(':')[1].split(';')[0];
    const ab = new ArrayBuffer(byteString.length);
    const ia = new Uint8Array(ab);
    for (let i = 0; i < byteString.length; i++) {
        ia[i] = byteString.charCodeAt(i);
    }
    return new Blob([ab], { type: mime });
}

function CropPNG() {
    if (!validRect) return;
    const img = new Image();
    img.src = PreviewImage.src;
	Canvas.width = w;
	Canvas.height = h;
	const ctx = Canvas.getContext("2d")!;
    
	ctx.drawImage(img, -x, -y);
    
	const output = Canvas.toDataURL("image/png");
    OutputImage.src = output;
    OutputLink.href = output;
    OutputLink.download = ImageName;
}
async function ConvertToGif() {
    const gifOutput = await invoke("get_gif_from_image", { image: PreviewImage.src }) as string;
    ImageName = ImageName.replace(".png", ".gif");
    OutputImage.src = gifOutput;
    OutputLink.href = gifOutput;
    OutputLink.download = ImageName;
}


//#region Element Functions

OutputLink.addEventListener("dragstart", (e) => {
    const imageBlob = dataURItoBlob(OutputImage.src);
    const file = new File([imageBlob], ImageName, { type: imageBlob.type });
    e.dataTransfer?.clearData();
    e.dataTransfer?.setDragImage(OutputImage, e.offsetX, e.offsetY);
    e.dataTransfer?.items.add(file);
})

InputField.addEventListener("drop", (e) => {
    console.log(e);
	e.preventDefault();
	const reader = new FileReader();
	reader.readAsDataURL(e.dataTransfer!.files[0]);
    reader.onload = () => {
        ImageName = e.dataTransfer!.files[0].name;
        PreviewImage.src = reader.result as string;
    };
    OnImageChange();
});

InputField.addEventListener("change", (e) => {
    console.log(e);
	e.preventDefault();
	const reader = new FileReader();
	reader.readAsDataURL(InputField.files![0]);
	reader.onload = () => {
        ImageName = InputField.files![0].name;
        PreviewImage.src = reader.result as string;
    };
    OnImageChange();
});

ProcessButton.onclick = () => {
    switch (CurrentMode) {
        case "CropPNG":
            CropPNG();
            break;
        case "PNGToGIF":
            ConvertToGif();
            break;
    }
};

await getCurrentWebview().onDragDropEvent(async (event) => {
    if (event.payload.type === "drop") {
        if (event.payload.paths.length == 0) return;
        const filepath = event.payload.paths[0];
        const lastSeperator = filepath.lastIndexOf('\\');
        ImageName = filepath.slice(lastSeperator+1);
        const output : string = await invoke("get_image_from_path", { name: filepath });
        PreviewImage.src = output;
        OnImageChange();
	}
});
//#endregion

//#endregion

// init
OnImageChange();