import { Font } from "@react-pdf/renderer";

let registered = false;

export function registerFonts() {
  if (registered) return;
  Font.register({
    family: "NotoSansJP",
    fonts: [
      {
        src: "https://fonts.gstatic.com/s/notosansjp/v52/-F6jfjtqLzI2JPCgQBnw7HFyzSD-AsregP8VFBEi75vY0rw-oME.ttf",
        fontWeight: "normal",
      },
      {
        src: "https://fonts.gstatic.com/s/notosansjp/v52/-F6jfjtqLzI2JPCgQBnw7HFyzSD-AsregP8VFBEj75vY0rw-oME.ttf",
        fontWeight: "bold",
      },
    ],
  });
  Font.registerHyphenationCallback((word) => [word]);
  registered = true;
}
