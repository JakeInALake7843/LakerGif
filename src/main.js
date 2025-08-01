const InputField = document.getElementById("ImageInput");
const PreviewImage = document.getElementById("PreviewImage");
const ProcessButton = document.getElementById("Process");
const Canvas = document.getElementById("Canvas");
const OutputImage = document.getElementById("OutputImage");

const stage = Jcrop.attach("PreviewImage");

InputField.addEventListener("drop", (e) => {
	e.preventDefault();
	const reader = new FileReader();
	reader.readAsDataURL(e.dataTransfer.files[0]);
	reader.onload = () => {
		PreviewImage.src = reader.result;
	};
});
InputField.addEventListener("change", (e) => {
	e.preventDefault();
	const reader = new FileReader();
	reader.readAsDataURL(e.dataTransfer.files[0]);
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
