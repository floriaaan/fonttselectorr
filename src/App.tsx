import { useRef, useState } from "react";
import { Button, Input } from "@nextui-org/react";
import { toPng } from "html-to-image";
import { invoke } from "@tauri-apps/api/tauri";

const FONTS = [
  "Arial",
  "Calibri",
  "Comic Sans MS",
  "Courier New",
  "Georgia",
  "Helvetica",
  "Impact",
  "Lucida Grande",
];

function App() {
  const [text, setText] = useState("");
  const elementRef = useRef(null);

  const htmlToImageConvert = () => {
    if (!elementRef.current) return;
    toPng(elementRef.current, { cacheBust: false, backgroundColor: "white", type: "jpeg", width: 256 })
      .then(async (dataUrl) => {
        const result = await invoke("save_image", { image: dataUrl });
        console.log(result);
      })
      .catch((err) => {
        console.log(err);
      });
  };

  return (
    <div className="flex flex-col gap-4 p-4 pt-12">
      <form
        className="inline-flex items-center w-full gap-2"
        onSubmit={(e) => {
          e.preventDefault();
          htmlToImageConvert();
        }}
      >
        <Input
          className="w-full grow"
          value={text}
          onChange={(e) => setText(e.target.value)}
          label="Texte"
          labelPlacement="outside"
        />
        <Button type="submit" color="primary" className="px-8" variant="flat">
          Générer l'image
        </Button>
      </form>
      <hr />
      <div className="flex flex-col items-start p-2 -my-2 gap-y-1" ref={elementRef}>
        {FONTS.map((font, i) => (
          <div className="inline-flex items-center gap-2" key={font}>
            <p>{i + 1}</p>
            <p
              className="px-2 text-center bg-gray-100 rounded-md min-w-[100px]"
              style={{ fontFamily: font }}
            >
              {text}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}

export default App;
