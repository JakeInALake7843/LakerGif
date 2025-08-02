import { invoke } from "@tauri-apps/api/core";
import { getCurrentWebview } from "@tauri-apps/api/webview";

//#region Variables
let ImageName = "temp.png";


//#region Elements
const InputField = document.getElementById("ImageInput")! as HTMLInputElement;
const CropContainer = document.getElementById("CropContainer")! as HTMLDivElement;
const PreviewImage = document.getElementById("PreviewImage")! as HTMLImageElement;
const ProcessButton = document.getElementById("Process")! as HTMLButtonElement;
const ToGifButton = document.getElementById("ToGif")! as HTMLButtonElement;
const Canvas = document.getElementById("Canvas")! as HTMLCanvasElement;
const OutputImage = document.getElementById("OutputImage")! as HTMLImageElement;
const OutputLink = document.getElementById("ImageLink")! as HTMLAnchorElement;
//#endregion

//#endregion

//#region Functions

function OnImageChange() {
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

OutputLink.addEventListener("dragstart", (e) => {
    const imageBlob = dataURItoBlob(OutputImage.src);
    const file = new File([imageBlob], ImageName, { type: imageBlob.type });
    e.dataTransfer?.clearData();
    e.dataTransfer?.setDragImage(OutputImage, e.offsetX, e.offsetY);
    e.dataTransfer?.items.add(file);
})

//#region Element Functions
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
    const img = new Image();
    img.src = PreviewImage.src;
    const selection = { x: 0, y: 0, width: 0, height: 0 };
	Canvas.width = selection!.width;
	Canvas.height = selection.height;
	const ctx = Canvas.getContext("2d")!;
    
	ctx.drawImage(img, -selection.x, -selection.y);
    
	const output = Canvas.toDataURL("image/png");
    OutputImage.src = output;
    OutputLink.href = output;
    OutputLink.download = ImageName;
};

ToGifButton.onclick = async () => {
    const gifOutput = await invoke("get_gif_from_image", { image: PreviewImage.src }) as string;
    ImageName = ImageName.replace(".png", ".gif");
    OutputImage.src = gifOutput;
    OutputLink.href = gifOutput;
    OutputLink.download = ImageName;
}

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