import { useEffect, useState } from "react";
import { vscode } from "../utilities/vscode";

export const useDocument = () => {
  const [document, setDocument] = useState<string | null>(null);

  useEffect(() => {
    vscode.setMessageListeners((event) => {
      switch (event.data.type) {
        case "update":
          setDocument(event.data.payload);
          break;
      }
    });
  }, []);

  return [document];
};
