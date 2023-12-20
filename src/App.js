import { useState } from "react";
import "./App.css";
import "@chatscope/chat-ui-kit-styles/dist/default/styles.min.css";
import {
    MainContainer,
    ChatContainer,
    MessageList,
    Message,
    MessageInput,
    TypingIndicator, Avatar, MessageGroup
} from "@chatscope/chat-ui-kit-react";
import axios from "axios";
import back from "./assets/bg_character_.png";

function App() {
  const [messages, setMessages] = useState([
    {
      message: "Привет я исторический чат бот. Напиши мне описание исторической личности и я найду ее в википедии",
      sentTime: "just now",
      sender: "ЧатБот",
    }
  ]);
  const [isTyping, setIsTyping] = useState(false);

  const handleSend = async (message) => {
   let newMessage = {
      message,
      direction: "outgoing",
      sender: "user"
    };

    const newMessages = [...messages, newMessage];
    setMessages(newMessages);

    let wikipediaUrl = '';
      let dataPerson = ''

    setIsTyping(true);
      const replacedStr = message.replace(/\s/g, "_");
      const url = `http://localhost:8080/${replacedStr}`;
    await processMessageToServer(url).then((data) => {
        wikipediaUrl = scanWikipediaUrl(data.URL)
        dataPerson = data.Person
    });

   await processMessageToServer(`http://localhost:8080/imageWiki/${wikipediaUrl}`).then((data) =>{
        wikipediaUrl = data.URL;
        });
      setMessages([
          ...newMessages,

          {
              message: "Его имя: " + dataPerson,
              imageUrl: wikipediaUrl,
              sender: "HistoryAi",
          },
      ]);
  };
    function scanWikipediaUrl(url) {
        console.log(url)
        const prefix = "https://ru.wikipedia.org/wiki/";
        const startIndex = url.indexOf(prefix) + prefix.length;
        const endIndex = url.length;
        const newUrl = url.slice(startIndex, endIndex);
        return newUrl;
    }

  async function processMessageToServer(url) {
      const resp = await axios.get(url);
      console.log(resp)
      return resp.data;
  }



  return (
      <div className="App">
          <div
              style={{
                  position: "relative",
                  height: "950px",
                  width: "850px",
                  margin: "auto"
              }}
          >
              <MainContainer>
                  <ChatContainer>
                      <MessageList
                          scrollBehavior="smooth"
                          typingIndicator={
                              isTyping ? <TypingIndicator content="ЧатБот пишет"/> : null
                          }
                      >
                          {messages.map((message, i) => {
                              console.log(message);

                              if (message.sender === "user") {
                                  return <Message key={i} model={message}>
                                  </Message>;
                              }else if (message.imageUrl != null){
                                  return <MessageGroup key={i} model={message} >
                                      <Avatar src={back} name="Zoe" width={200} />
                                      <MessageGroup.Messages>
                                          <Message key={i} model={message}/>
                                          <Message>
                                              <Message.ImageContent src={message.imageUrl} alt="Akane avatar" width={200}/>
                                          </Message>

                                      </MessageGroup.Messages>
                                  </MessageGroup>;
                              }
                              return <Message key={i} model={message} avatarPosition="cl">
                              <Avatar src={back} name="Zoe" width={200} />
                              </Message>;
                          })}
                      </MessageList>

                      <MessageInput
                          attachButton={false}
                          placeholder="Напиште сообщение здесь"
                          onSend={handleSend}
                      />
                  </ChatContainer>
              </MainContainer>
          </div>
      </div>
  );
}

export default App;
