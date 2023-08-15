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

import { CSSProperties } from "react";

interface Font {
  name: string;
  styles: CSSProperties[];
}

const FONTS: Font[] = [
  {
    name: "Mockary Personal",
    styles: [{ fontWeight: 400 }],
  },
  {
    name: "Comic Sans MS",
    styles: [{ fontWeight: 400 }],
  },
  {
    name: "Golden Hills DEMO",
    styles: [{ fontWeight: 400 }],
  },
  {
    name: "Hello Valentica",
    styles: [{ fontWeight: 400 }],
  },
  {
    name: "Mailine Personal User",
    styles: [{ fontWeight: 400 }],
  },
  {
    name: "Sindentosa",
    styles: [{ fontWeight: 700 }, { fontWeight: 400, fontStyle: "italic" }],
  },
  {
    name: "French Script MT",
    styles: [{ fontWeight: 700 }],
  },
  {
    name: "Beauty Queen Script",
    styles: [{ fontWeight: 700 }],
  },
  {
    name: "Cac Lasko Even Weight",
    styles: [{ fontWeight: 400 }],
  },
  {
    name: "Brush Script MT",
    styles: [{ fontWeight: 400 }],
  },
  {
    name: "Charlie",
    styles: [{ fontWeight: 700 }],
  },
  {
    name: "Janda Swirly Twirly",
    styles: [{ fontWeight: 700 }],
  },
  {
    name: "Ink Free",
    styles: [{ fontWeight: 700 }],
  },
  {
    name: "Harrigton",
    styles: [{ fontWeight: 700 }],
  },
  {
    name: "Civitype FG",
    styles: [{ fontWeight: 400 }],
  },
  {
    name: "BillyanaPersonalUseOnly",
    styles: [{ fontWeight: 400 }],
  },
  {
    name: "Marguaritas",
    styles: [{ fontWeight: 400 }],
  },
  {
    name: "Cursive Standard",
    styles: [{ fontWeight: 400 }],
  },
  {
    name: "Qwerty Ability-PersonalUse",
    styles: [{ fontWeight: 700 }],
  },
  {
    name: "White Dream PERSO",
    styles: [{ fontWeight: 400 }],
  },
  {
    name: "Femina",
    styles: [{ fontWeight: 400 }],
  },
  {
    name: "Lovely Valentine",
    styles: [{ fontWeight: 400 }],
  },
  {
    name: "From Me 2 You",
    styles: [{ fontWeight: 400 }],
  },
  {
    name: "Autography",
    styles: [{ fontWeight: 400 }],
  },
  {
    name: "PrettyGirlsScriptDemo",
    styles: [{ fontWeight: 700 }],
  },
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
          <div
            className="inline-flex items-center w-full gap-2"
            key={font.name}
          >
            <p className="w-3 text-xs">{i + 1}</p>
            {font.styles.map((style) => (
              <p
                className="px-2 text-center bg-gray-100 rounded-md min-w-[100px]"
                style={{
                  ...style,
                  fontFamily: font.name,
                }}
              >
                {text}
              </p>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

export default App;
