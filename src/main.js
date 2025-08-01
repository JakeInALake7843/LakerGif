import { invoke } from "@tauri-apps/api/core";
import { getCurrentWebview } from "@tauri-apps/api/webview";
import { convertFileSrc } from "@tauri-apps/api/core";

const InputField = document.getElementById("ImageInput");
const PreviewImage = document.getElementById("PreviewImage");
const ProcessButton = document.getElementById("Process");
const Canvas = document.getElementById("Canvas");
const OutputImage = document.getElementById("OutputImage");

const stage = Jcrop.attach("PreviewImage");

InputField.addEventListener("drop", (e) => {
	console.log(e);
	e.preventDefault();
	const reader = new FileReader();
	reader.readAsDataURL(e.dataTransfer.files[0]);
	reader.onload = () => {
		PreviewImage.src = reader.result;
	};
});
InputField.addEventListener("change", (e) => {
	console.log(e);
	e.preventDefault();
	const reader = new FileReader();
	reader.readAsDataURL(e.target.files[0]);
	reader.onload = () => {
		PreviewImage.src = reader.result;
	};
});
ProcessButton.onclick = (ev) => {
	const img = new Image();
	img.src = PreviewImage.src;
	Canvas.width = stage.active.pos.w;
	Canvas.height = stage.active.pos.h;
	const ctx = Canvas.getContext("2d");

	ctx.drawImage(img, -stage.active.pos.x, -stage.active.pos.y);

	const output = Canvas.toDataURL("image/png");
	OutputImage.src = output;
};

await getCurrentWebview().onDragDropEvent(async (event) => {
	if (event.payload.type === "drop") {
		const filepath = event.payload.paths[0];
		const newImage = convertFileSrc(filepath);
		PreviewImage.src = newImage.src;
	}
});
