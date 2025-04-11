import { useState, useEffect, useRef } from "react";
import "./block-css/Calc.css";

export default function ObsidianClone() {
  const [folders, setFolders] = useState([]);
  const [selectedNote, setSelectedNote] = useState(null);
  const [contextMenu, setContextMenu] = useState({ visible: false, x: 0, y: 0, targetPath: null });
  const [visible, setVisible] = useState(null)
  const sidebarRef = useRef(null)

  useEffect(()=>{

    function handleClickOutside(event){
      if (
        sidebarRef.current &&
        !sidebarRef.current.contains(event.target)
      ){
        setVisible(false)
      }
    }
    if(visible){
      document.addEventListener('mousedown', handleClickOutside)
    } else {
      document.removeEventListener('mousedown', handleClickOutside)
    }
    return()=>{
      document.removeEventListener('mousedown', handleClickOutside)
    }
  },[visible])


  // const toggleVisible =()=>{
  //   setVisible(prev => !prev)
  // }
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

  const createFolder = (path = []) => {
    const folderName = prompt("Введите название папки:");
    if (!folderName) return;
    setFolders((prevFolders) => addItem(prevFolders, path, folderName, "folder"));
    closeContextMenu();
  };

  const addNote = () => {
    if (!contextMenu.targetPath) return;
    const noteName = prompt("Введите название заметки:");
    if (!noteName) return;
    setFolders((prevFolders) => addItem(prevFolders, contextMenu.targetPath, noteName, "note"));
    closeContextMenu();
  };

  const renameItem = () => {
    if (!contextMenu.targetPath) return;
    const newName = prompt("Введите новое название:");
    if (!newName) return;
    setFolders((prevFolders) => updateName(prevFolders, contextMenu.targetPath, newName));
    closeContextMenu();
  };

  const deleteItem = () => {
    if (!contextMenu.targetPath) return;
    const confirmDelete = window.confirm("Вы уверены, что хотите удалить этот элемент?");
    if (!confirmDelete) return;
    setFolders((prevFolders) => removeItem(prevFolders, contextMenu.targetPath));
    closeContextMenu();
  };

  const addItem = (tree, path, name, type) => {
    if (path.length === 0) {
      return [...tree, createNewItem(name, type)];
    }
    return tree.map((item) => ({
      ...item,
      children: item.id === path[0] ? addItem(item.children || [], path.slice(1), name, type) : item.children,
    }));
  };

  const createNewItem = (name, type) => ({
    id: Date.now(),
    name,
    type,
    collapsed: false,
    children: type === "folder" ? [] : undefined,
    content: type === "note" ? "" : undefined,
  });

  const updateName = (tree, path, newName) => {
    return tree.map((item) => ({
      ...item,
      name: item.id === path[0] ? newName : item.name,
      children: item.children ? updateName(item.children, path.slice(1), newName) : undefined,
    }));
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

  const handleContextMenu = (event, path) => {
    event.preventDefault();
    event.stopPropagation();
    setContextMenu({
      visible: true,
      x: event.clientX,
      y: event.clientY,
      targetPath: path,
    });
  };

  const closeContextMenu = () => {
    setContextMenu({ visible: false, x: 0, y: 0, targetPath: null });
  };

  const selectNote = (note) => {
    if (note.type !== "note") return;
    setSelectedNote(note);
  };

  const updateNoteContent = (event) => {
    const newContent = event.target.value;
    setSelectedNote((prev) => ({ ...prev, content: newContent }));
    setFolders((prevFolders) => updateNote(prevFolders, selectedNote.id, newContent));
  };

  const updateNote = (tree, noteId, content) => {
    return tree.map((item) => ({
      ...item,
      content: item.type === "note" && item.id === noteId ? content : item.content,
      children: item.children ? updateNote(item.children, noteId, content) : undefined,
    }));
  };
  const findNoteById = (tree, id) => {
    for (let item of tree) {
      if (item.type === "note" && item.id === id) return item;
      if (item.children) {
        const found = findNoteById(item.children, id);
        if (found) return found;
      }
    }
    return null;
  };

  return (
    <div className="app" onClick={closeContextMenu}>
      <div className={`sidebar ${visible ? 'show' : ''}`} ref={sidebarRef}>
        <button className="button" onClick={() => createFolder([])}>+ Папка</button>
        <ListItem 
          folders={folders} 
          path={[]} 
          createFolder={createFolder} 
          addNote={addNote} 
          renameItem={renameItem}
          deleteItem={deleteItem}
          toggleFolders={toggleFolders} 
          handleContextMenu={handleContextMenu} 
          selectNote={selectNote}
        />
      </div>
      <div className="content">
        <button className="btn-showSidebar" onClick={()=>setVisible(!visible)}>
        <svg className="icons" xmlns="http://www.w3.org/2000/svg" id="Outline" viewBox="0 0 24 24" width="16" height="16" fill="#f8f8f2">
        <path d="M19,3H12.472a1.019,1.019,0,0,1-.447-.1L8.869,1.316A3.014,3.014,0,0,0,7.528,1H5A5.006,5.006,0,0,0,0,6V18a5.006,5.006,0,0,0,5,
        5H19a5.006,5.006,0,0,0,5-5V8A5.006,5.006,0,0,0,19,3ZM5,3H7.528a1.019,1.019,0,0,1,.447.1l3.156,1.579A3.014,3.014,0,0,0,12.472,5H19a3
        ,3,0,0,1,2.779,1.882L2,6.994V6A3,3,0,0,1,5,3ZM19,21H5a3,3,0,0,1-3-3V8.994l20-.113V18A3,3,0,0,1,19,21Z"/></svg>
        </button>

        {selectedNote ? (
          <div className="main-content">
          <h3 className="noteName">{findNoteById(folders, selectedNote.id)?.name || "Без названия"}</h3>
          <textarea 
            className="note-editor" 
            value={selectedNote.content} 
            onChange={updateNoteContent}
          />
          </div>


          ) : (
            <div className="placeholder">Выберите или создайте заметку</div>
          )}
        </div>


      {contextMenu.visible && (
        <div
          className="context-menu"
          style={{
            top: contextMenu.y,
            left: contextMenu.x,
            position: "absolute",
            background: "#18181B",
            border: "1px solid #ccc",
            boxShadow: "0px 2px 5px rgba(0,0,0,0.2)",
            padding: "5px",
            zIndex: 1000,
          }}
        >
          <button onClick={() => createFolder(contextMenu.targetPath)}>+ Папка</button>
          <button onClick={addNote}>+ Заметка</button>
          <button onClick={renameItem}>✏️ Переименовать</button>
          <button onClick={deleteItem}>🗑️ Удалить</button>
        </div>
      )}
    </div>
  );
}

function ListItem({ folders, path, createFolder, addNote, renameItem, deleteItem, toggleFolders, handleContextMenu, selectNote }) {
  return (
    <ul className="folder-list">
      {folders.map((folder) => (
        <li key={folder.id} className="folder-item" onContextMenu={(e) => handleContextMenu(e, [...path, folder.id])}>
          <div 
            onClick={() => folder.type === "folder" ? toggleFolders(folder.id) : selectNote(folder)}
            style={{ cursor: "pointer" }}
          >
            {folder.type === "folder" ? (folder.collapsed ? 
            <svg className="icons" xmlns="http://www.w3.org/2000/svg" id="Outline" viewBox="0 0 24 24" width="16" height="16" fill="#f8f8f2">
              <path d="M19,3H12.472a1.019,1.019,0,0,1-.447-.1L8.869,1.316A3.014,3.014,0,0,0,7.528,1H5A5.006,5.006,0,0,0,0,6V18a5.006,5.006,0,0,0,5,5H19a5.006,5.006,0,0,0,5-5V8A5.006,5.006,0,0,0,19,3ZM5,3H7.528a1.019,1.019,0,0,1,.447.1l3.156,1.579A3.014,3.014,0,0,0,12.472,5H19a3,3,0,0,1,2.779,1.882L2,6.994V6A3,3,0,0,1,5,3ZM19,21H5a3,3,0,0,1-3-3V8.994l20-.113V18A3,3,0,0,1,19,21Z"/></svg>
            : <svg className="icons" xmlns="http://www.w3.org/2000/svg" id="Layer_1" data-name="Layer 1" viewBox="0 0 24 24" width="16" height="16" fill="#f8f8f2">
              <path d="m23.493,11.017c-.487-.654-1.234-1.03-2.05-1.03h-.443v-1.987c0-2.757-2.243-5-5-5h-5.056c-.154,0-.31-.037-.447-.105l-3.155-1.578c-.414-.207-.878-.316-1.342-.316h-2C1.794,1,0,2.794,0,5v13c0,2.757,2.243,5,5,5h12.558c2.226,0,4.15-1.432,4.802-3.607l1.532-6.116c.234-.782.089-1.605-.398-2.26ZM2,18V5c0-1.103.897-2,2-2h2c.154,0,.31.037.447.105l3.155,1.578c.414.207.878.316,1.342.316h5.056c1.654,0,3,1.346,3,3v1.987h-10.385c-1.7,0-3.218,1.079-3.789,2.72l-2.19,7.138c-.398-.509-.636-1.15-.636-1.845Zm19.964-5.253l-1.532,6.115c-.384,1.279-1.539,2.138-2.874,2.138H5c-.208,0-.411-.021-.607-.062l2.334-7.609c.279-.803,1.039-1.342,1.889-1.342h12.828c.242,0,.383.14.445.224.062.084.156.259.075.536Z"/></svg>
          ) : 
            <svg className="icons" xmlns="http://www.w3.org/2000/svg" id="Outline" viewBox="0 0 24 24" width="16" height="16" fill="#f8f8f2">
              <path d="M18.656.93,6.464,13.122A4.966,4.966,0,0,0,5,16.657V18a1,1,0,0,0,1,1H7.343a4.966,4.966,0,0,0,3.535-1.464L23.07,5.344a3.125,3.125,0,0,0,0-4.414A3.194,3.194,0,0,0,18.656.93Zm3,3L9.464,16.122A3.02,3.02,0,0,1,7.343,17H7v-.343a3.02,3.02,0,0,1,.878-2.121L20.07,2.344a1.148,1.148,0,0,1,1.586,0A1.123,1.123,0,0,1,21.656,3.93Z"/>
              <path d="M23,8.979a1,1,0,0,0-1,1V15H18a3,3,0,0,0-3,3v4H5a3,3,0,0,1-3-3V5A3,3,0,0,1,5,2h9.042a1,1,0,0,0,0-2H5A5.006,5.006,0,0,0,0,5V19a5.006,5.006,0,0,0,5,5H16.343a4.968,4.968,0,0,0,3.536-1.464l2.656-2.658A4.968,4.968,0,0,0,24,16.343V9.979A1,1,0,0,0,23,8.979ZM18.465,21.122a2.975,2.975,0,0,1-1.465.8V18a1,1,0,0,1,1-1h3.925a3.016,3.016,0,0,1-.8,1.464Z"/></svg>
}
 {folder.name}
          </div>

          {!folder.collapsed && folder.children && folder.children.length > 0 && (
            <ListItem
              folders={folder.children}
              path={[...path, folder.id]}
              createFolder={createFolder}
              addNote={addNote}
              renameItem={renameItem}
              deleteItem={deleteItem}
              toggleFolders={toggleFolders}
              handleContextMenu={handleContextMenu}
              selectNote={selectNote}
            />
          )}
        </li>
      ))}
    </ul>
  );
}
