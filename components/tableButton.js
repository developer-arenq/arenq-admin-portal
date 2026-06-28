import { EditorState, RichUtils } from "draft-js";

const TableButton = ({ editorState, setEditorState }) => {
  const insertTable = () => {
    const contentState = editorState.getCurrentContent();
    const selectionState = editorState.getSelection();
    const newContentState = RichUtils.insertHTML(
      contentState,
      selectionState,
      "<table><tbody><tr><td></td><td></td></tr><tr><td></td><td></td></tr></tbody></table>"
    );
    const newEditorState = EditorState.push(
      editorState,
      newContentState,
      "insert-table"
    );
    setEditorState(newEditorState);
  };

  return (
    <button type="button" onClick={insertTable}>
      Table
    </button>
  );
};

export default TableButton;
