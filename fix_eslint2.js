const fs = require('fs');
let c = fs.readFileSync('C:/Users/User/Desktop/H.Masoud/library-system/src/app/chat/page.tsx', 'utf8');

const fetchMsg = \  async function fetchMessages() {
    if (!currentUser) return;
    const { data, error } = await mainSupabase
      .from("workspace_messages")
      .select(\\\
        *,
        app_accounts:sender_id (full_name, role)
      \\\)
      .eq("workspace_id", currentUser.workspace_id)
      .order("created_at", { ascending: true });

    if (!error && data) {
      setMessages(data as unknown as Message[]);
    }
    setIsLoading(false);
  };\;

const scrollToBot = \  function scrollToBottom() {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };\;

// Remove them from where they are
c = c.replace(fetchMsg, '');
c = c.replace(scrollToBot, '');

// Insert them right before the first useEffect
c = c.replace('  useEffect(() => {', fetchMsg + '\\n\\n' + scrollToBot + '\\n\\n  useEffect(() => {');

fs.writeFileSync('C:/Users/User/Desktop/H.Masoud/library-system/src/app/chat/page.tsx', c, 'utf8');
