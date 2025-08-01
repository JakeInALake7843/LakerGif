import { invoke } from "@tauri-apps/api/core";
import { getCurrentWebview } from "@tauri-apps/api/webview";

const InputField = document.getElementById("ImageInput")! as HTMLInputElement;
const PreviewImage = document.getElementById("PreviewImage")! as HTMLImageElement;
const ProcessButton = document.getElementById("Process")! as HTMLButtonElement;
const Canvas = document.getElementById("Canvas")! as HTMLCanvasElement;
const OutputImage = document.getElementById("OutputImage")! as HTMLImageElement;

// @ts-ignore
const stage = Jcrop.attach("PreviewImage");

InputField.addEventListener("drop", (e) => {
	console.log(e);
	e.preventDefault();
	const reader = new FileReader();
	reader.readAsDataURL(e.dataTransfer!.files[0]);
	reader.onload = () => {
		PreviewImage.src = reader.result as string;
	};
	stage.removeWidget(stage.active);
});
InputField.addEventListener("change", (e) => {
	console.log(e);
	e.preventDefault();
	const reader = new FileReader();
	reader.readAsDataURL(InputField.files![0]);
	reader.onload = () => {
		PreviewImage.src = reader.result as string;
	};
	stage.removeWidget(stage.active);
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

await getCurrentWebview().onDragDropEvent(async (event) => {
	if (event.payload.type === "drop") {
		const filepath = event.payload.paths[0];
        const output : string = await invoke("get_image_from_path", { name: filepath });
		PreviewImage.src = output;
	}
});
