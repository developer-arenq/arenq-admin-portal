import { EditorState, convertFromRaw, convertToRaw, ContentState } from "draft-js";
import dynamic from "next/dynamic";
import { useEffect, useState } from "react";
import "react-draft-wysiwyg/dist/react-draft-wysiwyg.css";

const Editor = dynamic(
  () => import("react-draft-wysiwyg").then((module) => module.Editor),
  { ssr: false }
);

const TextEditor = ({ prevDesc, setProduct, product }) => {
  const [editorState, setEditorState] = useState(EditorState.createEmpty());

  // Convert content to raw JSON when editor changes
  const onEditorStateChange = (editorState) => {
    setEditorState(editorState);
    setProduct({
      ...product,
      desc: JSON.stringify(convertToRaw(editorState.getCurrentContent())),
    });
  };

  // Safely load previous description (JSON or plain text)
  useEffect(() => {
    if (prevDesc) {
      try {
        const parsed = JSON.parse(prevDesc); // Try JSON
        const content = convertFromRaw(parsed);
        setEditorState(EditorState.createWithContent(content));
      } catch {
        // If not JSON, treat as plain text
        const content = ContentState.createFromText(prevDesc);
        setEditorState(EditorState.createWithContent(content));
      }
    }
  }, [prevDesc]);

  return (
    <div>
      <Editor
        editorState={editorState}
        onEditorStateChange={onEditorStateChange}
        toolbarClassName="shadow border-gray-300 border rounded-md"
        editorClassName="shadow border-gray-300 rounded-md p-2 border border-t-0 mb-2"
        editorStyle={{
          minHeight: "200px",
        }}
      />
    </div>
  );
};

export default TextEditor;
