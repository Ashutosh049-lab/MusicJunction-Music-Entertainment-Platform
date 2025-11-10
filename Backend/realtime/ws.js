const { WebSocketServer } = require("ws");

function attachWebSocket(server) {
  const wss = new WebSocketServer({ server });
  const rooms = new Map(); // roomId -> Set(ws)

  function joinRoom(ws, roomId) {
    if (!rooms.has(roomId)) rooms.set(roomId, new Set());
    rooms.get(roomId).add(ws);
    ws.roomId = roomId;
    safeSend(ws, { type: "joined", roomId });
  }

  function leaveRoom(ws) {
    const room = rooms.get(ws.roomId);
    if (room) {
      room.delete(ws);
      if (room.size === 0) rooms.delete(ws.roomId);
    }
    ws.roomId = undefined;
  }

  function broadcast(roomId, from, msg) {
    const peers = rooms.get(roomId);
    if (!peers) return;
    for (const peer of peers) {
      if (peer !== from && peer.readyState === 1) safeSend(peer, msg);
    }
  }

  wss.on("connection", (ws) => {
    ws.on("message", (raw) => {
      let msg;
      try { msg = JSON.parse(raw); } catch { return; }
      if (msg.type === "join") return joinRoom(ws, String(msg.roomId || "default"));

      if (!ws.roomId) return;

      if (["offer", "answer", "candidate", "control"].includes(msg.type)) {
        return broadcast(ws.roomId, ws, msg);
      }
    });

    ws.on("close", () => leaveRoom(ws));
  });

  // Lightweight server clock for rough sync (ms precision)
  const interval = setInterval(() => {
    const now = Date.now();
    for (const [roomId, peers] of rooms.entries()) {
      for (const ws of peers) {
        if (ws.readyState === 1) safeSend(ws, { type: "clock", serverTime: now });
      }
    }
  }, 500);

  wss.on("close", () => clearInterval(interval));
}

function safeSend(ws, obj) {
  try { ws.send(JSON.stringify(obj)); } catch {}
}

module.exports = { attachWebSocket };
