import { useEffect, useRef, useState } from "react";
import { Button, Input } from "@nextui-org/react";
import { toPng } from "html-to-image";
import { invoke } from "@tauri-apps/api/tauri";
import { MdFolderOpen, MdCheck } from "react-icons/md";

import { open } from "@tauri-apps/api/dialog";
import { desktopDir } from "@tauri-apps/api/path";
import { Store } from "tauri-plugin-store-api";
import { toast } from "react-hot-toast";
const store = new Store(".settings.dat");

const FONTS = [
  "Mockary Personal",
  "Comic Sans MS",
  "Golden Hills DEMO",
  "Hello Valentica",
  "Mailine Personal User",
  "Sindentosa",
  "French Script MT",
  "Beauty Queen Script",
  "Cac Lasko Even Weight",
  "Brush Script MT",
  "Charlie",
  "Janda Swirly Twirly",
  "Ink Free",
  "Harrigton",
  "Civitype FG",
  "BillyanaPersonalUseOnly",
  "Marguaritas",
  "Cursive Standard",
  "Qwerty Ability-PersonalUse",
  "White Dream PERSO",
  "Femina",
  "Lovely Valentine",
  "From Me 2 You",
  "Autography",
  "PrettyGirlsScriptDemo",
];

function App() {
  const [text, setText] = useState("");
  const [saveFolder, setSaveFolder] = useState("");
  const elementRef = useRef(null);

  const htmlToImageConvert = () => {
    if (!elementRef.current) return;
    const toastId = toast.loading("Génération de l'image...");
    toPng(elementRef.current, {
      cacheBust: false,
      backgroundColor: "white",
      type: "jpeg",
      width: 256,
    })
      .then(async (dataUrl) => {
        const { folder } = ((await store.get("save_folder")) as {
          folder: string;
        }) || {
          folder: await desktopDir(),
        };
        const result = await invoke("save_image", {
          image: dataUrl,
          saveFolder: folder,
          text,
        });
        result
          ? toast.success("Image générée !", { id: toastId })
          : toast.error("Erreur !", { id: toastId });
      })
      .catch((err) => {
        console.error(err);
        toast.error("Erreur !", { id: toastId });
      });
  };

  const selectFolder = async () => {
    // Open a selection dialog for directories
    const selected = await open({
      directory: true,
      defaultPath: await desktopDir(),
    });
    if (!selected) return;
    await store.set("save_folder", { folder: selected });
    await store.save();
    setSaveFolder(selected as string);
  };

  useEffect(() => {
    (async () => {
      const { folder } = ((await store.get("save_folder")) as {
        folder: string;
      }) || {
        folder: await desktopDir(),
      };
      setSaveFolder(folder);
    })();
  }, []);

  return (
    <div className="flex flex-col gap-4 p-4">
      <div className="flex flex-col gap-2">
        <Input
          className="w-full grow"
          value={text}
          onChange={(e) => setText(e.target.value)}
          label="Texte"
        />
        <div className="inline-flex items-center w-full gap-2">
          <Button
            color="default"
            className="px-8 grow"
            variant="bordered"
            onClick={selectFolder}
          >
            <MdFolderOpen className="w-5 h-5 shrink-0" />
            Changer le dossier
          </Button>
          <Button
            onClick={htmlToImageConvert}
            color="primary"
            className="px-8 grow"
            variant="flat"
          >
            <MdCheck className="w-5 h-5 shrink-0" />
            Générer
          </Button>
        </div>
        <p className="text-sm text-gray-500">
          Dossier de sauvegarde : {saveFolder}
        </p>
      </div>
      <hr />
      <div
        className="flex flex-col items-start p-2 -my-4 gap-y-1"
        ref={elementRef}
      >
        {FONTS.map((font, i) => (
          <div className="inline-flex items-center w-full gap-2" key={font}>
            <p className="w-3 text-xs">{i + 1}</p>
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
