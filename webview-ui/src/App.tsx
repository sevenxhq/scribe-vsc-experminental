import { useEffect, useState } from "react";
import "./App.css";
import { vscode } from "./utilities/vscode";
import { markdownToStories, storiesToMarkdown } from "./utilities/editor";
import ObsEditorPanel from "./components/ObsEditorPanel";
import { useDocument } from "./hooks/useDocument";
import { MessageType } from "../../src/shared/messageTypes";
import ObsReadonlyPanel from "./components/ObsReadonlyPanel";

interface VsCodeFile extends File {
  path: string;
}

function App() {
  const [stories, setStories] = useState([]);

  const { document: doc, isReadonly } = useDocument();
  useEffect(() => {
    vscode.setMessageListeners();
  }, []);

  useEffect(() => {
    if (doc) {
      setStories(markdownToStories(doc ?? "") as []);
    }
  }, [doc]);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handleSetStoryChange = (story: Record<string, any>[]) => {
    setStories(story as []);
    const docMarkdown = storiesToMarkdown(story);

    vscode.postMessage({
      type: MessageType.save,
      payload: docMarkdown,
    });
  };

  const [, setFile] = useState<VsCodeFile | null>(null);

  if (isReadonly) {
    return (
      <div className="card">
        <ObsReadonlyPanel obsStory={stories} />
      </div>
    );
  }
  return (
    <>
      <div className="card">
        {/* <VSCodeButton onClick={handleHowdyClick}>Howdy!</VSCodeButton> */}
        <input
          type="file"
          onInput={(e) => {
            const file = (e.target as HTMLInputElement)
              .files?.[0] as VsCodeFile;
            if (file) {
              setFile(file);
              console.log(file);

              vscode.postMessage({
                type: MessageType.openResource,
                payload: { path: file.path },
              });
            }
          }}
        />
        <div>
          <ObsEditorPanel obsStory={stories} setStory={handleSetStoryChange} />
        </div>
      </div>
    </>
  );
}

export default App;
