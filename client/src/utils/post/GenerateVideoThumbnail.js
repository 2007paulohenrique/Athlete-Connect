export default function generateVideoThumbnail(videoPath) {
    return new Promise((resolve) => {
        const video = document.createElement("video");
        video.src = videoPath;

        video.addEventListener("loadeddata", () => {
            const canvas = document.createElement("canvas");

            canvas.width = video.videoWidth;
            canvas.height = video.videoHeight;

            const context = canvas.getContext("2d");

            context.drawImage(video, 0, 0, canvas.width, canvas.height);

            const thumbnailURL = canvas.toDataURL("image/png");

            resolve(thumbnailURL);
        });
    });
};