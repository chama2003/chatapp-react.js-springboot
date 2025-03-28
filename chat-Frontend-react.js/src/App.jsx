import { useState } from "react";

import Chat from "./components/Chat/Chat.jsx"; // Ensure the file name is correct (Chat.js or Chat.jsx)

function App() {
  const [count, setCount] = useState(0);

  return (
    <>
      <Chat />
    </>
  );
}

export default App;
