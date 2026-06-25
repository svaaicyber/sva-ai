export const saveChats = (workspaceId, chats) => {
  localStorage.setItem(
    `sva_chats_${workspaceId}`,
    JSON.stringify(chats)
  )
}

export const loadChats = (workspaceId) => {
  const data = localStorage.getItem(`sva_chats_${workspaceId}`)

  return data ? JSON.parse(data) : []
}

export const saveWorkspaces = (workspaces) => {
  localStorage.setItem(
    "sva_workspaces",
    JSON.stringify(workspaces)
  )
}

export const loadWorkspaces = () => {
  const data = localStorage.getItem("sva_workspaces")

  return data
    ? JSON.parse(data)
    : [
        {
          id: 1,
          name: "General",
          icon: "✨",
        },
        {
          id: 2,
          name: "Startup",
          icon: "🚀",
        },
        {
          id: 3,
          name: "Coding",
          icon: "💻",
        },
        {
          id: 4,
          name: "Research",
          icon: "🧠",
        },
      ]
}