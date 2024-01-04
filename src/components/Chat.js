import { useEffect, useState } from "react";
import {
  collection,
  getDocs,
  addDoc,
  serverTimestamp,
  query,
  orderBy,
  onSnapshot,
} from "firebase/firestore";
import { firestore } from "../firebase";
import { Alert, Card, ListGroup } from "react-bootstrap";

const Chat = (props) => {
  const [chats, setChats] = useState([]);
  const [chatMessages, setChatMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [messageToSend, setMessageToSend] = useState("");
  const [currentChatId, setCurrentChatId] = useState();
  const [preAlert, setPreAlert] = useState("");
  const [alertVariant, setAlertVariant] = useState("info");
  const [analyzeMessage, setAnalyzeMessage] = useState(false);
  const [alertAdmin, setAlertAdmin] = useState(false);
  const [sendEmail, setSendEmail] = useState(false);
  const [receiverId, setReceiverId] = useState();

  useEffect(() => {
    getChats();
    getSettings();
  }, []);

  useEffect(() => {
    const unsubscribe = subscribeToMessages(
      currentChatId,
      (updatedMessages) => {
        setChatMessages(updatedMessages);
      }
    );

    // Cleanup function
    return () => unsubscribe();
  }, [currentChatId]);

  const getChats = async () => {
    setChats([]);

    try {
      const chatCollection = await getDocs(collection(firestore, "chats"));
      const chatData = chatCollection.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      setChats(chatData);
      openChat(currentChatId);
    } catch (error) {
      console.error("Error fetching data from Firestore:", error);
    }
  };

  const getSettings = async () => {
    const settingsCollection = collection(firestore, "settings");
    const settingsSnapshot = await getDocs(settingsCollection);

    settingsSnapshot.docs.map((doc) => {
      if (doc.data().type === "emailAlert") {
        setSendEmail(doc.data().value);
      }

      if (doc.data().type === "alertAdmin") {
        setAlertAdmin(doc.data().value);
      }

      if (doc.data().type === "messageAnalysis") {
        setAnalyzeMessage(doc.data().value);
      }
    });
  };

  const openChat = async (chat) => {
    if (chat?.user1Id !== props.user.email) {
      setReceiverId(chat?.user1Id);
    } else {
      setReceiverId(chat?.user2Id);
    }
    setCurrentChatId(chat?.id);
    setLoading(true);

    try {
      const chatMessagesCollection = collection(
        firestore,
        `chats/${chat?.id}/messages`
      );
      const messagesQuery = query(chatMessagesCollection, orderBy("timestamp"));
      const messages = await getDocs(messagesQuery);
      const messagesData = messages.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      setLoading(false);
      setChatMessages(messagesData);
    } catch (error) {
      console.error("Error fetching data from Firestore:", error);

      setLoading(false);
      setChatMessages([]);
    }
  };

  const sendChatMessage = async (chatId, senderId, text) => {
    try {
      const messagesCollection = collection(
        firestore,
        `chats/${chatId}/messages`
      );
      const newMessage = {
        senderId,
        text,
        timestamp: serverTimestamp(),
      };

      await addDoc(messagesCollection, newMessage);

      setChatMessages((prevMessages) => {
        return [...prevMessages, newMessage];
      });

      setMessageToSend("");
    } catch (error) {
      console.error("Error sending message:", error);
    }
  };

  const onChange = (e) => {
    setPreAlert('');
    setMessageToSend(e.target.value);
  };

  const sendMessage = () => {
    if (!analyzeSentiment(messageToSend) && messageToSend) {
      sendChatMessage(currentChatId, props.user.email, messageToSend);
    }
  };

  const subscribeToMessages = (chatId, callback) => {
    const messagesCollection = collection(
      firestore,
      `chats/${chatId}/messages`
    );
    const messagesQuery = query(messagesCollection, orderBy("timestamp"));

    // Subscribe to real-time updates
    const unsubscribe = onSnapshot(messagesQuery, (snapshot) => {
      const messages = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      callback(messages);
    });

    return unsubscribe; // Return the unsubscribe function to stop listening to updates when needed
  };

  const analyzeSentiment = (text) => {
    const vader = require("vader-sentiment");
    const intensity = vader.SentimentIntensityAnalyzer.polarity_scores(text);
    console.log(intensity)
    console.log(alertAdmin)
    if (alertAdmin && intensity && intensity.neg > 0.25) {
      const payload = {
        senderId: props.user.email,
        receiverId: receiverId,
        neg: intensity.neg,
        text: text,
        timestamp: serverTimestamp(),
      };

      if (intensity.neg > 0.5) {
        payload.type = "danger";
      }

      if (intensity.neg > 0.25 && intensity.neg < 0.5) {
        payload.type = "warning";
      }

      console.log(payload)

      sendAlertToAdmin(payload);
    }

    if (sendEmail) {
      // alertViaEmail(text);
    }

    if (analyzeMessage) {
      if (intensity && intensity.neg > 0.5) {
        setAlertVariant("danger");

        setPreAlert(
          "Warning: This message is toxic and can negatively affect the other user."
        );

        return true;
      } else if (intensity && intensity.neg > 0.25 && intensity.neg < 0.5) {
        setAlertVariant("warning");

        setPreAlert(
          "Note: This message may have a negative tone. Consider rephrasing."
        );

        return true;
      }

      setPreAlert("");
      return false;
    }

    return false;
  };

  const sendAlertToAdmin = async (payload) => {
    console.log(payload)
    const alertsCollection = collection(firestore, "alerts");

    await addDoc(alertsCollection, payload);
  };

  const alertViaEmail = async (text) => {
    try {
      const response = await fetch('http://localhost:3001/send-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          to: 'ciocanu.carolina.dev@gmail.com',
          subject: 'Toxicity Alert',
          text: text,
        }),
      });

      if (response.ok) {
        console.log('Email sent successfully!');
      } else {
        console.error('Error sending email:', response.statusText);
      }
    } catch (error) {
      console.error('Error sending email:', error);
    }
  }

  return (
    <div>
      <div className="chat">
        <div className="chat-list">
          <ListGroup>
            {chats?.map((chat) => (
              <ListGroup.Item
                key={chat.id}
                className="d-flex justify-content-center"
                onClick={() => openChat(chat)}
              >
                {chat.id} {" > "}
              </ListGroup.Item>
            ))}
          </ListGroup>
        </div>
        {loading && !currentChatId && <div>Loading Chat...</div>}
        {currentChatId && (
          <div style={{ flex: 1 }} className="px-2">
            <Card className="mb-3">
              <Card.Body>
                <ul style={{ listStyle: "none", padding: 0 }}>
                  {chatMessages?.map((message, index) => (
                    <li
                      key={index}
                      className={`message ${
                        message.senderId === props.user.email ? "right" : "left"
                      }`}
                    >
                      {message.text}
                    </li>
                  ))}
                </ul>
              </Card.Body>
            </Card>
            {preAlert && (
              <Alert variant={alertVariant} className="mb-0">
                {preAlert}
              </Alert>
            )}
            <div className="submit-message-form">
              <input
                type="text"
                className="form-control"
                value={messageToSend}
                onChange={onChange}
                placeholder="Type your message..."
              />
              <button
                className="btn btn-md btn-dark ml-3"
                onClick={sendMessage}
              >
                Send
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Chat;
