import { useState, useEffect } from "react";
import "./block-css/Calc.css";

export default function ObsidianClone() {
  const [folders, setFolders] = useState([]);
  const [selectedNote, setSelectedNote] = useState(null);
  const [noteContent, setNoteContent] = useState("");

  useEffect(() => {
    const savedData = localStorage.getItem("ggg");
    if (savedData) {
      setFolders(JSON.parse(savedData));
    }
  }, []);

  useEffect(() => {
    localStorage.setItem("ggg", JSON.stringify(folders));
  }, [folders]);

  const toggleFolders = (id) => {
    setFolders((prevFolders) => updateToggleFolders(prevFolders, id));
  };

  const updateToggleFolders = (folders, id) => {
    return folders.map((folder) => ({
      ...folder,
      collapsed: folder.id === id ? !folder.collapsed : folder.collapsed,
      children: folder.children ? updateToggleFolders(folder.children, id) : undefined,
    }));
  };

  const selectNote = (note) => {
    console.log("Выбранная заметка:", note);
    if (!note || note.type !== "note") return;
    setSelectedNote(note);
    setNoteContent(note.content || "");
  };

  const updateNoteContent = (event) => {
    const newContent = event.target.value;
    setNoteContent(newContent);
    setFolders((prevFolders) => updateNote(prevFolders, selectedNote.id, newContent));
    setSelectedNote((prev) => (prev ? { ...prev, content: newContent } : null));
  };

  const updateNote = (tree, noteId, content) => {
    return tree.map((item) => ({
      ...item,
      content: item.type === "note" && item.id === noteId ? content : item.content,
      children: item.children ? updateNote(item.children, noteId, content) : undefined,
    }));
  };

  const createFolder = (path = []) => {
    const folderName = prompt("Введите название папки");
    if (!folderName) return;
    setFolders((prevFolders) => addItem(prevFolders, path, folderName, "folder"));
  };

  const addNote = (path = []) => {
    const noteName = prompt("Введите название заметки");
    if (!noteName) return;
    setFolders((prevFolders) => addItem(prevFolders, path, noteName, "note"));
  };

  const addItem = (tree, path, name, type) => {
    if (path.length === 0) {
      return [...tree, { id: Date.now(), name, type, collapsed: false, children: type === "folder" ? [] : undefined, content: type === "note" ? "" : undefined }];
    }
    return tree.map((item) => ({
      ...item,
      children: item.id === path[0] ? addItem(item.children || [], path.slice(1), name, type) : item.children,
    }));
  };

  const rename = (path = []) => {
    const newName = prompt("Введите новое название");
    if (!newName) return;
    setFolders((prevFolders) => updateName(prevFolders, path, newName));
  };

  const updateName = (tree, path, newName) => {
    return tree.map((item) => ({
      ...item,
      name: item.id === path[0] ? newName : item.name,
      children: item.children ? updateName(item.children, path.slice(1), newName) : undefined,
    }));
  };

  const deleteItem = (path = []) => {
    const confirmDelete = window.confirm("Вы уверены, что хотите удалить этот элемент?");
    if (!confirmDelete) return;
    setFolders((prevFolders) => removeItem(prevFolders, path));
  };

  const removeItem = (tree, path) => {
    if (path.length === 1) {
      return tree.filter((item) => item.id !== path[0]);
    }
    return tree.map((item) => ({
      ...item,
      children: removeItem(item.children || [], path.slice(1)),
    }));
  };

  return (
    <div className="app">
      <div className="sidebar">
        <button className="button" onClick={() => createFolder()}>+ Папка</button>
        <ListItem 
          folders={folders} 
          path={[]} 
          createFolder={createFolder} 
          addNote={addNote} 
          rename={rename} 
          deleteItem={deleteItem} 
          selectNote={selectNote} 
          toggleFolders={toggleFolders} 
        />
      </div>
      <div className="content">
        {selectedNote && selectedNote.type === "note" ? (
          <textarea className="note-editor" value={noteContent} onChange={updateNoteContent}></textarea>
        ) : (
          <div className="placeholder">Выберите или создайте заметку</div>
        )}
      </div>
    </div>
  );
}

function ListItem({ folders, path, createFolder, addNote, rename, deleteItem, selectNote, toggleFolders }) {
  const [contextMenu, setContextMenu] = useState({ visible: false, x: 0, y: 0, targetPath: [] });

  const handleContextMenu = (event, itemPath) => {
    event.preventDefault();
    setContextMenu({
      visible: true,
      x: event.clientX,
      y: event.clientY,
      targetPath: itemPath,
    });
  };

  const closeContextMenu = () => {
    setContextMenu({ visible: false, x: 0, y: 0, targetPath: [] });
  };

  return (
    <div onClick={closeContextMenu}>
      <ul className="folder-list">
        {folders.map((folder) => (
          <li key={folder.id} className="folder-item" onContextMenu={(e) => handleContextMenu(e, [...path, folder.id])}>
            <div onClick={() => folder.type === "folder" ? toggleFolders(folder.id) : selectNote(folder)} style={{ cursor: "pointer" }}>
              {folder.type === "folder" ? (folder.collapsed ? "▶️" : "▼") : "📝"} {folder.name}
            </div>

            {folder.type === "folder" && !folder.collapsed && folder.children && folder.children.length > 0 && (
              <ListItem
                folders={folder.children}
                path={[...path, folder.id]}
                createFolder={createFolder}
                addNote={addNote}
                rename={rename}
                deleteItem={deleteItem}
                selectNote={selectNote}
                toggleFolders={toggleFolders}
              />
            )}
          </li>
        ))}
      </ul>

      {contextMenu.visible && (
        <div className="context-menu" style={{ top: contextMenu.y, left: contextMenu.x, position: "absolute" }}>
          <button onClick={() => createFolder(contextMenu.targetPath)}>+ Папка</button>
          <button onClick={() => addNote(contextMenu.targetPath)}>+ Заметка</button>
          <button onClick={() => rename(contextMenu.targetPath)}>✏️ Переименовать</button>
          <button onClick={() => deleteItem(contextMenu.targetPath)}>🗑️ Удалить</button>
        </div>
      )}
    </div>
  );
}
