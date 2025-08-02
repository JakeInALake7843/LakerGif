import { invoke } from "@tauri-apps/api/core";
import { getCurrentWebview } from "@tauri-apps/api/webview";

//#region Variables
let ImageName = "temp.png";

//#region Elements
const InputField = document.getElementById("ImageInput")! as HTMLInputElement;
const PreviewImage = document.getElementById("PreviewImage")! as HTMLImageElement;
const ProcessButton = document.getElementById("Process")! as HTMLButtonElement;
const ToGifButton = document.getElementById("ToGif")! as HTMLButtonElement;
const Canvas = document.getElementById("Canvas")! as HTMLCanvasElement;
const OutputImage = document.getElementById("OutputImage")! as HTMLImageElement;
//#endregion

// @ts-ignore // throws an error due to being imported in html
let stage = Jcrop.attach("PreviewImage");

//#endregion

//#region Functions

function CreateStage() {
    stage.destroy();
    // @ts-ignore
    stage = Jcrop.attach("PreviewImage");
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

OutputImage.addEventListener("dragstart", (e) => {
    const imageBlob = dataURItoBlob(OutputImage.src);
    const file = new File([imageBlob], ImageName, { type: ImageName.endsWith(".gif") ? "image/gif" : "image/png" });
    e.dataTransfer?.clearData();
    e.dataTransfer?.setDragImage(OutputImage, 0, 0);
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
    CreateStage();
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
	CreateStage();
});

ProcessButton.onclick = () => {
    const img = new Image();
	img.src = PreviewImage.src;
	Canvas.width = stage.active.pos.w;
	Canvas.height = stage.active.pos.h;
	const ctx = Canvas.getContext("2d")!;
    
	ctx.drawImage(img, -stage.active.pos.x, -stage.active.pos.y);
    
	const output = Canvas.toDataURL("image/png");
	OutputImage.src = output;
};

ToGifButton.onclick = async () => {
    const gifOutput = await invoke("get_gif_from_image", { image: PreviewImage.src });
    OutputImage.src = gifOutput as string;
}

await getCurrentWebview().onDragDropEvent(async (event) => {
    if (event.payload.type === "drop") {
        const filepath = event.payload.paths[0];
        const lastSeperator = filepath.lastIndexOf('/');
        ImageName = filepath.slice(lastSeperator);
        const output : string = await invoke("get_image_from_path", { name: filepath });
        PreviewImage.src = output;
        CreateStage();
	}
});
//#endregion

//#endregion

CreateStage();