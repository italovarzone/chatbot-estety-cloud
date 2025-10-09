// utils/chatStorage.ts

// Nome padrão do arquivo local
const FILE_NAME = "estety_chat_history.json";

// Grava no File System Access API
export async function saveChatToDisk(data: unknown) {
  try {
    const handle = await getFileHandle();
    const writable = await handle.createWritable();
    await writable.write(JSON.stringify(data));
    await writable.close();

    // salva também no localStorage como fallback
    localStorage.setItem("chatHistory", JSON.stringify(data));
    console.log("💾 Chat salvo localmente (FS + localStorage)");
  } catch (err) {
    console.error("Erro ao salvar chat:", err);
  }
}

// Lê o chat salvo
export async function loadChatFromDisk() {
  try {
    const handle = await getFileHandle();
    const file = await handle.getFile();
    const text = await file.text();
    const json = JSON.parse(text);
    return json;
  } catch {
    // fallback para localStorage
    const local = localStorage.getItem("chatHistory");
    return local ? JSON.parse(local) : [];
  }
}

// Helper interno
async function getFileHandle() {
  const root = await navigator.storage.getDirectory();
  let handle;
  try {
    handle = await root.getFileHandle(FILE_NAME);
  } catch {
    handle = await root.getFileHandle(FILE_NAME, { create: true });
  }
  return handle;
}
